# Generated by Django 4.2.19 on 2025-02-21 17:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_alter_branch_created_by_alter_branch_updated_by_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='country',
            name='CREATED_BY',
            field=models.CharField(db_column='CREATED_BY', max_length=50),
        ),
        migrations.AlterField(
            model_name='country',
            name='UPDATED_BY',
            field=models.CharField(db_column='UPDATED_BY', max_length=50),
        ),
        migrations.AlterField(
            model_name='state',
            name='CREATED_BY',
            field=models.CharField(db_column='CREATED_BY', max_length=50),
        ),
        migrations.AlterField(
            model_name='state',
            name='UPDATED_BY',
            field=models.CharField(db_column='UPDATED_BY', max_length=50),
        ),
    ]
