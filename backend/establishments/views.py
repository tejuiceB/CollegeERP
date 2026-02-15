from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django.core.mail import send_mail
from django.conf import settings
from utils.id_generators import generate_employee_id, generate_password
from accounts.models import CustomUser, DESIGNATION
from accounts.permissions import HasFormPermission
from .models import TYPE_MASTER, STATUS_MASTER, SHIFT_MASTER, EMPLOYEE_MASTER, EMPLOYEE_QUALIFICATION
from .serializers import TypeMasterSerializer, StatusMasterSerializer, ShiftMasterSerializer, EmployeeMasterSerializer, EmployeeQualificationSerializer
import logging
from django.utils import timezone
from django.db.models import Q
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.http import Http404
import os
from datetime import datetime

logger = logging.getLogger(__name__)

class EmployeeMasterTableView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        master_tables = [
            {
                "name": "type", 
                "display_name": "Employee Type Master", 
                "endpoint": "/api/establishment/type/"  # Updated endpoint
            },
            {
                "name": "status", 
                "display_name": "Employee Status Master", 
                "endpoint": "/api/establishment/status/"  # Updated endpoint
            },
            {
                "name": "shift", 
                "display_name": "Employee Shift Master", 
                "endpoint": "/api/establishment/shift/"  # Updated endpoint
            }
        ]
        logger.debug(f"Returning employee master tables: {master_tables}")
        return Response(master_tables)

class BaseMasterViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]  # Require authentication

    def get_username(self):
        if self.request.user and self.request.user.is_authenticated:
            # Use USERNAME or USER_ID based on what's available/preferred
            return getattr(self.request.user, 'USERNAME', str(self.request.user))
        return 'SYSTEM'

    def perform_create(self, serializer):
        try:
            username = self.get_username()
            logger.debug(f"Using username for create: {username}")
            serializer.save(CREATED_BY=username, UPDATED_BY=username)
        except Exception as e:
            logger.error(f"Error in perform_create: {str(e)}")
            raise

    def perform_update(self, serializer):
        try:
            username = self.get_username()
            logger.debug(f"Using username for update: {username}")
            serializer.save(UPDATED_BY=username)
        except Exception as e:
            logger.error(f"Error in perform_update: {str(e)}")
            raise

    def perform_destroy(self, instance):
        try:
            username = self.get_username()
            instance.IS_DELETED = True
            instance.DELETED_AT = timezone.now()
            instance.DELETED_BY = username
            instance.save()
        except Exception as e:
            logger.error(f"Error in perform_destroy: {str(e)}")
            raise

class TypeMasterViewSet(BaseMasterViewSet):
    permission_classes = [IsAuthenticated, HasFormPermission]
    menu_item_path = '/dashboard/employee'
    queryset = TYPE_MASTER.objects.all()
    serializer_class = TypeMasterSerializer

    def get_queryset(self):
        return self.queryset.filter(IS_DELETED=False)

    def update(self, request, *args, **kwargs):
        logger.debug(f"Update request data: {request.data}")
        instance = self.get_object()
        logger.debug(f"Updating instance: {instance.ID}")
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        logger.debug(f"Updated data: {serializer.data}")
        return Response(serializer.data)

class StatusMasterViewSet(BaseMasterViewSet):
    permission_classes = [IsAuthenticated, HasFormPermission]
    menu_item_path = '/dashboard/employee'
    queryset = STATUS_MASTER.objects.all()
    serializer_class = StatusMasterSerializer

    def get_queryset(self):
        return self.queryset.filter(IS_DELETED=False)

class ShiftMasterViewSet(BaseMasterViewSet):
    permission_classes = [IsAuthenticated, HasFormPermission]
    menu_item_path = '/dashboard/employee'
    queryset = SHIFT_MASTER.objects.all()
    serializer_class = ShiftMasterSerializer

    def get_queryset(self):
        return self.queryset.filter(IS_DELETED=False)

class EmployeeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, HasFormPermission]
    menu_item_path = '/dashboard/establishment/employeedetails'
    serializer_class = EmployeeMasterSerializer
    queryset = EMPLOYEE_MASTER.objects.filter(IS_DELETED=False)
    lookup_field = 'EMPLOYEE_ID'
    lookup_url_kwarg = 'pk'  # Add this line to map 'pk' from URL to 'EMPLOYEE_ID'

    def get_username(self):
        if self.request.user and self.request.user.is_authenticated:
            return getattr(self.request.user, 'USERNAME', str(self.request.user))
        return 'SYSTEM'

    def create(self, request, *args, **kwargs):
        try:
            logger.info("=== Starting Employee Creation Process ===")
            
            # 1. Generate IDs first
            designation_id = request.data.get('DESIGNATION')
            designation_obj = DESIGNATION.objects.get(DESIGNATION_ID=designation_id)
            employee_id = generate_employee_id(designation_obj.NAME)
            password = generate_password(8)
            
            # 2. Create a new dict for employee data instead of copying request.data
            employee_data = {}
            
            # 3. Add all form fields except files
            for key in request.data.keys():
                if key != 'PROFILE_IMAGE':  # Skip file field
                    employee_data[key] = request.data.get(key)

            # 4. Add generated ID and active status
            employee_data['EMPLOYEE_ID'] = employee_id
            employee_data['IS_ACTIVE'] = 'YES'

            # 5. Add file separately if it exists
            if 'PROFILE_IMAGE' in request.FILES:
                employee_data['PROFILE_IMAGE'] = request.FILES['PROFILE_IMAGE']

            # 6. Create and validate
            serializer = self.get_serializer(data=employee_data)
            if not serializer.is_valid():
                logger.error("Validation errors:")
                logger.error(serializer.errors)
                return Response({
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get username for audit
            username = self.get_username()
            employee = serializer.save(CREATED_BY=username, UPDATED_BY=username)

            # 4. Create user with proper password hashing
            try:
                username_field = request.data.get('EMAIL').split('@')[0]
                user = CustomUser.objects.create(
                    USER_ID=employee_id,
                    USERNAME=username_field,
                    EMAIL=request.data.get('EMAIL'),
                    IS_ACTIVE=True,
                    IS_STAFF=False,
                    IS_SUPERUSER=False,
                    DESIGNATION=designation_obj,
                    FIRST_NAME=request.data.get('EMP_NAME')
                )
                user.set_password(password)
                user.save()
                
                logger.info(f"User created with ID: {user.USER_ID}")

                # 5. Send welcome email
                email_subject = "Your College ERP Account Credentials"
                email_message = f"""
                Dear {request.data.get('EMP_NAME')},

                Your College ERP account has been created. Here are your login credentials:

                Employee ID: {employee_id}
                Username: {username_field}
                Password: {password}

                Please change your password after first login.

                Best regards,
                College ERP Team
                """

                # Send email in background or handle failure gracefully? 
                # For now keeping it synchronous but wrapped
                try:
                    send_mail(
                        email_subject,
                        email_message,
                        settings.EMAIL_HOST_USER,
                        [user.EMAIL],
                        fail_silently=False,
                    )
                except Exception as email_error:
                    logger.error(f"Failed to send welcome email: {str(email_error)}")

                return Response({
                    'message': 'Employee and user account created successfully',
                    'employee_id': employee_id,
                    'username': username_field
                }, status=status.HTTP_201_CREATED)

            except Exception as user_error:
                employee.delete()  # Rollback employee creation if user creation fails
                logger.error(f"User creation failed: {str(user_error)}")
                raise

        except Exception as e:
            logger.error(f"Error in create process: {str(e)}", exc_info=True)
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('query', '')
        if not query:
            return Response({'error': 'Search query is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Fix the Q objects syntax
        employees = EMPLOYEE_MASTER.objects.filter(
            Q(EMPLOYEE_ID__icontains=query) |
            Q(EMP_NAME__icontains=query) |
            Q(DEPARTMENT__NAME__icontains=query) |
            Q(DESIGNATION__NAME__icontains=query),
            IS_DELETED=False
        ).select_related('DEPARTMENT', 'DESIGNATION')[:10]

        data = [{
            'EMPLOYEE_ID': emp.EMPLOYEE_ID,
            'EMP_NAME': emp.EMP_NAME,
            'DEPARTMENT_NAME': emp.DEPARTMENT.NAME,
            'DESIGNATION_NAME': emp.DESIGNATION.NAME,
        } for emp in employees]

        return Response(data)

    def retrieve(self, request, pk=None):
        try:
            employee = get_object_or_404(EMPLOYEE_MASTER, EMPLOYEE_ID=pk, IS_DELETED=False)
            serializer = self.get_serializer(employee)
            
            # Transform dates to string format if needed
            data = serializer.data
            if data.get('DATE_OF_BIRTH'):
                data['DATE_OF_BIRTH'] = employee.DATE_OF_BIRTH.strftime('%Y-%m-%d')
            if data.get('DATE_OF_JOIN'):
                data['DATE_OF_JOIN'] = employee.DATE_OF_JOIN.strftime('%Y-%m-%d')

            return Response(data)
        except Exception as e:
            return Response(
                {'error': f'Error retrieving employee: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        try:
            obj = queryset.get(EMPLOYEE_ID=self.kwargs['pk'])
            self.check_object_permissions(self.request, obj)
            return obj
        except EMPLOYEE_MASTER.DoesNotExist:
            raise Http404("Employee not found")

    def perform_destroy(self, instance):
        try:
            username = self.get_username()
            instance.IS_DELETED = True
            instance.DELETED_AT = timezone.now()
            instance.DELETED_BY = username
            instance.save()
        except Exception as e:
            logger.error(f"Error in perform_destroy: {str(e)}")
            raise

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            logger.info(f"Updating employee: {instance.EMPLOYEE_ID}")

            # Create a new dict for update data instead of copying request.data
            update_data = {}
            
            # Add all form fields except files and EMPLOYEE_ID
            for key in request.data.keys():
                if key not in ['PROFILE_IMAGE', 'EMPLOYEE_ID']:
                    update_data[key] = request.data.get(key)

            # Handle profile image update if provided
            if 'PROFILE_IMAGE' in request.FILES:
                # Delete old profile image if exists
                if instance.PROFILE_IMAGE:
                    instance.PROFILE_IMAGE.delete(save=False)
                
                # Get new file and extension
                new_image = request.FILES['PROFILE_IMAGE']
                ext = os.path.splitext(new_image.name)[1]
                
                # Set filename to EMPLOYEE_ID + extension
                new_image.name = f"{instance.EMPLOYEE_ID}{ext}"
                update_data['PROFILE_IMAGE'] = new_image

            # Update employee data
            serializer = self.get_serializer(
                instance,
                data=update_data,
                partial=True
            )
            
            if not serializer.is_valid():
                logger.error("Update validation errors:")
                logger.error(serializer.errors)
                return Response({
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get username for audit
            username = self.get_username()
            updated_employee = serializer.save(UPDATED_BY=username)

            return Response({
                'message': 'Employee updated successfully',
                'data': serializer.data
            })

        except Http404:
            return Response({
                'error': 'Employee not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error updating employee: {str(e)}", exc_info=True)
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def by_department(self, request, department_id=None):
        try:
            # Add debug logging
            print(f"Fetching employees for department_id: {department_id}")
            
            employees = EMPLOYEE_MASTER.objects.filter(
                DEPARTMENT_id=department_id,
            ).values('EMPLOYEE_ID')
            
            # Add debug logging
            print(f"Found {len(employees)} employees")
            print("Employee IDs:", [emp['EMPLOYEE_ID'] for emp in employees])
            
            return Response(employees)
        except Exception as e:
            print(f"Error in by_department: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def add_qualification(self, request, pk=None):
        try:
            employee = self.get_object()
            
            # Debug log the incoming data
            logger.debug(f"Received qualification data: {request.data}")
            
            # Add employee ID to the qualification data
            qualification_data = request.data.copy()
            qualification_data['EMPLOYEE'] = employee.EMPLOYEE_ID
            
            # Convert numeric fields
            numeric_fields = ['TOTAL_MARKS', 'OBTAINED_MARKS', 'PERCENTAGE']
            for field in numeric_fields:
                if field in qualification_data:
                    qualification_data[field] = float(qualification_data[field])
            
            # Handle date fields
            date_fields = ['JOINING_DATE_COLLEGE', 'JOINING_DATE_SANSTHA', 
                         'REGISTRATION_DATE', 'VALID_UPTO_DATE', 'PASSING_DATE']
            for field in date_fields:
                if field in qualification_data:
                    if qualification_data[field]:
                        try:
                            # Parse the date string if it's not empty
                            date_obj = datetime.strptime(qualification_data[field], '%Y-%m-%d')
                            qualification_data[field] = date_obj.date()
                        except ValueError:
                            return Response({
                                'error': f'Invalid date format for {field}'
                            }, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        qualification_data[field] = None

            logger.debug(f"Processed qualification data: {qualification_data}")
            
            serializer = EmployeeQualificationSerializer(data=qualification_data)
            if serializer.is_valid():
                username = self.get_username()
                serializer.save(CREATED_BY=username, UPDATED_BY=username)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                logger.error(f"Validation errors: {serializer.errors}")
                return Response({
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error saving qualification: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def qualifications(self, request, pk=None):
        employee = self.get_object()
        qualifications = EMPLOYEE_QUALIFICATION.objects.filter(EMPLOYEE=employee)
        serializer = EmployeeQualificationSerializer(qualifications, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_qualification(self, request, pk=None):
        try:
            employee = self.get_object()
            qualification_id = request.query_params.get('qualification_id')
            qualification = get_object_or_404(
                EMPLOYEE_QUALIFICATION, 
                EMPLOYEE=employee,
                RECORD_ID=qualification_id
            )

            qualification_data = request.data.copy()

            # Convert numeric fields
            numeric_fields = ['TOTAL_MARKS', 'OBTAINED_MARKS', 'PERCENTAGE']
            for field in numeric_fields:
                if field in qualification_data:
                    # Only convert if value is not None and not empty string
                    if qualification_data[field] is not None and qualification_data[field] != '':
                        try:
                            qualification_data[field] = float(qualification_data[field])
                        except (ValueError, TypeError):
                            qualification_data[field] = None # set to None if invalid?
                    else:
                         qualification_data[field] = None
            
            # Handle date fields
            date_fields = ['JOINING_DATE_COLLEGE', 'JOINING_DATE_SANSTHA', 
                         'REGISTRATION_DATE', 'VALID_UPTO_DATE', 'PASSING_DATE']
            for field in date_fields:
                if field in qualification_data:
                    if qualification_data[field]:
                        try:
                            # Parse the date string if it's not empty
                            date_obj = datetime.strptime(qualification_data[field], '%Y-%m-%d')
                            qualification_data[field] = date_obj.date()
                        except ValueError:
                            # If already a valid date obj or another format, let serializer try
                            pass
                    else:
                        qualification_data[field] = None

            serializer = EmployeeQualificationSerializer(
                qualification, 
                data=qualification_data, 
                partial=True,
                context={'request': request}
            )
            
            if serializer.is_valid():
                username = self.get_username()
                serializer.save(UPDATED_BY=username)
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
