# Generated by Django 4.2.19 on 2025-02-17 17:17

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_customuser_lock_reason_customuser_permanent_lock'),
    ]

    operations = [
        migrations.CreateModel(
            name='PASSWORD_HISTORY',
            fields=[
                ('PASSWORD_HISTORY_ID', models.AutoField(db_column='PASSWORD_HISTORY_ID', primary_key=True, serialize=False)),
                ('PASSWORD', models.CharField(db_column='PASSWORD', max_length=128)),
                ('CREATED_AT', models.DateTimeField(auto_now_add=True, db_column='CREATED_AT')),
                ('USER', models.ForeignKey(db_column='USER_ID', on_delete=django.db.models.deletion.CASCADE, related_name='password_history', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'PASSWORD_HISTORY',
                'ordering': ['-CREATED_AT'],
            },
        ),
    ]
