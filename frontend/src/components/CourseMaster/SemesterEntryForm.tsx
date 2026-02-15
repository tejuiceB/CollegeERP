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

interface SemesterFormData {
    SEMESTER_ID?: number;
    UNIVERSITY: number | string;
    INSTITUTE: number | string;
    PROGRAM: number | string;
    BRANCH: number | string;
    YEAR: number | string;
    SEMESTER: string;
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

interface Branch {
    BRANCH_ID: number;
    NAME: string;
}

interface Year {
    YEAR_ID: number;
    YEAR: string;
}

const SemesterEntryForm: React.FC = () => {
    const [formData, setFormData] = useState<SemesterFormData>({
        UNIVERSITY: "",
        INSTITUTE: "",
        PROGRAM: "",
        BRANCH: "",
        YEAR: "",
        SEMESTER: "",
        IS_ACTIVE: true,
    });

    const [universities, setUniversities] = useState<University[]>([]);
    const [institutes, setInstitutes] = useState<Institute[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [years, setYears] = useState<Year[]>([]);
    const [semesters, setSemesters] = useState<SemesterFormData[]>([]);
    const [showList, setShowList] = useState(false);
    const [editingSemester, setEditingSemester] = useState<SemesterFormData | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

    const location = useLocation();
    const { isFormDisabled, can_delete } = usePagePermissions(location.pathname, !!editingSemester);

    useEffect(() => {
        fetchUniversities();
    }, []);

    useEffect(() => {
        if (showList) {
            fetchSemesters();
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
            setBranches([]);
            setYears([]);
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
            setBranches([]);
            setYears([]);
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

    const fetchBranches = async (programId: number) => {
        try {
            setBranches([]);
            setYears([]);
            const token = localStorage.getItem("token");
            if (!token) return;
            const response = await axiosInstance.get(`/api/master/branch/?program_id=${programId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) setBranches(response.data);
        } catch (error) {
            console.error("Error fetching branches:", error);
        }
    };

    const fetchYears = async (branchId: number) => {
        try {
            setYears([]);
            const token = localStorage.getItem("token");
            if (!token) return;
            const response = await axiosInstance.get(`/api/master/year/?branch=${branchId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) setYears(response.data);
        } catch (error) {
            console.error("Error fetching years:", error);
        }
    };

    const fetchSemesters = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const response = await axiosInstance.get("/api/master/semester/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) setSemesters(response.data);
        } catch (error) {
            console.error("Error fetching semesters:", error);
            setSnackbar({ open: true, message: "Failed to fetch semesters", severity: "error" });
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
        setFormData((prev) => ({ ...prev, UNIVERSITY: universityId, INSTITUTE: "", PROGRAM: "", BRANCH: "", YEAR: "" }));
        fetchInstitutes(universityId);
    };

    const handleInstituteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const instituteId = Number(e.target.value);
        setFormData((prev) => ({ ...prev, INSTITUTE: instituteId, PROGRAM: "", BRANCH: "", YEAR: "" }));
        fetchPrograms(instituteId);
    };

    const handleProgramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const programId = Number(e.target.value);
        setFormData((prev) => ({ ...prev, PROGRAM: programId, BRANCH: "", YEAR: "" }));
        fetchBranches(programId);
    };

    const handleBranchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const branchId = Number(e.target.value);
        setFormData((prev) => ({ ...prev, BRANCH: branchId, YEAR: "" }));
        fetchYears(branchId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setSnackbar({ open: true, message: "Authentication token is missing. Please log in again.", severity: "error" });
                return;
            }

            await axiosInstance.post("/api/master/semester/", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            setFormData({
                UNIVERSITY: "",
                INSTITUTE: "",
                PROGRAM: "",
                BRANCH: "",
                YEAR: "",
                SEMESTER: "",
                IS_ACTIVE: true,
            });
            setInstitutes([]);
            setPrograms([]);
            setBranches([]);
            setYears([]);
            setSnackbar({ open: true, message: "Semester created successfully!", severity: "success" });
        } catch (error: any) {
            console.error("Error submitting form:", error);
            setSnackbar({ open: true, message: "Failed to create semester", severity: "error" });
        }
    };

    const handleEdit = (semester: SemesterFormData) => {
        setEditingSemester(semester);
        setShowEditModal(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSemester?.SEMESTER_ID) return;

        try {
            const token = localStorage.getItem("token");
            await axiosInstance.put(`/api/master/semester/${editingSemester.SEMESTER_ID}/`, editingSemester, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShowEditModal(false);
            await fetchSemesters();
            setSnackbar({ open: true, message: "Semester updated successfully!", severity: "success" });
        } catch (error) {
            console.error("Error updating semester:", error);
            setSnackbar({ open: true, message: "Failed to update semester", severity: "error" });
        }
    };

    const handleDelete = async (id: number | undefined) => {
        if (!id) return;
        if (!window.confirm("Are you sure you want to delete this semester?")) return;

        try {
            const token = localStorage.getItem("token");
            await axiosInstance.delete(`/api/master/semester/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchSemesters();
            setSnackbar({ open: true, message: "Semester deleted successfully!", severity: "success" });
        } catch (error) {
            console.error("Error deleting semester:", error);
            setSnackbar({ open: true, message: "Failed to delete semester", severity: "error" });
        }
    };

    return (
        <Card sx={{ p: 3, maxWidth: 1200, margin: "auto", mt: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                    Semester Management
                </Typography>
                <Button variant="contained" onClick={() => setShowList(!showList)}>
                    {showList ? "Create Semester" : "View Semesters"}
                </Button>
            </Box>

            {showList ? (
                <Box>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600, color: "text.secondary" }}>
                        Semesters List
                    </Typography>
                    <TableContainer sx={{ maxHeight: 500 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Semester</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {semesters.length > 0 ? (
                                    semesters.map((semester) => (
                                        <TableRow key={semester.SEMESTER_ID} hover>
                                            <TableCell>{semester.SEMESTER}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={semester.IS_ACTIVE ? "Active" : "Inactive"}
                                                    color={semester.IS_ACTIVE ? "success" : "error"}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleEdit(semester)}
                                                        size="small"
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleDelete(semester.SEMESTER_ID)}
                                                        size="small"
                                                        disabled={!can_delete}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                            <Typography variant="body2" color="textSecondary">
                                                No semesters found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            ) : (
                <Box component="form" onSubmit={handleSubmit}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, color: "text.secondary" }}>
                        Semester Registration Form
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="University"
                                name="UNIVERSITY"
                                value={formData.UNIVERSITY}
                                onChange={handleUniversityChange}
                                required
                                variant="outlined"
                                disabled={isFormDisabled}
                            >
                                <MenuItem value="">Select University</MenuItem>
                                {universities.map((u) => (
                                    <MenuItem key={u.UNIVERSITY_ID} value={u.UNIVERSITY_ID}>
                                        {u.NAME}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="Institute"
                                name="INSTITUTE"
                                value={formData.INSTITUTE}
                                onChange={handleInstituteChange}
                                disabled={isFormDisabled || institutes.length === 0}
                                required
                                variant="outlined"
                            >
                                <MenuItem value="">Select Institute</MenuItem>
                                {institutes.map((i) => (
                                    <MenuItem key={i.INSTITUTE_ID} value={i.INSTITUTE_ID}>
                                        {i.NAME}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="Program"
                                name="PROGRAM"
                                value={formData.PROGRAM}
                                onChange={handleProgramChange}
                                disabled={isFormDisabled || programs.length === 0}
                                required
                                variant="outlined"
                            >
                                <MenuItem value="">Select Program</MenuItem>
                                {programs.map((p) => (
                                    <MenuItem key={p.PROGRAM_ID} value={p.PROGRAM_ID}>
                                        {p.NAME}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="Branch"
                                name="BRANCH"
                                value={formData.BRANCH}
                                onChange={handleBranchChange}
                                disabled={isFormDisabled || branches.length === 0}
                                required
                                variant="outlined"
                            >
                                <MenuItem value="">Select Branch</MenuItem>
                                {branches.map((b) => (
                                    <MenuItem key={b.BRANCH_ID} value={b.BRANCH_ID}>
                                        {b.NAME}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="Year"
                                name="YEAR"
                                value={formData.YEAR}
                                onChange={handleChange}
                                disabled={isFormDisabled || years.length === 0}
                                required
                                variant="outlined"
                            >
                                <MenuItem value="">Select Year</MenuItem>
                                {years.map((y) => (
                                    <MenuItem key={y.YEAR_ID} value={y.YEAR_ID}>
                                        {y.YEAR}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Semester"
                                name="SEMESTER"
                                value={formData.SEMESTER}
                                onChange={handleChange}
                                required
                                variant="outlined"
                                placeholder="e.g., 1, 2, 3"
                                disabled={isFormDisabled}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={<Checkbox name="IS_ACTIVE" checked={formData.IS_ACTIVE} onChange={handleChange} disabled={isFormDisabled} />}
                                label="Is Active"
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, textAlign: "center" }}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={isFormDisabled}
                        >
                            Submit
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Edit Modal */}
            <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Semester</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleUpdate} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Semester"
                                    name="SEMESTER"
                                    value={editingSemester?.SEMESTER || ""}
                                    onChange={(e) => setEditingSemester((prev: any) => ({ ...prev, SEMESTER: e.target.value }))}
                                    required
                                    variant="outlined"
                                    disabled={isFormDisabled}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button
                        onClick={handleUpdate}
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

export default SemesterEntryForm;
