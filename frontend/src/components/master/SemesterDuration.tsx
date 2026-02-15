import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    MenuItem,
    CircularProgress,
    Chip
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    List as ListIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from "@mui/icons-material";
import axiosInstance from "../../api/axios";
import { usePagePermissions } from "../../hooks/usePagePermissions";
import { useLocation } from "react-router-dom";

interface University {
    UNIVERSITY_ID: number;
    NAME: string;
}

interface Institute {
    INSTITUTE_ID: number;
    NAME?: string;
    CODE: string;
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

interface Semester {
    SEMESTER_ID: number;
    SEMESTER: string;
}

interface SemesterDuration {
    SEMESTER_DURATION_ID: number;
    SEMESTER: string;
    START_DATE: string;
    END_DATE: string;
    IS_ACTIVE: boolean;
}

const SemesterDurationForm = () => {
    const [viewMode, setViewMode] = useState<"form" | "table">("form");
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

    // Data states
    const [universities, setUniversities] = useState<University[]>([]);
    const [institutes, setInstitutes] = useState<Institute[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [years, setYears] = useState<Year[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [semesterDurations, setSemesterDurations] = useState<SemesterDuration[]>([]);

    // Selection states
    const [selectedUniversity, setSelectedUniversity] = useState<string>("");
    const [selectedInstitute, setSelectedInstitute] = useState<string>("");
    const [selectedProgram, setSelectedProgram] = useState<string>("");
    const [selectedBranch, setSelectedBranch] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [selectedSemester, setSelectedSemester] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    // Edit states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SemesterDuration | null>(null);

    const location = useLocation();
    const { isFormDisabled, can_delete } = usePagePermissions(location.pathname, !!editingItem);

    useEffect(() => {
        fetchUniversities();
        if (viewMode === "table") {
            fetchSemesterDurations();
        }
    }, [viewMode]);

    const fetchUniversities = async () => {
        try {
            const response = await axiosInstance.get("/api/master/universities/");
            setUniversities(response.data);
        } catch (error) {
            console.error("Error fetching universities:", error);
        }
    };

    const fetchInstitutes = async (universityId: string) => {
        try {
            const response = await axiosInstance.get(`/api/master/institutes/?university_id=${universityId}`);
            setInstitutes(response.data);
        } catch (error) {
            console.error("Error fetching institutes:", error);
        }
    };

    const fetchPrograms = async (instituteId: string) => {
        try {
            const response = await axiosInstance.get(`/api/master/program/?institute_id=${instituteId}`);
            setPrograms(response.data);
        } catch (error) {
            console.error("Error fetching programs:", error);
        }
    };

    const fetchBranches = async (programId: string) => {
        try {
            const response = await axiosInstance.get(`/api/master/branch/?program_id=${programId}`);
            setBranches(response.data);
        } catch (error) {
            console.error("Error fetching branches:", error);
        }
    };

    const fetchYears = async (branchId: string) => {
        try {
            const response = await axiosInstance.get(`/api/master/year/?branch_id=${branchId}`);
            setYears(response.data);
        } catch (error) {
            console.error("Error fetching years:", error);
        }
    };

    const fetchSemesters = async (yearId: string) => {
        try {
            const response = await axiosInstance.get(`/api/master/semester/?year_id=${yearId}`);
            setSemesters(response.data);
        } catch (error) {
            console.error("Error fetching semesters:", error);
        }
    };

    const fetchSemesterDurations = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/api/master/semester-duration/");
            setSemesterDurations(response.data);
        } catch (error) {
            console.error("Error fetching durations:", error);
            showSnackbar("Failed to fetch records", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUniversityChange = (id: string) => {
        setSelectedUniversity(id);
        setSelectedInstitute("");
        setSelectedProgram("");
        setSelectedBranch("");
        setSelectedYear("");
        setSelectedSemester("");
        setInstitutes([]);
        if (id) fetchInstitutes(id);
    };

    const handleInstituteChange = (id: string) => {
        setSelectedInstitute(id);
        setSelectedProgram("");
        setSelectedBranch("");
        setSelectedYear("");
        setSelectedSemester("");
        setPrograms([]);
        if (id) fetchPrograms(id);
    };

    const handleProgramChange = (id: string) => {
        setSelectedProgram(id);
        setSelectedBranch("");
        setSelectedYear("");
        setSelectedSemester("");
        setBranches([]);
        if (id) fetchBranches(id);
    };

    const handleBranchChange = (id: string) => {
        setSelectedBranch(id);
        setSelectedYear("");
        setSelectedSemester("");
        setYears([]);
        if (id) fetchYears(id);
    };

    const handleYearChange = (id: string) => {
        setSelectedYear(id);
        setSelectedSemester("");
        setSemesters([]);
        if (id) fetchSemesters(id);
    };

    const showSnackbar = (message: string, severity: "success" | "error" = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const semesterText = semesters.find(s => s.SEMESTER_ID === parseInt(selectedSemester))?.SEMESTER || "";

        const payload = {
            SEMESTER: semesterText,
            START_DATE: startDate,
            END_DATE: endDate
        };

        try {
            await axiosInstance.post("/api/master/semester-duration/", payload);
            showSnackbar("Semester duration created successfully!");
            resetForm();
        } catch (error: any) {
            showSnackbar(error.response?.data?.message || "Error creating record", "error");
        }
    };

    const resetForm = () => {
        setSelectedUniversity("");
        setSelectedInstitute("");
        setSelectedProgram("");
        setSelectedBranch("");
        setSelectedYear("");
        setSelectedSemester("");
        setStartDate("");
        setEndDate("");
        setInstitutes([]);
        setPrograms([]);
        setBranches([]);
        setYears([]);
        setSemesters([]);
    };

    const handleEdit = (item: SemesterDuration) => {
        setEditingItem({ ...item });
        setEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingItem) return;
        try {
            await axiosInstance.put(`/api/master/semester-duration/${editingItem.SEMESTER_DURATION_ID}/`, {
                START_DATE: editingItem.START_DATE,
                END_DATE: editingItem.END_DATE
            });
            showSnackbar("Record updated successfully!");
            setEditDialogOpen(false);
            fetchSemesterDurations();
        } catch (error) {
            showSnackbar("Update failed", "error");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                await axiosInstance.delete(`/api/master/semester-duration/${id}/`);
                showSnackbar("Record deleted successfully!");
                fetchSemesterDurations();
            } catch (error) {
                showSnackbar("Delete failed", "error");
            }
        }
    };

    return (
        <Box sx={{ p: 0 }}>
            <Card sx={{ borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "none" }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: "primary.main" }}>
                            Semester Duration Management
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={viewMode === "form" ? <ListIcon /> : <AddIcon />}
                            onClick={() => setViewMode(viewMode === "form" ? "table" : "form")}
                            sx={{ borderRadius: 2 }}
                        >
                            {viewMode === "form" ? "View List" : "Add New"}
                        </Button>
                    </Box>

                    {viewMode === "form" ? (
                        <Box component="form" onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="University"
                                        value={selectedUniversity}
                                        onChange={(e) => handleUniversityChange(e.target.value)}
                                        variant="outlined"
                                        required
                                    >
                                        <MenuItem value="" disabled>Select University</MenuItem>
                                        {universities.map((u) => (
                                            <MenuItem key={u.UNIVERSITY_ID} value={u.UNIVERSITY_ID.toString()}>
                                                {u.NAME}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Institute"
                                        value={selectedInstitute}
                                        onChange={(e) => handleInstituteChange(e.target.value)}
                                        disabled={!selectedUniversity}
                                        variant="outlined"
                                        required
                                    >
                                        <MenuItem value="" disabled>Select Institute</MenuItem>
                                        {institutes.map((i) => (
                                            <MenuItem key={i.INSTITUTE_ID} value={i.INSTITUTE_ID.toString()}>
                                                {i.CODE}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Program"
                                        value={selectedProgram}
                                        onChange={(e) => handleProgramChange(e.target.value)}
                                        disabled={!selectedInstitute}
                                        variant="outlined"
                                        required
                                    >
                                        <MenuItem value="" disabled>Select Program</MenuItem>
                                        {programs.map((p) => (
                                            <MenuItem key={p.PROGRAM_ID} value={p.PROGRAM_ID.toString()}>
                                                {p.NAME}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Branch"
                                        value={selectedBranch}
                                        onChange={(e) => handleBranchChange(e.target.value)}
                                        disabled={!selectedProgram}
                                        variant="outlined"
                                        required
                                    >
                                        <MenuItem value="" disabled>Select Branch</MenuItem>
                                        {branches.map((b) => (
                                            <MenuItem key={b.BRANCH_ID} value={b.BRANCH_ID.toString()}>
                                                {b.NAME}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Year"
                                        value={selectedYear}
                                        onChange={(e) => handleYearChange(e.target.value)}
                                        disabled={!selectedBranch}
                                        variant="outlined"
                                        required
                                    >
                                        <MenuItem value="" disabled>Select Year</MenuItem>
                                        {years.map((y) => (
                                            <MenuItem key={y.YEAR_ID} value={y.YEAR_ID.toString()}>
                                                {y.YEAR}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Semester"
                                        value={selectedSemester}
                                        onChange={(e) => setSelectedSemester(e.target.value)}
                                        disabled={!selectedYear}
                                        variant="outlined"
                                        required
                                    >
                                        <MenuItem value="" disabled>Select Semester</MenuItem>
                                        {semesters.map((s) => (
                                            <MenuItem key={s.SEMESTER_ID} value={s.SEMESTER_ID.toString()}>
                                                {s.SEMESTER}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        label="Start Date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        variant="outlined"
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        label="End Date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        variant="outlined"
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={!selectedSemester || !startDate || !endDate || isFormDisabled}
                                        sx={{
                                            px: 6,
                                            py: 1.5,
                                            borderRadius: 2,
                                            fontWeight: 600,
                                            boxShadow: theme => `0 8px 16px ${theme.palette.primary.light}44`
                                        }}
                                    >
                                        Save Duration
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <TableContainer>
                            {loading ? (
                                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa" }}>Semester</TableCell>
                                            <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa" }}>Start Date</TableCell>
                                            <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa" }}>End Date</TableCell>
                                            <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa" }}>Status</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, bgcolor: "#f8f9fa" }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {semesterDurations.length > 0 ? (
                                            semesterDurations.map((row) => (
                                                <TableRow key={row.SEMESTER_DURATION_ID} hover>
                                                    <TableCell>{row.SEMESTER}</TableCell>
                                                    <TableCell>{row.START_DATE}</TableCell>
                                                    <TableCell>{row.END_DATE}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={row.IS_ACTIVE ? "Active" : "Inactive"}
                                                            color={row.IS_ACTIVE ? "success" : "default"}
                                                            size="small"
                                                            sx={{ fontWeight: 500 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title="Edit">
                                                            <IconButton
                                                                onClick={() => handleEdit(row)}
                                                                color="primary"
                                                                size="small"
                                                                disabled={isFormDisabled}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                onClick={() => handleDelete(row.SEMESTER_DURATION_ID)}
                                                                color="error"
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
                                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                                    No records found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 600 }}>Edit Semester Duration</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Semester"
                            value={editingItem?.SEMESTER || ""}
                            disabled
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            type="date"
                            label="Start Date"
                            value={editingItem?.START_DATE || ""}
                            onChange={(e) => setEditingItem(prev => prev ? { ...prev, START_DATE: e.target.value } : null)}
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            type="date"
                            label="End Date"
                            value={editingItem?.END_DATE || ""}
                            onChange={(e) => setEditingItem(prev => prev ? { ...prev, END_DATE: e.target.value } : null)}
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setEditDialogOpen(false)} startIcon={<CancelIcon />} variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleUpdate} startIcon={<SaveIcon />} variant="contained" color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert severity={snackbar.severity} sx={{ width: "100%", borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SemesterDurationForm;
