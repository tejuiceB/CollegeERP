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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axiosInstance from "../../api/axios";
import universityService from "../../api/universityService";
import { usePagePermissions } from "../../hooks/usePagePermissions";
import { useLocation } from "react-router-dom";

interface UniversityFormData {
  UNIVERSITY_ID?: number;
  NAME: string;
  CODE: string;
  ADDRESS: string;
  CONTACT_NUMBER: string;
  EMAIL: string;
  WEBSITE?: string;
  ESTD_YEAR: number;
  IS_ACTIVE: boolean;
}

const UniversityMaster: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState<UniversityFormData>({
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
  const [universities, setUniversities] = useState<UniversityFormData[]>([]);
  const [showList, setShowList] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<UniversityFormData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const location = useLocation();
  const { isFormDisabled, can_delete } = usePagePermissions(location.pathname, !!editingUniversity);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (showList) {
      fetchUniversities();
    }
  }, [showList]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!token || !user?.user_id) {
        setSnackbar({ open: true, message: "Authentication required", severity: "error" });
        navigate("/login");
        return;
      }

      const response = await axiosInstance.post(
        "/api/master/universities/",
        {
          ...formData,
          CODE: formData.CODE.toUpperCase(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setFormData({
          NAME: "",
          CODE: "",
          ADDRESS: "",
          CONTACT_NUMBER: "",
          EMAIL: "",
          WEBSITE: "",
          ESTD_YEAR: currentYear,
          IS_ACTIVE: true,
        });
        setSnackbar({ open: true, message: "University created successfully!", severity: "success" });
      }
    } catch (err: any) {
      console.error("Error:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to create university",
        severity: "error"
      });
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await universityService.getUniversities();
      setUniversities(response.data);
    } catch (error) {
      console.error("Error fetching universities:", error);
      setSnackbar({ open: true, message: "Failed to fetch universities", severity: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this university?")) {
      try {
        await universityService.deleteUniversity(id);
        await fetchUniversities();
        setSnackbar({ open: true, message: "University deleted successfully!", severity: "success" });
      } catch (error) {
        console.error("Error deleting university:", error);
        setSnackbar({ open: true, message: "Failed to delete university", severity: "error" });
      }
    }
  };

  const handleEdit = (university: UniversityFormData) => {
    setEditingUniversity(university);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUniversity?.UNIVERSITY_ID) return;

    try {
      await universityService.updateUniversity(
        editingUniversity.UNIVERSITY_ID,
        editingUniversity
      );
      setShowEditModal(false);
      await fetchUniversities();
      setSnackbar({ open: true, message: "University updated successfully!", severity: "success" });
    } catch (error) {
      console.error("Error updating university:", error);
      setSnackbar({ open: true, message: "Failed to update university", severity: "error" });
    }
  };

  const years = Array.from({ length: 200 }, (_, i) => currentYear - i);

  return (
    <Card sx={{ p: 3, maxWidth: 1200, margin: "auto", mt: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          University Management
        </Typography>
        <Button
          variant="contained"
          onClick={() => setShowList(!showList)}
        >
          {showList ? "Add New University" : "View Universities"}
        </Button>
      </Box>

      {showList ? (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600, color: "text.secondary" }}>
            University List
          </Typography>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Established Year</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {universities.length > 0 ? (
                  universities.map((university) => (
                    <TableRow key={university.UNIVERSITY_ID} hover>
                      <TableCell>{university.NAME}</TableCell>
                      <TableCell>{university.CONTACT_NUMBER}</TableCell>
                      <TableCell>{university.EMAIL}</TableCell>
                      <TableCell>{university.ESTD_YEAR}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(university)}
                            size="small"
                            disabled={isFormDisabled}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(university.UNIVERSITY_ID!)}
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
                        No universities found
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
            University Registration Form
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="University Name"
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
                label="University Code"
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
                label="Contact Number"
                name="CONTACT_NUMBER"
                value={formData.CONTACT_NUMBER}
                onChange={handleChange}
                required
                variant="outlined"
                inputProps={{ maxLength: 15 }}
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
          </Grid>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || isFormDisabled}
            >
              {loading ? "Creating..." : "Create University"}
            </Button>
          </Box>
        </Box>
      )}

      {/* Edit Modal */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit University</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUpdate} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="University Name"
                  value={editingUniversity?.NAME || ""}
                  onChange={(e) => setEditingUniversity((prev) => ({ ...prev!, NAME: e.target.value }))}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="University Code"
                  value={editingUniversity?.CODE || ""}
                  onChange={(e) => setEditingUniversity((prev) => ({ ...prev!, CODE: e.target.value }))}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  value={editingUniversity?.CONTACT_NUMBER || ""}
                  onChange={(e) => setEditingUniversity((prev) => ({ ...prev!, CONTACT_NUMBER: e.target.value }))}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editingUniversity?.EMAIL || ""}
                  onChange={(e) => setEditingUniversity((prev) => ({ ...prev!, EMAIL: e.target.value }))}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={editingUniversity?.ADDRESS || ""}
                  onChange={(e) => setEditingUniversity((prev) => ({ ...prev!, ADDRESS: e.target.value }))}
                  required
                  multiline
                  rows={3}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  type="url"
                  value={editingUniversity?.WEBSITE || ""}
                  onChange={(e) => setEditingUniversity((prev) => ({ ...prev!, WEBSITE: e.target.value }))}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Established Year"
                  value={editingUniversity?.ESTD_YEAR || currentYear}
                  onChange={(e) => setEditingUniversity((prev) => ({ ...prev!, ESTD_YEAR: Number(e.target.value) }))}
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

export default UniversityMaster;
