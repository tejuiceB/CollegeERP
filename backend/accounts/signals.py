from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser, USER_FORM_PERMISSION, MENU_ITEM_MASTER

@receiver(post_save, sender=CustomUser)
def assign_default_admin_permissions(sender, instance, created, **kwargs):
    if created and instance.DESIGNATION and instance.DESIGNATION.NAME.upper() == 'ADMIN':
        # Default Admin Menu IDs: Create Employee + Student Section sub-items
        # These were identified as [4, 15, 16, 17, 18, 19, 20, 21, 22, 14]
        # We also want to include the parent 'Administration' (2) to ensure the hierarchy works
        default_menu_ids = [2, 3, 4, 14, 15, 16, 17, 18, 19, 20, 21, 22]
        
        for menu_id in default_menu_ids:
            try:
                menu_item = MENU_ITEM_MASTER.objects.get(MENU_ID=menu_id)
                USER_FORM_PERMISSION.objects.get_or_create(
                    USER=instance,
                    MENU_ITEM=menu_item,
                    defaults={
                        'CAN_VIEW': True,
                        'CAN_ADD': True,
                        'CAN_EDIT': True,
                        'CAN_DELETE': True,
                        'CREATED_BY': 'system',
                        'UPDATED_BY': 'system'
                    }
                )
            except MENU_ITEM_MASTER.DoesNotExist:
                pass
