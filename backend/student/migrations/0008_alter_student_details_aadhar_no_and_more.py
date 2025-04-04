# Generated by Django 5.1.6 on 2025-04-04 05:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('student', '0007_alter_student_details_admission_quota'),
    ]

    operations = [
        migrations.AlterField(
            model_name='student_details',
            name='AADHAR_NO',
            field=models.CharField(blank=True, db_column='AADHAR_NO', default='', max_length=12, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='ADMISSION_QUOTA',
            field=models.IntegerField(blank=True, db_column='ADMISSION_QUOTA', default=None, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='BANK_ACCOUNT_NO',
            field=models.CharField(blank=True, db_column='BANK_ACCOUNT_NO', default='', max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='BANK_CITY',
            field=models.CharField(blank=True, db_column='BANK_CITY', default='', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='BANK_NAME',
            field=models.CharField(blank=True, db_column='BANK_NAME', default='', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='BRANCH_NAME',
            field=models.CharField(blank=True, db_column='BRANCH_NAME', default='', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='COLLEGE_PREFERENCE',
            field=models.TextField(blank=True, db_column='COLLEGE_PREFERENCE', default='', null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='DRV_LICENSE',
            field=models.CharField(blank=True, db_column='DRV_LICENSE', default='', max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='FATHER_MOB',
            field=models.CharField(blank=True, db_column='FATHER_MOB', default='', max_length=15, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='INCOME',
            field=models.DecimalField(blank=True, db_column='INCOME', decimal_places=2, default=None, max_digits=10, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='LAST_CLG_ADD',
            field=models.CharField(blank=True, db_column='LAST_CLG_ADD', default='', null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='LAST_CLG_ATTEND',
            field=models.CharField(blank=True, db_column='LAST_CLG_ATTEND', default='', max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='LAST_CLG_CITY',
            field=models.CharField(blank=True, db_column='LAST_CLG_CITY', default='', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='LAST_CLG_ROLL',
            field=models.CharField(blank=True, db_column='LAST_CLG_ROLL', default='', max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='LAST_CLG_UNIV',
            field=models.CharField(blank=True, db_column='LAST_CLG_UNIV', default='', max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='MEDIUM',
            field=models.CharField(blank=True, db_column='MEDIUM', default='', max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='MERIT',
            field=models.DecimalField(blank=True, db_column='MERIT', decimal_places=2, default=None, max_digits=6, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='MONTH_OF_PASSING',
            field=models.CharField(blank=True, db_column='MONTH_OF_PASSING', default='', max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='MOTHER_MOB',
            field=models.CharField(blank=True, db_column='MOTHER_MOB', default='', max_length=15, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='NATIONALITY',
            field=models.CharField(blank=True, db_column='NATIONALITY', default='INDIAN', max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='PAN_NO',
            field=models.CharField(blank=True, db_column='PAN_NO', default='', max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='PARENT_MAIL',
            field=models.EmailField(blank=True, db_column='PARENT_MAIL', default='', max_length=254, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='PCM_MARKS',
            field=models.DecimalField(blank=True, db_column='PCM_MARKS', decimal_places=2, default=None, max_digits=6, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='PCM_OUTOF',
            field=models.DecimalField(blank=True, db_column='PCM_OUTOF', decimal_places=2, default=None, max_digits=6, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='PLACE_OF_BIRTH',
            field=models.CharField(blank=True, db_column='PLACE_OF_BIRTH', default='', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='QUALIFYING_EXAM',
            field=models.CharField(blank=True, db_column='QUALIFYING_EXAM', default='', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='SCORE',
            field=models.DecimalField(blank=True, db_column='SCORE', decimal_places=2, default=None, max_digits=6, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='TOT_MARKS_OBTAIN',
            field=models.DecimalField(blank=True, db_column='TOT_MARKS_OBTAIN', decimal_places=2, default=None, max_digits=6, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='TOT_MAX_MARKS',
            field=models.DecimalField(blank=True, db_column='TOT_MAX_MARKS', decimal_places=2, default=None, max_digits=6, null=True),
        ),
        migrations.AlterField(
            model_name='student_details',
            name='YEAR_OF_PASSING',
            field=models.IntegerField(blank=True, db_column='YEAR_OF_PASSING', default=None, null=True),
        ),
    ]
