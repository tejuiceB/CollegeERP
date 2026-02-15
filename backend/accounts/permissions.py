from rest_framework import permissions
from .models import USER_FORM_PERMISSION, MENU_ITEM_MASTER

class HasFormPermission(permissions.BasePermission):
    """
    Granular permission check for form-based actions.
    Maps DRF actions to internal permission flags:
    - create -> CAN_ADD
    - update, partial_update -> CAN_EDIT
    - destroy -> CAN_DELETE
    - list, retrieve -> CAN_VIEW
    """
    
    def has_permission(self, request, view):
        # Superusers bypass all checks
        if request.user.is_superuser or getattr(request.user, 'IS_SUPERUSER', False):
            return True
            
        action = getattr(view, 'action', None)
        
        # Safe actions that only require authentication
        if action in ['my_permissions', 'menu_items']:
            return True

        # If the view doesn't specify which form it is, we can't check permissions
        path = getattr(view, 'menu_item_path', None)
        if not path:
            return True
            
        # Whitelist viewing master data/dropdowns for all authenticated users
        # This prevents 403s on institutes, departments, types, etc. when loading forms
        if action in ['list', 'retrieve', 'search']:
            return True
            
        try:
            # Normalize path for lookup
            clean_path = path.rstrip('/')
            menu_item = MENU_ITEM_MASTER.objects.filter(PATH__icontains=clean_path).first()
            
            if not menu_item:
                # If path isn't mapped to a menu item, we allow for now or log warning
                return True
                
            permission = USER_FORM_PERMISSION.objects.filter(
                USER=request.user, 
                MENU_ITEM=menu_item
            ).first()
            
            if not permission:
                return False
                
            if action == 'create':
                return permission.CAN_ADD
            elif action in ['update', 'partial_update']:
                return permission.CAN_EDIT
            elif action == 'destroy':
                return permission.CAN_DELETE
            elif action in ['list', 'retrieve', 'search']:
                return permission.CAN_VIEW
                
            # For custom actions, views can define their own logic or we fallback to view
            return permission.CAN_VIEW
            
        except MENU_ITEM_MASTER.DoesNotExist:
            return True # Fallback if menu item hasn't been seeded yet
