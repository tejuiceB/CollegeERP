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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { usePagePermissions } from "../../hooks/usePagePermissions";
import { useLocation } from "react-router-dom";

interface ProgramFormData {
  PROGRAM_ID?: number;
  UNIVERSITY: number | string;
  INSTITUTE: number | string;
  NAME: string;
  CODE: string;
  DURATION_YEARS: number | string;
  LEVEL: string;
  TYPE: string;
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

const ProgramEntryForm: React.FC = () => {
  const [formData, setFormData] = useState<ProgramFormData>({
    UNIVERSITY: "",
    INSTITUTE: "",
    NAME: "",
    CODE: "",
    DURATION_YEARS: "",
    LEVEL: "",
    TYPE: "",
    IS_ACTIVE: true,
  });

  const [universities, setUniversities] = useState<University[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [programs, setPrograms] = useState<ProgramFormData[]>([]);
  const [showList, setShowList] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramFormData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const location = useLocation();
  const { isFormDisabled, can_delete } = usePagePermissions(location.pathname, !!editingProgram);

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (showList) {
      fetchPrograms();
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

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axiosInstance.get("/api/master/program/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) setPrograms(response.data);
    } catch (error) {
      console.error("Error fetching programs:", error);
      setSnackbar({ open: true, message: "Failed to fetch programs", severity: "error" });
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

      await axiosInstance.post("/api/master/program/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setFormData({
        UNIVERSITY: "",
        INSTITUTE: "",
        NAME: "",
        CODE: "",
        DURATION_YEARS: "",
        LEVEL: "",
        TYPE: "",
        IS_ACTIVE: true,
      });
      setInstitutes([]);
      setSnackbar({ open: true, message: "Program created successfully!", severity: "success" });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setSnackbar({ open: true, message: "Failed to create program", severity: "error" });
    }
  };

  const handleEdit = (program: ProgramFormData) => {
    setEditingProgram(program);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram?.PROGRAM_ID) return;

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.put(`/api/master/program/${editingProgram.PROGRAM_ID}/`, editingProgram, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowEditModal(false);
      await fetchPrograms();
      setSnackbar({ open: true, message: "Program updated successfully!", severity: "success" });
    } catch (error) {
      console.error("Error updating program:", error);
      setSnackbar({ open: true, message: "Failed to update program", severity: "error" });
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this program?")) return;

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/api/master/program/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchPrograms();
      setSnackbar({ open: true, message: "Program deleted successfully!", severity: "success" });
    } catch (error) {
      console.error("Error deleting program:", error);
      setSnackbar({ open: true, message: "Failed to delete program", severity: "error" });
    }
  };

  const getUniversityName = (id: number | string) => {
    const university = universities.find((u) => u.UNIVERSITY_ID === Number(id));
    return university?.NAME || "";
  };

  const getInstituteName = (id: number | string) => {
    const institute = institutes.find((i) => i.INSTITUTE_ID === Number(id));
    return institute?.NAME || "N/A";
  };

  return (
    <Card sx={{ p: 3, maxWidth: 1200, margin: "auto", mt: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Program Management
        </Typography>
        <Button variant="contained" onClick={() => setShowList(!showList)}>
          {showList ? "Create Program" : "View Programs"}
        </Button>
      </Box>

      {showList ? (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600, color: "text.secondary" }}>
            Programs List
          </Typography>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Level</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Duration</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {programs.length > 0 ? (
                  programs.map((program) => (
                    <TableRow key={program.PROGRAM_ID} hover>
                      <TableCell>{program.NAME}</TableCell>
                      <TableCell>{program.CODE}</TableCell>
                      <TableCell>{program.LEVEL}</TableCell>
                      <TableCell>{program.TYPE}</TableCell>
                      <TableCell>{program.DURATION_YEARS} Years</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(program)}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(program.PROGRAM_ID)}
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
                        No programs found
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
            Program Registration Form
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
                    {u.NAME} ({u.CODE})
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
                  <MenuItem key={i.INSTITUTE_ID} value={i.INSTITUTE_ID}>
                    {i.NAME}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Program Name"
                name="NAME"
                value={formData.NAME}
                onChange={handleChange}
                required
                variant="outlined"
                placeholder="Program Name"
                disabled={isFormDisabled}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Code"
                name="CODE"
                value={formData.CODE}
                onChange={handleChange}
                required
                variant="outlined"
                placeholder="Code"
                disabled={isFormDisabled}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Duration (Years)"
                name="DURATION_YEARS"
                value={formData.DURATION_YEARS}
                onChange={handleChange}
                required
                variant="outlined"
                disabled={isFormDisabled}
              >
                <MenuItem value="">Select Duration</MenuItem>
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={4}>4</MenuItem>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={6}>6</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Level"
                name="LEVEL"
                value={formData.LEVEL}
                onChange={handleChange}
                required
                variant="outlined"
                disabled={isFormDisabled}
              >
                <MenuItem value="">Select Level</MenuItem>
                <MenuItem value="UG">Undergraduate</MenuItem>
                <MenuItem value="PG">Postgraduate</MenuItem>
                <MenuItem value="DIP">Diploma</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Type"
                name="TYPE"
                value={formData.TYPE}
                onChange={handleChange}
                required
                variant="outlined"
                disabled={isFormDisabled}
              >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="FT">Full Time</MenuItem>
                <MenuItem value="PT">Part Time</MenuItem>
              </TextField>
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
        <DialogTitle>Edit Program</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUpdate} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Program Name"
                  name="NAME"
                  value={editingProgram?.NAME || ""}
                  onChange={(e) => setEditingProgram((prev: any) => ({ ...prev, NAME: e.target.value }))}
                  required
                  variant="outlined"
                  disabled={isFormDisabled}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Code"
                  name="CODE"
                  value={editingProgram?.CODE || ""}
                  onChange={(e) => setEditingProgram((prev: any) => ({ ...prev, CODE: e.target.value }))}
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

export default ProgramEntryForm;
