import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import {
    Card,
    TextField,
    Button,
    Grid,
    Box,
    Typography,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { usePagePermissions } from "../../hooks/usePagePermissions";
import { useLocation } from "react-router-dom";

interface BranchFormData {
    BRANCH_ID?: number;
    UNIVERSITY: number | string;
    INSTITUTE: number | string;
    PROGRAM: number | string;
    NAME: string;
    CODE: string;
    IS_ACTIVE: boolean;
}

interface University {
    UNIVERSITY_ID: number;
    NAME: string;
}

interface Institute {
    INSTITUTE_ID: number;
    NAME: string;
}

interface Program {
    PROGRAM_ID: number;
    NAME: string;
}

const BranchEntryForm: React.FC = () => {
    const [formData, setFormData] = useState<BranchFormData>({
        UNIVERSITY: "",
        INSTITUTE: "",
        PROGRAM: "",
        NAME: "",
        CODE: "",
        IS_ACTIVE: true,
    });

    const [universities, setUniversities] = useState<University[]>([]);
    const [institutes, setInstitutes] = useState<Institute[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [branches, setBranches] = useState<BranchFormData[]>([]);
    const [showList, setShowList] = useState(false);
    const [editingBranch, setEditingBranch] = useState<BranchFormData | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

    const location = useLocation();
    const { isFormDisabled, can_delete } = usePagePermissions(location.pathname, !!editingBranch);

    useEffect(() => {
        fetchUniversities();
    }, []);

    useEffect(() => {
        if (showList) {
            fetchBranches();
        }
    }, [showList]);

    const fetchUniversities = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const response = await axiosInstance.get("/api/master/universities/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) setUniversities(response.data);
        } catch (error) {
            console.error("Error fetching universities:", error);
        }
    };

    const fetchInstitutes = async (universityId: number) => {
        try {
            setInstitutes([]);
            setPrograms([]);
            const token = localStorage.getItem("token");
            if (!token) return;
            const response = await axiosInstance.get(`/api/master/institutes/?university_id=${universityId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) setInstitutes(response.data);
        } catch (error) {
            console.error("Error fetching institutes:", error);
        }
    };

    const fetchPrograms = async (instituteId: number) => {
        try {
            setPrograms([]);
            const token = localStorage.getItem("token");
            if (!token) return;
            const response = await axiosInstance.get(`/api/master/program/?institute_id=${instituteId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) setPrograms(response.data);
        } catch (error) {
            console.error("Error fetching programs:", error);
        }
    };

    const fetchBranches = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const response = await axiosInstance.get("/api/master/branch/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) setBranches(response.data);
        } catch (error) {
            console.error("Error fetching branches:", error);
            setSnackbar({ open: true, message: "Failed to fetch branches", severity: "error" });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleUniversityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const universityId = Number(e.target.value);
        setFormData((prev) => ({ ...prev, UNIVERSITY: universityId, INSTITUTE: "", PROGRAM: "" }));
        fetchInstitutes(universityId);
    };

    const handleInstituteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const instituteId = Number(e.target.value);
        setFormData((prev) => ({ ...prev, INSTITUTE: instituteId, PROGRAM: "" }));
        fetchPrograms(instituteId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setSnackbar({ open: true, message: "Authentication token is missing. Please log in again.", severity: "error" });
                return;
            }

            await axiosInstance.post("/api/master/branch/", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            setFormData({
                UNIVERSITY: "",
                INSTITUTE: "",
                PROGRAM: "",
                NAME: "",
                CODE: "",
                IS_ACTIVE: true,
            });
            setInstitutes([]);
            setPrograms([]);
            setSnackbar({ open: true, message: "Branch created successfully!", severity: "success" });
        } catch (error: any) {
            console.error("Error submitting form:", error);
            setSnackbar({ open: true, message: "Failed to create branch", severity: "error" });
        }
    };

    const handleEdit = (branch: BranchFormData) => {
        setEditingBranch(branch);
        setShowEditModal(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBranch?.BRANCH_ID) return;

        try {
            const token = localStorage.getItem("token");
            await axiosInstance.put(`/api/master/branch/${editingBranch.BRANCH_ID}/`, editingBranch, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShowEditModal(false);
            await fetchBranches();
            setSnackbar({ open: true, message: "Branch updated successfully!", severity: "success" });
        } catch (error) {
            console.error("Error updating branch:", error);
            setSnackbar({ open: true, message: "Failed to update branch", severity: "error" });
        }
    };

    const handleDelete = async (id: number | undefined) => {
        if (!id) return;
        if (!window.confirm("Are you sure you want to delete this branch?")) return;

        try {
            const token = localStorage.getItem("token");
            await axiosInstance.delete(`/api/master/branch/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchBranches();
            setSnackbar({ open: true, message: "Branch deleted successfully!", severity: "success" });
        } catch (error) {
            console.error("Error deleting branch:", error);
            setSnackbar({ open: true, message: "Failed to delete branch", severity: "error" });
        }
    };

    return (
        <Card sx={{ p: 3, maxWidth: 1200, margin: "auto", mt: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                    Branch Management
                </Typography>
                <Button variant="contained" onClick={() => setShowList(!showList)}>
                    {showList ? "Create Branch" : "View Branches"}
                </Button>
            </Box>

            {showList ? (
                <Box>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600, color: "text.secondary" }}>
                        Branches List
                    </Typography>
                    <TableContainer sx={{ maxHeight: 500 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Branch Code</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Branch Name</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {branches.length > 0 ? (
                                    branches.map((branch) => (
                                        <TableRow key={branch.BRANCH_ID} hover>
                                            <TableCell>{branch.CODE}</TableCell>
                                            <TableCell>{branch.NAME}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={branch.IS_ACTIVE ? "Active" : "Inactive"}
                                                    color={branch.IS_ACTIVE ? "success" : "error"}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Edit">
                                                    <IconButton color="primary" onClick={() => handleEdit(branch)} size="small">
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton color="error" onClick={() => handleDelete(branch.BRANCH_ID)} size="small">
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                            <Typography variant="body2" color="textSecondary">
                                                No branches found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            ) : (
                <form onSubmit={handleSubmit}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, color: "text.secondary" }}>
                        Branch Registration Form
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="University"
                                name="UNIVERSITY"
                                value={formData.UNIVERSITY}
                                onChange={handleUniversityChange}
                                required
                                size="small"
                                disabled={isFormDisabled}
                            >
                                <MenuItem value="">Select University</MenuItem>
                                {universities.map((uni) => (
                                    <MenuItem key={uni.UNIVERSITY_ID} value={uni.UNIVERSITY_ID}>
                                        {uni.NAME}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Institute"
                                name="INSTITUTE"
                                value={formData.INSTITUTE}
                                onChange={handleInstituteChange}
                                required
                                size="small"
                                disabled={isFormDisabled || !formData.UNIVERSITY}
                            >
                                <MenuItem value="">Select Institute</MenuItem>
                                {institutes.map((inst) => (
                                    <MenuItem key={inst.INSTITUTE_ID} value={inst.INSTITUTE_ID}>
                                        {inst.NAME}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Program"
                                name="PROGRAM"
                                value={formData.PROGRAM}
                                onChange={handleChange}
                                required
                                size="small"
                                disabled={isFormDisabled || !formData.INSTITUTE}
                            >
                                <MenuItem value="">Select Program</MenuItem>
                                {programs.map((prog) => (
                                    <MenuItem key={prog.PROGRAM_ID} value={prog.PROGRAM_ID}>
                                        {prog.NAME}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Branch Name"
                                name="NAME"
                                value={formData.NAME}
                                onChange={handleChange}
                                required
                                size="small"
                                disabled={isFormDisabled}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Branch Code"
                                name="CODE"
                                value={formData.CODE}
                                onChange={handleChange}
                                required
                                size="small"
                                disabled={isFormDisabled}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="IS_ACTIVE"
                                        checked={formData.IS_ACTIVE}
                                        onChange={handleChange}
                                        disabled={isFormDisabled}
                                    />
                                }
                                label="Active"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={isFormDisabled}
                                >
                                    Create Branch
                                </Button>
                                <Button variant="outlined" onClick={() => setShowList(!showList)}>
                                    {showList ? "Hide List" : "Show List"}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            )}

            {/* Edit Modal */}
            <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Branch</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Branch Name"
                            name="NAME"
                            value={editingBranch?.NAME || ""}
                            onChange={(e) => setEditingBranch((prev: any) => ({ ...prev, NAME: e.target.value }))}
                            disabled={isFormDisabled}
                        />
                        <TextField
                            fullWidth
                            label="Branch Code"
                            name="CODE"
                            value={editingBranch?.CODE || ""}
                            onChange={(e) => setEditingBranch((prev: any) => ({ ...prev, CODE: e.target.value }))}
                            disabled={isFormDisabled}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={editingBranch?.IS_ACTIVE || false}
                                    onChange={(e) => setEditingBranch((prev: any) => ({ ...prev, IS_ACTIVE: e.target.checked }))}
                                    disabled={isFormDisabled}
                                />
                            }
                            label="Active"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button
                        onClick={async () => {
                            if (!editingBranch) return;
                            try {
                                const token = localStorage.getItem("token");
                                await axiosInstance.put(`/api/master/branch/${editingBranch.BRANCH_ID}/`, editingBranch, {
                                    headers: { Authorization: `Bearer ${token}` },
                                });
                                setShowEditModal(false);
                                fetchBranches();
                                setSnackbar({ open: true, message: "Branch updated successfully!", severity: "success" });
                            } catch (error) {
                                setSnackbar({ open: true, message: "Failed to update branch", severity: "error" });
                            }
                        }}
                        variant="contained"
                        disabled={isFormDisabled}
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Card>
    );
};

export default BranchEntryForm;
