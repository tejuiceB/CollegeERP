import logging
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    TYPE_MASTER, 
    STATUS_MASTER, 
    SHIFT_MASTER,
    EMPLOYEE_MASTER,
    EMPLOYEE_QUALIFICATION
)

logger = logging.getLogger(__name__)

User = get_user_model()

class BaseAuditSerializer(serializers.ModelSerializer):
    CREATED_BY_NAME = serializers.SerializerMethodField()
    UPDATED_BY_NAME = serializers.SerializerMethodField()
    DELETED_BY_NAME = serializers.SerializerMethodField()

    def get_system_user_display(self, username):
        """Handle system user display names"""
        system_users = {
            'SYSTEM': 'System',
            'system': 'System',
            None: 'System'
        }
        return system_users.get(username, username)

    def get_user_display_name(self, username):
        # Add debug logs
        logger.debug(f"======= SERIALIZER DEBUG =======")
        logger.debug(f"Getting display name for: {username}")
        logger.debug(f"User type: {type(username)}")
        
        if not username:
            logger.debug("Username is None or empty")
            return 'System'
            
        # First check if it's a system user
        system_name = self.get_system_user_display(username)
        if (system_name != username):
            return system_name

        try:
            user = User.objects.filter(USERNAME=username).first()
            logger.debug(f"Found user: {user}")
            if user:
                logger.debug(f"User USERNAME: {user.USERNAME}")
                return user.USERNAME  # Return USERNAME instead of full name
            logger.debug("No user found, returning original username")
            return username
        except Exception as e:
            logger.debug(f"Error occurred: {str(e)}")
            return username

    def get_CREATED_BY_NAME(self, obj):
        return self.get_user_display_name(obj.CREATED_BY)

    def get_UPDATED_BY_NAME(self, obj):
        return self.get_user_display_name(obj.UPDATED_BY)

    def get_DELETED_BY_NAME(self, obj):
        return self.get_user_display_name(getattr(obj, 'DELETED_BY', None))

    class Meta:
        abstract = True

class TypeMasterSerializer(BaseAuditSerializer):
    class Meta:
        model = TYPE_MASTER
        fields = [
            'ID', 'RECORD_WORD', 
            'CREATED_BY', 'CREATED_BY_NAME', 'CREATED_AT',
            'UPDATED_BY', 'UPDATED_BY_NAME', 'UPDATED_AT',
            'IS_DELETED'
        ]
        read_only_fields = ['ID', 'CREATED_AT', 'UPDATED_AT', 'CREATED_BY_NAME', 'UPDATED_BY_NAME']

class StatusMasterSerializer(BaseAuditSerializer):
    class Meta:
        model = STATUS_MASTER
        fields = [
            'ID', 'RECORD_WORD',
            'CREATED_BY', 'CREATED_BY_NAME', 'CREATED_AT',
            'UPDATED_BY', 'UPDATED_BY_NAME', 'UPDATED_AT',
            'IS_DELETED'
        ]
        read_only_fields = ['ID', 'CREATED_AT', 'UPDATED_AT', 'CREATED_BY_NAME', 'UPDATED_BY_NAME']

class ShiftMasterSerializer(BaseAuditSerializer):
    class Meta:
        model = SHIFT_MASTER
        fields = [
            'ID', 'SHIFT_NAME', 'FROM_TIME', 'TO_TIME',
            'LATE_COMING_TIME', 'EARLY_GOING_TIME',
            'CREATED_BY', 'CREATED_BY_NAME', 'CREATED_AT',
            'UPDATED_BY', 'UPDATED_BY_NAME', 'UPDATED_AT',
            'IS_DELETED'
        ]
        read_only_fields = ['ID', 'CREATED_AT', 'UPDATED_AT', 'CREATED_BY_NAME', 'UPDATED_BY_NAME']

class EmployeeMasterSerializer(BaseAuditSerializer):
    # Add these nested serializers
    DESIGNATION_NAME = serializers.CharField(source='DESIGNATION.NAME', read_only=True)
    DEPARTMENT_NAME = serializers.CharField(source='DEPARTMENT.NAME', read_only=True)

    def validate(self, data):
        # Add back validation for unique fields
        if self.instance is None:  # Only for create, not update
            email = data.get('EMAIL')
            short_code = data.get('SHORT_CODE')
            employee_id = data.get('EMPLOYEE_ID')

            if email and EMPLOYEE_MASTER.objects.filter(EMAIL=email).exists():
                raise serializers.ValidationError({'EMAIL': 'Employee with this email already exists'})
            
            if short_code and EMPLOYEE_MASTER.objects.filter(SHORT_CODE=short_code).exists():
                raise serializers.ValidationError({'SHORT_CODE': 'Employee with this short code already exists'})
            
            if employee_id and EMPLOYEE_MASTER.objects.filter(EMPLOYEE_ID=employee_id).exists():
                raise serializers.ValidationError({'EMPLOYEE_ID': 'Employee with this ID already exists'})

        return data

    class Meta:
        model = EMPLOYEE_MASTER
        fields = '__all__'
        read_only_fields = ['CREATED_AT', 'UPDATED_AT']
        extra_kwargs = {
            # Remove EMPLOYEE_ID from required since it's read-only
            'INSTITUTE': {'required': True},
            'EMP_NAME': {'required': True},
            'EMAIL': {'required': True},
            'DESIGNATION': {'required': True},
            'DEPARTMENT': {'required': True},
            'DATE_OF_JOIN': {'required': False},
            'MOBILE_NO': {'required': False},
            'SEX': {'required': False},
            'CATEGORY': {'required': False},
            'EMP_TYPE': {'required': True},  # Make EMP_TYPE required
            
            # All other fields optional...
            'PERMANENT_ADDRESS': {'required': False},
            # ...rest of optional fields remain the same...
            'PERMANENT_CITY': {'required': False},
            'PERMANENT_PIN': {'required': False},
            'POSITION': {'required': False},
            'DATE_OF_BIRTH': {'required': False},
            'MARITAL_STATUS': {'required': False},
            'STATUS': {'required': False},
            'SHIFT': {'required': False},
            'LOCAL_ADDRESS': {'required': False},
            'PAN_NO': {'required': False},
            'DRIVING_LICENSE_NO': {'required': False},
            'LOCAL_CITY': {'required': False},
            'LOCAL_PIN': {'required': False},
            'BLOOD_GROUP': {'required': False},
            'IS_ACTIVE': {'required': False},
            'PHONE_NO': {'required': False},
            'BANK_ACCOUNT_NO': {'required': False},
            'UAN_NO': {'required': False},
        }

    def validate_email(self, value):
        if value:
            value = value.lower()
            if EMPLOYEE_MASTER.objects.filter(EMAIL=value).exists():
                raise serializers.ValidationError("Email already exists")
        return value

    def validate_mobile_no(self, value):
        if value and EMPLOYEE_MASTER.objects.filter(MOBILE_NO=value).exists():
            raise serializers.ValidationError("Mobile number already exists")
        return value

    # Remove the create method - let the viewset handle EMPLOYEE_ID

class EmployeeQualificationSerializer(BaseAuditSerializer):
    class Meta:
        model = EMPLOYEE_QUALIFICATION
        fields = [
            'RECORD_ID',
            'EMPLOYEE',
            'ORDER_TYPE',
            'EMPLOYEE_TYPE',
            'JOINING_DATE_COLLEGE',
            'JOINING_DATE_SANSTHA',
            'DEGREE',
            'UNIVERSITY_BOARD',
            'COLLEGE_NAME',
            'REGISTRATION_NUMBER',
            'REGISTRATION_DATE',
            'VALID_UPTO_DATE',
            'COUNCIL_NAME',
            'PASSING_DATE',
            'SPECIALIZATION',
            'PASSING_MONTH',
            'PASSING_YEAR',
            'TOTAL_MARKS',
            'OBTAINED_MARKS',
            'PERCENTAGE',
            'DIVISION'
        ]
        read_only_fields = ['RECORD_ID']
        # Add required fields
        extra_kwargs = {
            'EMPLOYEE': {'required': True},
            'ORDER_TYPE': {'required': True},
            'EMPLOYEE_TYPE': {'required': True},
            # Allow skipping these fields for admins (handled in validate)
            'DEGREE': {'required': False},
            'UNIVERSITY_BOARD': {'required': False},
            'COLLEGE_NAME': {'required': False}, 
            'PASSING_DATE': {'required': False},
            'TOTAL_MARKS': {'required': False},
            'OBTAINED_MARKS': {'required': False},
            'DIVISION': {'required': False}
        }

    def validate(self, data):
        # Get user from context
        request = self.context.get('request')
        user = request.user if request else None
        
        # Check if user is admin
        is_admin = False
        if user and user.DESIGNATION:
            is_admin = user.DESIGNATION.CODE in ['SUPERADMIN', 'ADMIN']
            logger.debug(f"User {user.USERNAME} is admin: {is_admin}")

        # If not admin, enforce strict validation
        if not is_admin:
            required_fields = [
                'EMPLOYEE', 'ORDER_TYPE', 'EMPLOYEE_TYPE', 'DEGREE',
                'UNIVERSITY_BOARD', 'COLLEGE_NAME', 'PASSING_DATE',
                'TOTAL_MARKS', 'OBTAINED_MARKS', 'DIVISION'
            ]

            for field in required_fields:
                if field not in data:
                    raise serializers.ValidationError({field: f"{field} is required"})

        # Extract month and year from passing date
        if 'PASSING_DATE' in data and data['PASSING_DATE']:
            passing_date = data['PASSING_DATE']
            data['PASSING_MONTH'] = passing_date.strftime('%b').upper()  # 3-letter month name
            data['PASSING_YEAR'] = passing_date.strftime('%Y')  # 4-digit year
            logger.debug(f"Extracted PASSING_MONTH: {data['PASSING_MONTH']}, PASSING_YEAR: {data['PASSING_YEAR']}")
        elif is_admin:
             # For admins with missing date, we can skip month/year or set to null if model allows
             # Model allows null now, so we don't need to force it.
             pass

        # Validate and calculate percentage
        if 'TOTAL_MARKS' in data and 'OBTAINED_MARKS' in data and data['TOTAL_MARKS'] is not None and data['OBTAINED_MARKS'] is not None:
             # Ensure they are numbers (Decimal or float)
            try:
                total_marks = float(data['TOTAL_MARKS'])
                obtained_marks = float(data['OBTAINED_MARKS'])
                
                # Only validate if not 0 (since 0 might be a placeholder for admins)
                if total_marks > 0:
                    if obtained_marks > total_marks:
                        raise serializers.ValidationError({
                            "OBTAINED_MARKS": "Obtained marks cannot be greater than total marks"
                        })
                    
                    percentage = (obtained_marks / total_marks) * 100
                    data['PERCENTAGE'] = round(percentage, 2)
            except (ValueError, TypeError):
                pass # Allow flexible data for admins if parsing fails? Or just skip calculation

        return data
