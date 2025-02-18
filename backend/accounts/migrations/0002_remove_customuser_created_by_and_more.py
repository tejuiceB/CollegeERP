# Generated by Django 4.2.19 on 2025-02-17 14:00

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='CREATED_BY',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='DELETED_AT',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='DELETED_BY',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='IS_DELETED',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='UPDATED_BY',
        ),
        migrations.AddField(
            model_name='customuser',
            name='OTP_EXPIRY',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='customuser',
            name='date_joined',
            field=models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='groups',
            field=models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='last_login',
            field=models.DateTimeField(blank=True, null=True, verbose_name='last login'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='user_permissions',
            field=models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions'),
        ),
    ]
