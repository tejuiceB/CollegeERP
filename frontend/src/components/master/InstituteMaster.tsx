import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axiosInstance from "../../api/axios";

import { usePagePermissions } from "../../hooks/usePagePermissions";
import { useLocation } from "react-router-dom";

interface InstituteFormData {
  INSTITUTE_ID?: number;
  UNIVERSITY: number;
  NAME: string;
  CODE: string;
  ADDRESS: string;
  CONTACT_NUMBER: string;
  EMAIL: string;
  WEBSITE?: string;
  ESTD_YEAR: number;
  IS_ACTIVE: boolean;
}

interface University {
  UNIVERSITY_ID: number;
  NAME: string;
  CODE: string;
}

const InstituteMaster: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState<InstituteFormData>({
    UNIVERSITY: 0,
    NAME: "",
    CODE: "",
    ADDRESS: "",
    CONTACT_NUMBER: "",
    EMAIL: "",
    WEBSITE: "",
    ESTD_YEAR: currentYear,
    IS_ACTIVE: true,
  });

  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [institutes, setInstitutes] = useState<InstituteFormData[]>([]);
  const [showList, setShowList] = useState(false);
  const [editingInstitute, setEditingInstitute] = useState<InstituteFormData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const location = useLocation();
  const { isFormDisabled, can_delete } = usePagePermissions(location.pathname, !!editingInstitute);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    fetchUniversities();
  }, [navigate]);

  useEffect(() => {
    if (showList) {
      fetchInstitutes();
    }
  }, [showList]);

  const fetchUniversities = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axiosInstance.get("/api/master/universities/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setUniversities(response.data);
      }
    } catch (error) {
      console.error("Error fetching universities:", error);
      setSnackbar({ open: true, message: "Failed to load universities", severity: "error" });
    }
  };

  const fetchInstitutes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axiosInstance.get("/api/master/institutes/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInstitutes(response.data);
    } catch (error) {
      console.error("Error fetching institutes:", error);
      setSnackbar({ open: true, message: "Failed to fetch institutes", severity: "error" });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setSnackbar({ open: true, message: "Authentication required", severity: "error" });
        navigate("/login");
        return;
      }

      // Normalize website URL
      const payload = { ...formData };
      if (payload.WEBSITE && typeof payload.WEBSITE === "string") {
        const trimmed = payload.WEBSITE.trim();
        if (trimmed && !/^(https?:)\/\//i.test(trimmed)) {
          payload.WEBSITE = `http://${trimmed}`;
        } else {
          payload.WEBSITE = trimmed;
        }
      }

      const response = await axiosInstance.post("/api/master/institutes/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        setFormData({
          UNIVERSITY: 0,
          NAME: "",
          CODE: "",
          ADDRESS: "",
          CONTACT_NUMBER: "",
          EMAIL: "",
          WEBSITE: "",
          ESTD_YEAR: currentYear,
          IS_ACTIVE: true,
        });
        setSnackbar({ open: true, message: "Institute created successfully!", severity: "success" });
      }
    } catch (err: any) {
      console.error("Error:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to create institute";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this institute?")) {
      try {
        const token = localStorage.getItem("token");
        await axiosInstance.delete(`/api/master/institutes/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchInstitutes();
        setSnackbar({ open: true, message: "Institute deleted successfully!", severity: "success" });
      } catch (error) {
        console.error("Error deleting institute:", error);
        setSnackbar({ open: true, message: "Failed to delete institute", severity: "error" });
      }
    }
  };

  const handleEdit = (institute: InstituteFormData) => {
    setEditingInstitute(institute);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstitute?.INSTITUTE_ID) return;

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.put(
        `/api/master/institutes/${editingInstitute.INSTITUTE_ID}/`,
        editingInstitute,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowEditModal(false);
      await fetchInstitutes();
      setSnackbar({ open: true, message: "Institute updated successfully!", severity: "success" });
    } catch (error) {
      console.error("Error updating institute:", error);
      setSnackbar({ open: true, message: "Failed to update institute", severity: "error" });
    }
  };

  const years = Array.from({ length: 225 }, (_, i) => currentYear - i);

  const getUniversityName = (universityId: number) => {
    const university = universities.find((u) => u.UNIVERSITY_ID === universityId);
    return university ? `${university.NAME} (${university.CODE})` : "N/A";
  };

  return (
    <Card sx={{ p: 3, maxWidth: 1200, margin: "auto", mt: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Institute Master Management
        </Typography>
        <Button variant="contained" onClick={() => setShowList(!showList)}>
          {showList ? "Create Institute" : "View Institutes"}
        </Button>
      </Box>

      {showList ? (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600, color: "text.secondary" }}>
            Institutes List
          </Typography>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>University</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Email</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {institutes.length > 0 ? (
                  institutes.map((institute) => (
                    <TableRow key={institute.INSTITUTE_ID} hover>
                      <TableCell>{institute.NAME}</TableCell>
                      <TableCell>{getUniversityName(institute.UNIVERSITY)}</TableCell>
                      <TableCell>{institute.CONTACT_NUMBER}</TableCell>
                      <TableCell>{institute.EMAIL}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(institute)}
                            size="small"
                            disabled={isFormDisabled}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(institute.INSTITUTE_ID!)}
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
                      <Typography variant="body2" color="textSecondary">
                        No institutes found
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
            Institute Registration Form
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="University"
                name="UNIVERSITY"
                value={formData.UNIVERSITY || ""}
                onChange={handleChange}
                required
                variant="outlined"
              >
                <MenuItem value="" disabled>
                  Select University
                </MenuItem>
                {universities.map((university) => (
                  <MenuItem key={university.UNIVERSITY_ID} value={university.UNIVERSITY_ID}>
                    {university.NAME} ({university.CODE})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Institute Code"
                name="CODE"
                value={formData.CODE}
                onChange={handleChange}
                required
                variant="outlined"
                inputProps={{ maxLength: 50 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Institute Name"
                name="NAME"
                value={formData.NAME}
                onChange={handleChange}
                required
                variant="outlined"
                inputProps={{ maxLength: 255 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Address"
                name="ADDRESS"
                value={formData.ADDRESS}
                onChange={handleChange}
                required
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Contact Number"
                name="CONTACT_NUMBER"
                value={formData.CONTACT_NUMBER}
                onChange={handleChange}
                required
                variant="outlined"
                inputProps={{ maxLength: 15, pattern: "[0-9]{10,15}" }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Email"
                name="EMAIL"
                type="email"
                value={formData.EMAIL}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Website (Optional)"
                name="WEBSITE"
                type="url"
                value={formData.WEBSITE}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Established Year"
                name="ESTD_YEAR"
                value={formData.ESTD_YEAR}
                onChange={handleChange}
                required
                variant="outlined"
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
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
              disabled={loading || isFormDisabled}
            >
              {loading ? "Creating..." : "Submit"}
            </Button>
          </Box>
        </Box>
      )}

      {/* Edit Modal */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Institute</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUpdate} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="University"
                  value={editingInstitute?.UNIVERSITY || ""}
                  onChange={(e) =>
                    setEditingInstitute((prev) => ({ ...prev!, UNIVERSITY: Number(e.target.value) }))
                  }
                  required
                  variant="outlined"
                >
                  {universities.map((university) => (
                    <MenuItem key={university.UNIVERSITY_ID} value={university.UNIVERSITY_ID}>
                      {university.NAME} ({university.CODE})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Institute Code"
                  value={editingInstitute?.CODE || ""}
                  onChange={(e) => setEditingInstitute((prev) => ({ ...prev!, CODE: e.target.value }))}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Institute Name"
                  value={editingInstitute?.NAME || ""}
                  onChange={(e) => setEditingInstitute((prev) => ({ ...prev!, NAME: e.target.value }))}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  value={editingInstitute?.CONTACT_NUMBER || ""}
                  onChange={(e) => setEditingInstitute((prev) => ({ ...prev!, CONTACT_NUMBER: e.target.value }))}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={editingInstitute?.ADDRESS || ""}
                  onChange={(e) => setEditingInstitute((prev) => ({ ...prev!, ADDRESS: e.target.value }))}
                  required
                  multiline
                  rows={3}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editingInstitute?.EMAIL || ""}
                  onChange={(e) => setEditingInstitute((prev) => ({ ...prev!, EMAIL: e.target.value }))}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  type="url"
                  value={editingInstitute?.WEBSITE || ""}
                  onChange={(e) => setEditingInstitute((prev) => ({ ...prev!, WEBSITE: e.target.value }))}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Established Year"
                  value={editingInstitute?.ESTD_YEAR || currentYear}
                  onChange={(e) =>
                    setEditingInstitute((prev) => ({ ...prev!, ESTD_YEAR: Number(e.target.value) }))
                  }
                  required
                  variant="outlined"
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editingInstitute?.IS_ACTIVE || false}
                      onChange={(e) =>
                        setEditingInstitute((prev) => ({ ...prev!, IS_ACTIVE: e.target.checked }))
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
            Save Changes
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

export default InstituteMaster;