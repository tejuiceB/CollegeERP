from django.db import models
from core.models import AuditModel
import os
from django.conf import settings

def employee_profile_path(instance, filename):
    # Get file extension while preserving case (jpg, JPG, etc.)
    ext = os.path.splitext(filename)[1]
    # Create filename using employee ID
    filename = f"{instance.EMPLOYEE_ID}{ext}"
    return os.path.join('employee_profiles', 'profile_photo', filename)

class TYPE_MASTER(AuditModel):
    ID = models.AutoField(primary_key=True, db_column='ID')
    RECORD_WORD = models.CharField(max_length=100, db_column='RECORD_WORD')

    class Meta:
        db_table = '"ESTABLISHMENT"."TYPE_MASTER"'
        verbose_name = 'Type Master'
        verbose_name_plural = 'Type Masters'

    def __str__(self):
        return f"{self.ID} - {self.RECORD_WORD}"

class STATUS_MASTER(AuditModel):
    ID = models.AutoField(primary_key=True, db_column='ID')
    RECORD_WORD = models.CharField(max_length=100, db_column='RECORD_WORD')

    class Meta:
        db_table = '"ESTABLISHMENT"."STATUS_MASTER"'
        verbose_name = 'Status Master'
        verbose_name_plural = 'Status Masters'

    def __str__(self):
        return f"{self.ID} - {self.RECORD_WORD}"

class SHIFT_MASTER(AuditModel):
    ID = models.AutoField(primary_key=True, db_column='ID')
    SHIFT_NAME = models.CharField(max_length=50, db_column='SHIFT_NAME')
    FROM_TIME = models.TimeField(db_column='FROM_TIME')
    TO_TIME = models.TimeField(db_column='TO_TIME')

    LATE_COMING_TIME = models.TimeField(null=True, blank=True, db_column='LATE_COMING_TIME')
    EARLY_GOING_TIME = models.TimeField(null=True, blank=True, db_column='EARLY_GOING_TIME')

    class Meta:
        db_table = '"ESTABLISHMENT"."SHIFT_MASTER"'
        verbose_name = 'Shift Master'
        verbose_name_plural = 'Shift Masters'

    def __str__(self):
        return f"{self.ID} - {self.SHIFT_NAME}"
    
class EMPLOYEE_MASTER(AuditModel):
    RECORD_ID = models.AutoField(primary_key=True, db_column='RECORD_ID')
    EMPLOYEE_ID = models.CharField(max_length=20, unique=True, db_column='EMPLOYEE_ID')
    INSTITUTE = models.ForeignKey(
        'accounts.INSTITUTE',
        to_field='CODE',  # Keep this as CODE
        on_delete=models.PROTECT,
        db_column='INSTITUTE_CODE'  # Changed column name
    )
    DEPARTMENT = models.ForeignKey(
        'accounts.DEPARTMENT',
        to_field='DEPARTMENT_ID',  # Changed back to ID
        on_delete=models.PROTECT,
        db_column='DEPARTMENT_ID'  # Changed column name
    )
    SHORT_CODE = models.CharField(
        max_length=20, 
        db_column='SHORT_CODE', 
        unique=True, 
        null=True,  # Add this
        blank=True  # Add this
    )
    EMP_TYPE = models.ForeignKey(
        TYPE_MASTER,
        to_field='ID',  # Using ID field
        on_delete=models.PROTECT,
        db_column='EMP_TYPE_ID',
        related_name='employees_type'
    )
    EMP_NAME = models.CharField(max_length=100, db_column='EMP_NAME')
    FATHER_NAME = models.CharField(max_length=100, db_column='FATHER_NAME', null=True, blank=True)
    MOTHER_NAME = models.CharField(max_length=100, db_column='MOTHER_NAME', null=True, blank=True)
    DATE_OF_BIRTH = models.DateField(db_column='DATE_OF_BIRTH', null=True, blank=True)
    DESIGNATION = models.ForeignKey(
        'accounts.DESIGNATION',
        to_field='DESIGNATION_ID',
        on_delete=models.PROTECT,
        db_column='DESIGNATION_ID'
    )
    PERMANENT_ADDRESS = models.TextField(db_column='PERMANENT_ADDRESS', null=True, blank=True)
    EMAIL = models.EmailField(db_column='EMAIL', unique=True)
    LOCAL_ADDRESS = models.TextField(db_column='LOCAL_ADDRESS', null=True, blank=True)
    PAN_NO = models.CharField(max_length=10, db_column='PAN_NO', null=True, blank=True)
    PERMANENT_CITY = models.CharField(max_length=50, db_column='PERMANENT_CITY', null=True, blank=True)
    PERMANENT_PIN = models.CharField(max_length=6, db_column='PERMANENT_PIN', null=True, blank=True)
    
    DRIVING_LICENSE_NO = models.CharField(max_length=20, db_column='DRIVING_LICENSE_NO', null=True, blank=True)
    SEX = models.CharField(max_length=10, db_column='SEX', null=True, blank=True, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ])
    STATUS = models.ForeignKey(
        STATUS_MASTER,
        to_field='ID',
        on_delete=models.PROTECT,
        db_column='STATUS_ID',
        related_name='employees_status',
        null=True, 
        blank=True
    )
    MARITAL_STATUS = models.CharField(max_length=10, db_column='MARITAL_STATUS', null=True, blank=True, choices=[
        ('single', 'Single'),
        ('married', 'Married'),
        ('other', 'Other')
    ])
    DATE_OF_JOIN = models.DateField(db_column='DATE_OF_JOIN', null=True, blank=True)
    LOCAL_CITY = models.CharField(max_length=50, db_column='LOCAL_CITY', null=True, blank=True)
    LOCAL_PIN = models.CharField(max_length=6, db_column='LOCAL_PIN', null=True, blank=True)
    POSITION = models.CharField(max_length=50, db_column='POSITION', default='Employee')
    SHIFT = models.ForeignKey(SHIFT_MASTER, on_delete=models.PROTECT, db_column='SHIFT', null=True, blank=True)
    BLOOD_GROUP = models.CharField(max_length=5, db_column='BLOOD_GROUP', null=True, blank=True)
    IS_ACTIVE = models.CharField(max_length=3, db_column='IS_ACTIVE', default='yes')
    PHONE_NO = models.CharField(max_length=15, db_column='PHONE_NO', null=True, blank=True)
    MOBILE_NO = models.CharField(max_length=15, db_column='MOBILE_NO', null=True, blank=True)
    CATEGORY = models.ForeignKey(
        'accounts.CATEGORY',
        to_field='CATEGORY_ID',
        on_delete=models.PROTECT,
        db_column='CATEGORY_ID',
        null=True, 
        blank=True
    )
    BANK_ACCOUNT_NO = models.CharField(max_length=20, db_column='BANK_ACCOUNT_NO', null=True, blank=True)
    UAN_NO = models.CharField(max_length=20, db_column='UAN_NO', null=True, blank=True)
    PROFILE_IMAGE = models.ImageField(
        upload_to=employee_profile_path,
        null=True,
        blank=True,
        db_column='PROFILE_IMAGE'
    )

    class Meta:
        db_table = '"ESTABLISHMENT"."EMPLOYEE_MASTER"'
        verbose_name = 'Employee Master'
        verbose_name_plural = 'Employee Masters'
        indexes = [
            models.Index(fields=['EMPLOYEE_ID']),  # Add index for EMPLOYEE_ID
            models.Index(fields=['SHORT_CODE']),
            models.Index(fields=['EMAIL']),
            models.Index(fields=['MOBILE_NO']),
        ]

    def __str__(self):
        return f"{self.EMPLOYEE_ID} - {self.EMP_NAME}"

    def save(self, *args, **kwargs):
        # Only keep email and PAN normalization
        if self.EMAIL:
            self.EMAIL = self.EMAIL.lower()
        if self.PAN_NO:
            self.PAN_NO = self.PAN_NO.upper()
        super().save(*args, **kwargs)

class EMPLOYEE_QUALIFICATION(AuditModel):
    RECORD_ID = models.AutoField(primary_key=True, db_column='RECORD_ID')
    EMPLOYEE = models.ForeignKey(
        EMPLOYEE_MASTER,
        to_field='EMPLOYEE_ID',
        on_delete=models.CASCADE,
        db_column='EMPLOYEE_ID',
        related_name='qualifications'
    )
    ORDER_TYPE = models.CharField(max_length=20, db_column='ORDER_TYPE')  # Changed to CharField
    EMPLOYEE_TYPE = models.CharField(max_length=20, db_column='EMPLOYEE_TYPE')
    JOINING_DATE_COLLEGE = models.DateField(db_column='JOINING_DATE_COLLEGE', null=True, blank=True)
    JOINING_DATE_SANSTHA = models.DateField(db_column='JOINING_DATE_SANSTHA', null=True, blank=True)
    DEGREE = models.CharField(max_length=50, db_column='DEGREE', null=True, blank=True)
    UNIVERSITY_BOARD = models.CharField(max_length=200, db_column='UNIVERSITY_BOARD', null=True, blank=True)
    COLLEGE_NAME = models.CharField(max_length=200, db_column='COLLEGE_NAME', null=True, blank=True)
    REGISTRATION_NUMBER = models.CharField(max_length=50, db_column='REGISTRATION_NUMBER', null=True, blank=True)
    REGISTRATION_DATE = models.DateField(db_column='REGISTRATION_DATE', null=True, blank=True)
    VALID_UPTO_DATE = models.DateField(db_column='VALID_UPTO_DATE', null=True, blank=True)
    COUNCIL_NAME = models.CharField(max_length=200, db_column='COUNCIL_NAME', null=True, blank=True)
    PASSING_DATE = models.DateField(db_column='PASSING_DATE', null=True, blank=True)
    SPECIALIZATION = models.CharField(max_length=100, db_column='SPECIALIZATION', null=True, blank=True)
    PASSING_MONTH = models.CharField(max_length=20, db_column='PASSING_MONTH', null=True, blank=True)
    PASSING_YEAR = models.CharField(max_length=4, db_column='PASSING_YEAR', null=True, blank=True)
    TOTAL_MARKS = models.DecimalField(max_digits=10, decimal_places=2, db_column='TOTAL_MARKS', null=True, blank=True)
    OBTAINED_MARKS = models.DecimalField(max_digits=10, decimal_places=2, db_column='OBTAINED_MARKS', null=True, blank=True)
    PERCENTAGE = models.DecimalField(max_digits=5, decimal_places=2, db_column='PERCENTAGE', null=True, blank=True)
    DIVISION = models.CharField(max_length=20, db_column='DIVISION', null=True, blank=True)

    class Meta:
        db_table = '"ESTABLISHMENT"."EMPLOYEE_QUALIFICATION"'
        ordering = ['EMPLOYEE', 'ORDER_TYPE']

    def __str__(self):
        return f"{self.EMPLOYEE.EMPLOYEE_ID} - {self.DEGREE}"

