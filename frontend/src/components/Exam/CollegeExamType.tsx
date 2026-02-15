import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  TextField,
  Button,
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
  Grid,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axiosInstance from "../../api/axios";
import { usePagePermissions } from "../../hooks/usePagePermissions";
import { useLocation } from "react-router-dom";

interface CollegeExamType {
  RECORD_ID?: number;
  ACADEMIC_YEAR: number | string;
  UNIVERSITY?: number | string;
  INSTITUTE?: number | string;
  PROGRAM_ID?: number | string;
  EXAM_TYPE: string;
}

interface AcademicYear {
  ACADEMIC_YEAR_ID: number;
  ACADEMIC_YEAR: string;
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
  CODE: string;
}

const CollegeExamTypeForm: React.FC = () => {
  const [formData, setFormData] = useState<CollegeExamType>({
    ACADEMIC_YEAR: "",
    UNIVERSITY: "",
    INSTITUTE: "",
    PROGRAM_ID: "",
    EXAM_TYPE: "",
  });

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [collegeExamTypes, setCollegeExamTypes] = useState<CollegeExamType[]>([]);
  const [showList, setShowList] = useState(false);
  const [editingExamType, setEditingExamType] = useState<CollegeExamType | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const location = useLocation();
  const { isFormDisabled, can_edit, can_delete } = usePagePermissions(location.pathname, !!editingExamType);

  useEffect(() => {
    fetchAcademicYears();
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (showList) {
      fetchCollegeExamTypes();
      fetchPrograms();
    }
  }, [showList]);

  const fetchAcademicYears = async () => {
    try {
      const response = await axiosInstance.get("/api/master/academic-years/");
      if (response.status === 200 && Array.isArray(response.data)) {
        setAcademicYears(response.data);
      }
    } catch (error) {
      console.error("Error fetching academic years:", error);
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await axiosInstance.get("/api/master/universities/");
      if (response.status === 200) setUniversities(response.data);
    } catch (error) {
      console.error("Error fetching universities:", error);
    }
  };

  const fetchInstitutes = async (universityId: number) => {
    try {
      const response = await axiosInstance.get(`/api/master/institutes/?university_id=${universityId}`);
      if (response.status === 200) {
        setInstitutes(response.data);
        setPrograms([]);
        setFormData((prev) => ({ ...prev, INSTITUTE: "", PROGRAM_ID: "" }));
      }
    } catch (error) {
      console.error("Error fetching institutes:", error);
    }
  };

  const fetchPrograms = async (instituteId?: number) => {
    try {
      const url = instituteId ? `/api/master/program/?institute_id=${instituteId}` : `/api/master/program/`;
      const response = await axiosInstance.get(url);
      if (response.status === 200 && Array.isArray(response.data)) {
        setPrograms(response.data);
      } else {
        setPrograms([]);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
      setPrograms([]);
    }
  };

  const fetchCollegeExamTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axiosInstance.get("/api/exam/college-exam-type/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setCollegeExamTypes(response.data);
      }
    } catch (error) {
      console.error("Error fetching college exam types:", error);
      setSnackbar({ open: true, message: "Failed to fetch exam types", severity: "error" });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUniversityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const universityId = Number(e.target.value);
    setFormData((prev) => ({ ...prev, UNIVERSITY: universityId }));
    fetchInstitutes(universityId);
  };

  const handleInstituteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const instituteId = Number(e.target.value);
    setFormData((prev) => ({ ...prev, INSTITUTE: instituteId }));
    fetchPrograms(instituteId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      UNIVERSITY: formData.UNIVERSITY || null,
      INSTITUTE: formData.INSTITUTE || null,
      PROGRAM_ID: formData.PROGRAM_ID || null,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setSnackbar({ open: true, message: "Authentication token is missing. Please log in again.", severity: "error" });
        return;
      }

      await axiosInstance.post("/api/exam/college-exam-type/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setFormData({
        ACADEMIC_YEAR: "",
        UNIVERSITY: "",
        INSTITUTE: "",
        PROGRAM_ID: "",
        EXAM_TYPE: "",
      });
      setInstitutes([]);
      setPrograms([]);
      setSnackbar({ open: true, message: "College Exam Type created successfully!", severity: "success" });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setSnackbar({ open: true, message: "Failed to create exam type", severity: "error" });
    }
  };

  const handleEdit = (examType: CollegeExamType) => {
    setEditingExamType(examType);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExamType?.RECORD_ID) return;

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.put(`/api/exam/college-exam-type/${editingExamType.RECORD_ID}/`, editingExamType, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowEditModal(false);
      await fetchCollegeExamTypes();
      setSnackbar({ open: true, message: "Exam Type updated successfully!", severity: "success" });
    } catch (error) {
      console.error("Error updating exam type:", error);
      setSnackbar({ open: true, message: "Failed to update exam type", severity: "error" });
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this exam type?")) return;

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/api/exam/college-exam-type/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCollegeExamTypes();
      setSnackbar({ open: true, message: "Exam Type deleted successfully!", severity: "success" });
    } catch (error) {
      console.error("Error deleting exam type:", error);
      setSnackbar({ open: true, message: "Failed to delete exam type", severity: "error" });
    }
  };

  const getAcademicYearName = (id: number | string) => {
    const year = academicYears.find((y) => y.ACADEMIC_YEAR_ID === Number(id));
    return year?.ACADEMIC_YEAR || "";
  };

  const getProgramName = (id: number | string) => {
    const program = programs.find((p) => p.PROGRAM_ID === Number(id));
    return program?.NAME || "N/A";
  };

  return (
    <Card sx={{ p: 3, maxWidth: 1200, margin: "auto", mt: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          College Exam Type Management
        </Typography>
        <Button variant="contained" onClick={() => setShowList(!showList)}>
          {showList ? "Add College Exam Type" : "View College Exam Types"}
        </Button>
      </Box>

      {showList ? (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600, color: "text.secondary" }}>
            College Exam Types List
          </Typography>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Academic Year</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Exam Type</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Program</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collegeExamTypes.length > 0 ? (
                  collegeExamTypes.map((examType) => (
                    <TableRow key={examType.RECORD_ID} hover>
                      <TableCell>{getAcademicYearName(examType.ACADEMIC_YEAR)}</TableCell>
                      <TableCell>{examType.EXAM_TYPE}</TableCell>
                      <TableCell>{getProgramName(examType.PROGRAM_ID!)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(examType)}
                            size="small"
                            disabled={isFormDisabled}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(examType.RECORD_ID)}
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
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="textSecondary">
                        No exam types found
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
            College Exam Type Registration Form
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Academic Year"
                name="ACADEMIC_YEAR"
                value={formData.ACADEMIC_YEAR}
                onChange={handleChange}
                required
                variant="outlined"
                disabled={isFormDisabled}
              >
                <MenuItem value="">Select Academic Year</MenuItem>
                {academicYears.map((year) => (
                  <MenuItem key={year.ACADEMIC_YEAR_ID} value={year.ACADEMIC_YEAR_ID}>
                    {year.ACADEMIC_YEAR}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="University"
                name="UNIVERSITY"
                value={formData.UNIVERSITY}
                onChange={handleUniversityChange}
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
                variant="outlined"
                disabled={isFormDisabled || institutes.length === 0}
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
                name="PROGRAM_ID"
                value={formData.PROGRAM_ID}
                onChange={handleChange}
                variant="outlined"
                disabled={isFormDisabled || programs.length === 0}
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
                label="Exam Type"
                name="EXAM_TYPE"
                value={formData.EXAM_TYPE}
                onChange={handleChange}
                required
                variant="outlined"
                placeholder="Enter Exam Type"
                disabled={isFormDisabled}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button type="submit" variant="contained" size="large" disabled={isFormDisabled}>
              Submit
            </Button>
          </Box>
        </Box>
      )}

      {/* Edit Modal */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit College Exam Type</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUpdate} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Exam Type"
                  value={editingExamType?.EXAM_TYPE || ""}
                  onChange={(e) => setEditingExamType((prev) => ({ ...prev!, EXAM_TYPE: e.target.value }))}
                  required
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" disabled={isFormDisabled}>
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

export default CollegeExamTypeForm;
