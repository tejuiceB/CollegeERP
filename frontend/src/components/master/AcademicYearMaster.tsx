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

interface AcademicYearFormData {
  ACADEMIC_YEAR_ID?: number;
  UNIVERSITY: number | string;
  INSTITUTE: number | string;
  ACADEMIC_YEAR: string;
  START_DATE: string;
  END_DATE: string;
  IS_ACTIVE: boolean;
}

interface University {
  UNIVERSITY_ID: number;
  NAME: string;
  CODE: string;
}

interface Institute {
  INSTITUTE_ID: number;
  CODE: string;
  NAME: string;
}

const AcademicYearMaster: React.FC = () => {
  const [formData, setFormData] = useState<AcademicYearFormData>({
    UNIVERSITY: "",
    INSTITUTE: "",
    ACADEMIC_YEAR: "",
    START_DATE: "",
    END_DATE: "",
    IS_ACTIVE: true,
  });

  const [universities, setUniversities] = useState<University[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearFormData[]>([]);
  const [showList, setShowList] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYearFormData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const location = useLocation();
  const { isFormDisabled, can_delete } = usePagePermissions(location.pathname, !!editingYear);

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (showList) {
      fetchAcademicYears();
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
      setSnackbar({ open: true, message: "Failed to fetch universities", severity: "error" });
    }
  };

  const fetchInstitutes = async (universityId: number) => {
    try {
      setInstitutes([]);
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axiosInstance.get(
        `/api/master/institutes/?university_id=${universityId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) setInstitutes(response.data);
    } catch (error) {
      console.error("Error fetching institutes:", error);
      setSnackbar({ open: true, message: "Failed to fetch institutes", severity: "error" });
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axiosInstance.get("/api/master/academic-years/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) setAcademicYears(response.data);
    } catch (error) {
      console.error("Error fetching academic years:", error);
      setSnackbar({ open: true, message: "Failed to fetch academic years", severity: "error" });
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
    setFormData((prev) => ({ ...prev, UNIVERSITY: universityId, INSTITUTE: "" }));
    fetchInstitutes(universityId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setSnackbar({ open: true, message: "Authentication token is missing. Please log in again.", severity: "error" });
        return;
      }

      await axiosInstance.post("/api/master/academic-years/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setFormData({
        UNIVERSITY: "",
        INSTITUTE: "",
        ACADEMIC_YEAR: "",
        START_DATE: "",
        END_DATE: "",
        IS_ACTIVE: true,
      });
      setInstitutes([]);
      setSnackbar({ open: true, message: "Academic Year created successfully!", severity: "success" });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setSnackbar({ open: true, message: "Failed to create academic year", severity: "error" });
    }
  };

  const handleEdit = (year: AcademicYearFormData) => {
    setEditingYear(year);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingYear?.ACADEMIC_YEAR_ID) return;

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.put(
        `/api/master/academic-years/${editingYear.ACADEMIC_YEAR_ID}/`,
        editingYear,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowEditModal(false);
      await fetchAcademicYears();
      setSnackbar({ open: true, message: "Academic Year updated successfully!", severity: "success" });
    } catch (error) {
      console.error("Error updating academic year:", error);
      setSnackbar({ open: true, message: "Failed to update academic year", severity: "error" });
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this academic year?")) return;

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/api/master/academic-years/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchAcademicYears();
      setSnackbar({ open: true, message: "Academic Year deleted successfully!", severity: "success" });
    } catch (error) {
      console.error("Error deleting academic year:", error);
      setSnackbar({ open: true, message: "Failed to delete academic year", severity: "error" });
    }
  };

  // Generate academic year options (2025-2035)
  const academicYearOptions = Array.from({ length: 10 }, (_, i) => {
    const startYear = 2025 + i;
    const endYear = startYear + 1;
    return `${startYear}-${endYear}`;
  });

  return (
    <Card sx={{ p: 3, maxWidth: 1200, margin: "auto", mt: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Academic Year Management
        </Typography>
        <Button variant="contained" onClick={() => setShowList(!showList)}>
          {showList ? "Create Academic Year" : "View Academic Years"}
        </Button>
      </Box>

      {showList ? (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600, color: "text.secondary" }}>
            Academic Years List
          </Typography>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Institute</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Academic Year</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {academicYears.length > 0 ? (
                  academicYears.map((year) => (
                    <TableRow key={year.ACADEMIC_YEAR_ID} hover>
                      <TableCell>{year.INSTITUTE}</TableCell>
                      <TableCell>{year.ACADEMIC_YEAR}</TableCell>
                      <TableCell>{year.START_DATE}</TableCell>
                      <TableCell>{year.END_DATE}</TableCell>
                      <TableCell>
                        <Chip
                          label={year.IS_ACTIVE ? "Active" : "Inactive"}
                          color={year.IS_ACTIVE ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(year)}
                            size="small"
                            disabled={isFormDisabled}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(year.ACADEMIC_YEAR_ID)}
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
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="textSecondary">
                        No academic years found
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
            Academic Year Registration Form
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
                onChange={handleChange}
                disabled={isFormDisabled || institutes.length === 0}
                required
                variant="outlined"
              >
                <MenuItem value="">Select Institute</MenuItem>
                {institutes.map((i) => (
                  <MenuItem key={i.INSTITUTE_ID} value={i.CODE}>
                    {i.NAME}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

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
                {academicYearOptions.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                name="START_DATE"
                value={formData.START_DATE}
                onChange={handleChange}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                disabled={isFormDisabled}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                name="END_DATE"
                value={formData.END_DATE}
                onChange={handleChange}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                disabled={isFormDisabled}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="IS_ACTIVE"
                    checked={formData.IS_ACTIVE}
                    onChange={handleChange}
                    disabled={isFormDisabled}
                  />
                }
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
        <DialogTitle>Edit Academic Year</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUpdate} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Academic Year"
                  value={editingYear?.ACADEMIC_YEAR || ""}
                  onChange={(e) =>
                    setEditingYear((prev) => ({ ...prev!, ACADEMIC_YEAR: e.target.value }))
                  }
                  required
                  variant="outlined"
                >
                  {academicYearOptions.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={editingYear?.START_DATE || ""}
                  onChange={(e) =>
                    setEditingYear((prev) => ({ ...prev!, START_DATE: e.target.value }))
                  }
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={editingYear?.END_DATE || ""}
                  onChange={(e) =>
                    setEditingYear((prev) => ({ ...prev!, END_DATE: e.target.value }))
                  }
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editingYear?.IS_ACTIVE || false}
                      onChange={(e) =>
                        setEditingYear((prev) => ({ ...prev!, IS_ACTIVE: e.target.checked }))
                      }
                    />
                  }
                  label="Is Active"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">
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
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default AcademicYearMaster;
