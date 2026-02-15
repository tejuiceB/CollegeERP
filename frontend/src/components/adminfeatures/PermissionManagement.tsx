import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Tooltip,
    Snackbar,
    Alert,
    alpha,
    useTheme
} from "@mui/material";
import {
    Search as SearchIcon,
    Save as SaveIcon,
    Security as SecurityIcon,
    Person as PersonIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon
} from "@mui/icons-material";
import axiosInstance from "../../api/axios";

interface MenuItem {
    MENU_ID: number;
    LABEL: string;
    PARENT_MENU: number | null;
    PATH: string;
    children: MenuItem[];
}

interface User {
    USER_ID: string;
    EMP_NAME: string;
    DEPARTMENT_NAME?: string;
    DESIGNATION_NAME?: string;
    is_superuser?: boolean;
    IS_SUPERUSER?: boolean;
}

interface UserPermission {
    MENU_ITEM: number;
    CAN_VIEW: boolean;
    CAN_ADD: boolean;
    CAN_EDIT: boolean;
    CAN_DELETE: boolean;
}

const PermissionManagement = () => {
    const theme = useTheme();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [permissions, setPermissions] = useState<Record<number, UserPermission>>({});
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            const response = await axiosInstance.get("/api/permissions/menu_items/");
            if (response.data.status === "success") {
                setMenuItems(response.data.data);
            }
        } catch (error) {
            showSnackbar("Failed to fetch menu items", "error");
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            // Using existing search endpoint
            const response = await axiosInstance.get(`/api/establishment/employees/search/?query=${searchQuery}`);
            // Mapping EMPLOYEE_ID to USER_ID as they are functionally same for authentication
            const mappedUsers = response.data.map((emp: any) => ({
                USER_ID: emp.EMPLOYEE_ID,
                EMP_NAME: emp.EMP_NAME,
                DEPARTMENT_NAME: emp.DEPARTMENT?.NAME,
                DESIGNATION_NAME: emp.DESIGNATION?.NAME
            }));
            setUsers(mappedUsers);
        } catch (error) {
            showSnackbar("Failed to search employees", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPermissions = async (userId: string) => {
        try {
            const response = await axiosInstance.get(`/api/permissions/user_permissions/?user_id=${userId}`);
            if (response.data.status === "success") {
                const perms: Record<number, UserPermission> = {};
                response.data.data.forEach((p: any) => {
                    perms[p.MENU_ITEM] = {
                        MENU_ITEM: p.MENU_ITEM,
                        CAN_VIEW: p.CAN_VIEW,
                        CAN_ADD: p.CAN_ADD,
                        CAN_EDIT: p.CAN_EDIT,
                        CAN_DELETE: p.CAN_DELETE
                    };
                });
                setPermissions(perms);
            }
        } catch (error) {
            showSnackbar("Failed to fetch permissions for the user", "error");
        }
    };

    const handleUserToggle = (userId: string) => {
        const currentIndex = selectedUserIds.indexOf(userId);
        const newSelected = [...selectedUserIds];

        if (currentIndex === -1) {
            newSelected.push(userId);
            // If we select a single user, fetch their existing permissions to the grid
            if (newSelected.length === 1) {
                fetchUserPermissions(userId);
            }
        } else {
            newSelected.splice(currentIndex, 1);
        }

        setSelectedUserIds(newSelected);
    };

    const handlePermissionChange = (menuId: number, field: keyof UserPermission) => {
        setPermissions(prev => {
            const current = prev[menuId] || {
                MENU_ITEM: menuId,
                CAN_VIEW: false,
                CAN_ADD: false,
                CAN_EDIT: false,
                CAN_DELETE: false
            };
            return {
                ...prev,
                [menuId]: { ...current, [field]: !current[field] }
            };
        });
    };

    const handleSave = async () => {
        if (selectedUserIds.length === 0) {
            showSnackbar("Please select at least one user", "error");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                user_ids: selectedUserIds,
                permissions: Object.values(permissions).map(p => ({
                    menu_id: p.MENU_ITEM,
                    can_view: p.CAN_VIEW,
                    can_add: p.CAN_ADD,
                    can_edit: p.CAN_EDIT,
                    can_delete: p.CAN_DELETE
                }))
            };

            const response = await axiosInstance.post("/api/permissions/batch_update/", payload);
            if (response.data.status === "success") {
                showSnackbar("Permissions updated successfully", "success");
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Failed to update permissions";
            showSnackbar(msg, "error");
        } finally {
            setSaving(false);
        }
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const flattenMenu = (items: MenuItem[], parentLabel = ""): { item: MenuItem; label: string }[] => {
        let result: { item: MenuItem; label: string }[] = [];
        items.forEach(item => {
            const currentLabel = parentLabel ? `${parentLabel} > ${item.LABEL}` : item.LABEL;
            if (item.PATH) {
                result.push({ item, label: currentLabel });
            }
            if (item.children && item.children.length > 0) {
                result = [...result, ...flattenMenu(item.children, currentLabel)];
            }
        });
        return result;
    };

    const flatMenu = useMemo(() => {
        const fullMenu = flattenMenu(menuItems);

        // Detect if any selected user is an Admin
        const hasAdminSelected = selectedUserIds.some(id => {
            const user = users.find(u => u.USER_ID === id);
            return user?.DESIGNATION_NAME?.toUpperCase() === "ADMIN";
        });

        if (hasAdminSelected) {
            return fullMenu.filter(({ label }) => {
                const upperLabel = label.toUpperCase();
                return (
                    upperLabel.includes("CREATE EMPLOYEE") ||
                    upperLabel.includes("STUDENT SECTION") ||
                    upperLabel.includes("STUDENT MASTER") ||
                    upperLabel.includes("TRANSACTION") // Including Transaction which is a child of Student Section
                );
            });
        }

        return fullMenu;
    }, [menuItems, selectedUserIds, users]);

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <SecurityIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main" }}>
                    Permission Management
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Left column: User selection */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Select Employees
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="Search by ID or Name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Button onClick={handleSearch} disabled={loading}>
                                                {loading ? <CircularProgress size={20} /> : "Search"}
                                            </Button>
                                        </InputAdornment>
                                    )
                                }}
                                sx={{ mb: 3 }}
                            />

                            <Divider sx={{ mb: 2 }} />

                            <List sx={{ maxHeight: 500, overflowY: 'auto' }}>
                                {users.map((user) => (
                                    <ListItem disablePadding key={user.USER_ID} sx={{ mb: 1 }}>
                                        <ListItemButton
                                            selected={selectedUserIds.includes(user.USER_ID)}
                                            onClick={() => handleUserToggle(user.USER_ID)}
                                            sx={{
                                                borderRadius: 2,
                                                "&.Mui-selected": {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    color: "primary.main",
                                                    "&:hover": {
                                                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                                                    }
                                                }
                                            }}
                                        >
                                            <ListItemText
                                                primary={user.EMP_NAME}
                                                secondary={`${user.USER_ID} • ${user.DESIGNATION_NAME || "Employee"}`}
                                                primaryTypographyProps={{ fontWeight: 600 }}
                                            />
                                            {selectedUserIds.includes(user.USER_ID) && (
                                                <CheckCircleIcon color="primary" fontSize="small" />
                                            )}
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                                {users.length === 0 && !loading && (
                                    <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                                        <Typography variant="body2">
                                            {searchQuery ? "No employees found" : "Search to start"}
                                        </Typography>
                                    </Box>
                                )}
                            </List>

                            {selectedUserIds.length > 0 && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Selected: {selectedUserIds.length} users
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                        {selectedUserIds.map(id => (
                                            <Chip
                                                key={id}
                                                label={id}
                                                size="small"
                                                onDelete={() => handleUserToggle(id)}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right column: Permission grid */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Grant Access
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    onClick={handleSave}
                                    disabled={selectedUserIds.length === 0 || saving}
                                    sx={{
                                        borderRadius: 2,
                                        px: 3,
                                        boxShadow: theme.palette.mode === 'light' ? `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}` : 'none'
                                    }}
                                >
                                    Save Permissions
                                </Button>
                            </Box>

                            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.background.default, 0.8) }}>Module / Form</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.background.default, 0.8) }}>View</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.background.default, 0.8) }}>Add</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.background.default, 0.8) }}>Edit</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.background.default, 0.8) }}>Delete</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {flatMenu.map(({ item, label }) => (
                                            <TableRow key={item.MENU_ID} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {label}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Checkbox
                                                        checked={permissions[item.MENU_ID]?.CAN_VIEW || false}
                                                        onChange={() => handlePermissionChange(item.MENU_ID, 'CAN_VIEW')}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Checkbox
                                                        checked={permissions[item.MENU_ID]?.CAN_ADD || false}
                                                        onChange={() => handlePermissionChange(item.MENU_ID, 'CAN_ADD')}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Checkbox
                                                        checked={permissions[item.MENU_ID]?.CAN_EDIT || false}
                                                        onChange={() => handlePermissionChange(item.MENU_ID, 'CAN_EDIT')}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Checkbox
                                                        checked={permissions[item.MENU_ID]?.CAN_DELETE || false}
                                                        onChange={() => handlePermissionChange(item.MENU_ID, 'CAN_DELETE')}
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05), border: `1px dashed ${theme.palette.warning.main}`, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <WarningIcon color="warning" fontSize="small" />
                                    <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
                                        Hierarchy Note:
                                    </Typography>
                                </Box>
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Superadmins always maintain full access. Changes will not affect their profiles. Admins can only be managed by other Superadmins.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: 2, minWidth: 250 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PermissionManagement;
