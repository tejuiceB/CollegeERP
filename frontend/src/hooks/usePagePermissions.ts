import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";

export interface PagePermissions {
    can_add: boolean;
    can_edit: boolean;
    can_delete: boolean;
    can_view: boolean;
    isSuperuser: boolean;
}

export const usePagePermissions = (menuPath: string, isEditing: boolean = false) => {
    const [pagePermissions, setPagePermissions] = useState<PagePermissions>({
        can_add: false,
        can_edit: false,
        can_delete: false,
        can_view: false,
        isSuperuser: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const userStr = localStorage.getItem("user");
                const user = userStr ? JSON.parse(userStr) : null;

                // Superuser bypass
                if (user?.is_superuser || user?.IS_SUPERUSER) {
                    setPagePermissions({
                        can_add: true,
                        can_edit: true,
                        can_delete: true,
                        can_view: true,
                        isSuperuser: true
                    });
                    setLoading(false);
                    return;
                }

                // Call my_permissions endpoint
                const response = await axiosInstance.get("/api/permissions/my_permissions/");
                if (response.data.status === "success" && Array.isArray(response.data.data)) {
                    // Normalize the input path for matching
                    const cleanMenuPath = menuPath.replace(/\/$/, '');

                    const perm = response.data.data.find((p: any) => {
                        const cleanPath = p.menu_path ? p.menu_path.replace(/\/$/, '') : '';
                        return cleanPath === cleanMenuPath;
                    });

                    if (perm) {
                        setPagePermissions({
                            can_add: perm.can_add,
                            can_edit: perm.can_edit,
                            can_delete: perm.can_delete,
                            can_view: perm.can_view,
                            isSuperuser: false
                        });
                    }
                }
            } catch (error) {
                console.error(`Failed to fetch permissions for ${menuPath}:`, error);
            } finally {
                setLoading(false);
            }
        };

        if (menuPath) {
            fetchPermissions();
        } else {
            setLoading(false);
        }
    }, [menuPath]);

    // Derive form disabled state
    // Form is disabled if: Not a superuser AND (if editing, lack can_edit; if adding, lack can_add)
    const isFormDisabled = !pagePermissions.isSuperuser && (
        isEditing ? !pagePermissions.can_edit : !pagePermissions.can_add
    );

    return {
        ...pagePermissions,
        isFormDisabled,
        loading
    };
};
