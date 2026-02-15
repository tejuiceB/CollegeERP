from django.db import models
from core.models import AuditModel
from accounts.models import BRANCH, PROGRAM

class ACADEMIC_YEAR(AuditModel):
    ACADEMIC_YEAR_ID = models.AutoField(primary_key=True, db_column='ACADEMIC_YEAR_ID')
    ACADEMIC_YEAR = models.CharField(max_length=50, db_column='YEAR', null=True)
    START_DATE = models.DateField(db_column='START_DATE')
    END_DATE = models.DateField(db_column='END_DATE')
    UNIVERSITY = models.CharField(max_length=50, db_column='UNIVERSITY_ID', null=True)
    INSTITUTE = models.CharField(max_length=50, db_column='INSTITUTE_ID', null=True)
    IS_ACTIVE = models.BooleanField(default=True, db_column='IS_ACTIVE')

    class Meta:
        db_table = '"ACADEMIC"."ACADEMIC_YEARS"'
        verbose_name = 'Academic Year'
        verbose_name_plural = 'Academic Years'

    def __str__(self):
        return self.ACADEMIC_YEAR or "Unnamed Year"


class ACADEMIC_TERM(AuditModel):
    ACADEMIC_TERM_ID = models.AutoField(primary_key=True, db_column='ACADEMIC_TERM_ID')
    ACADEMIC_YEAR = models.ForeignKey(
        ACADEMIC_YEAR,
        on_delete=models.PROTECT,
        db_column='ACADEMIC_YEAR_ID',
        related_name='terms'
    )
    NAME = models.CharField(max_length=50, db_column='NAME')  # e.g., "Fall", "Spring"
    CODE = models.CharField(max_length=20, db_column='CODE')  # e.g., "2023-1", "2023-2"
    START_DATE = models.DateField(db_column='START_DATE')
    END_DATE = models.DateField(db_column='END_DATE')
    IS_ACTIVE = models.BooleanField(default=True, db_column='IS_ACTIVE')

    class Meta:
        db_table = '"ACADEMIC"."ACADEMIC_TERMS"'
        verbose_name = 'Academic Term'
        verbose_name_plural = 'Academic Terms'
        unique_together = ['ACADEMIC_YEAR', 'CODE']

    def __str__(self):
        return f"{self.ACADEMIC_YEAR.ACADEMIC_YEAR} - {self.NAME}"

class COURSE(AuditModel):
    COURSE_ID = models.AutoField(primary_key=True, db_column='COURSE_ID')
    CODE = models.CharField(max_length=20, unique=True, db_column='CODE')
    NAME = models.CharField(max_length=255, db_column='NAME')
    DESCRIPTION = models.TextField(null=True, blank=True, db_column='DESCRIPTION')
    CREDITS = models.DecimalField(max_digits=4, decimal_places=2, db_column='CREDITS')
    LECTURE_HOURS = models.IntegerField(db_column='LECTURE_HOURS')
    LAB_HOURS = models.IntegerField(default=0, db_column='LAB_HOURS')
    TUTORIAL_HOURS = models.IntegerField(default=0, db_column='TUTORIAL_HOURS')
    IS_ACTIVE = models.BooleanField(default=True, db_column='IS_ACTIVE')

    class Meta:
        db_table = '"ACADEMIC"."COURSES"'
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'

    def __str__(self):
        return f"{self.CODE} - {self.NAME}"

class CURRICULUM(AuditModel):
    CURRICULUM_ID = models.AutoField(primary_key=True, db_column='CURRICULUM_ID')
    BRANCH = models.ForeignKey(BRANCH, on_delete=models.PROTECT, db_column='BRANCH_ID')
    PROGRAM = models.ForeignKey(PROGRAM, on_delete=models.PROTECT, db_column='PROGRAM_ID')
    ACADEMIC_YEAR = models.ForeignKey(ACADEMIC_YEAR, on_delete=models.PROTECT, db_column='ACADEMIC_YEAR_ID')
    COURSE = models.ForeignKey(COURSE, on_delete=models.PROTECT, db_column='COURSE_ID')
    SEMESTER = models.IntegerField(db_column='SEMESTER')
    IS_ELECTIVE = models.BooleanField(default=False, db_column='IS_ELECTIVE')
    IS_ACTIVE = models.BooleanField(default=True, db_column='IS_ACTIVE')

    class Meta:
        db_table = '"ACADEMIC"."CURRICULUM"'
        verbose_name = 'Curriculum'
        verbose_name_plural = 'Curricula'
        unique_together = ['BRANCH', 'PROGRAM', 'ACADEMIC_YEAR', 'COURSE', 'SEMESTER']

    def __str__(self):
        return f"{self.PROGRAM.CODE}-{self.BRANCH.CODE}-{self.COURSE.CODE}"

class EXAMINATION(AuditModel):
    EXAMINATION_ID = models.AutoField(primary_key=True, db_column='EXAMINATION_ID')
    ACADEMIC_TERM = models.ForeignKey(ACADEMIC_TERM, on_delete=models.PROTECT, db_column='ACADEMIC_TERM_ID')
    NAME = models.CharField(max_length=255, db_column='NAME')
    CODE = models.CharField(max_length=20, unique=True, db_column='CODE')
    EXAM_TYPE = models.CharField(
        max_length=20,
        choices=[
            ('INTERNAL', 'Internal Assessment'),
            ('MIDTERM', 'Mid Term'),
            ('ENDTERM', 'End Term'),
            ('PRACTICAL', 'Practical'),
            ('VIVA', 'Viva Voce')
        ],
        db_column='EXAM_TYPE'
    )
    START_DATE = models.DateField(db_column='START_DATE')
    END_DATE = models.DateField(db_column='END_DATE')
    MAX_MARKS = models.DecimalField(max_digits=5, decimal_places=2, db_column='MAX_MARKS')
    PASSING_MARKS = models.DecimalField(max_digits=5, decimal_places=2, db_column='PASSING_MARKS')
    IS_ACTIVE = models.BooleanField(default=True, db_column='IS_ACTIVE')

    class Meta:
        db_table = '"ACADEMIC"."EXAMINATIONS"'
        verbose_name = 'Examination'
        verbose_name_plural = 'Examinations'

    def __str__(self):
        return f"{self.ACADEMIC_TERM} - {self.NAME}"
