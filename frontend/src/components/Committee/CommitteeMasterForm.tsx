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

interface Committee {
  RECORD_ID?: number;
  COM_NAME: string;
  COM_FORMATION_DATE: string;
  ACTIVE: string;
  LEVEL1: string;
  REMARKS: string;
}

const CommitteeMasterForm: React.FC = () => {
  const [formData, setFormData] = useState<Committee>({
    COM_NAME: "",
    COM_FORMATION_DATE: "",
    ACTIVE: "",
    LEVEL1: "",
    REMARKS: "",
  });

  const [committees, setCommittees] = useState<Committee[]>([]);
  const [showList, setShowList] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<Committee | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const location = useLocation();
  const { isFormDisabled, can_edit, can_delete } = usePagePermissions(location.pathname, !!editingCommittee);

  useEffect(() => {
    if (showList) {
      fetchCommittees();
    }
  }, [showList]);

  const fetchCommittees = async () => {
    try {
      const response = await axiosInstance.get<Committee[]>("/api/master/committees/");
      setCommittees(response.data);
    } catch (error) {
      console.error("Error fetching committees:", error);
      setSnackbar({ open: true, message: "Failed to fetch committees", severity: "error" });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axiosInstance.post("/api/master/committees/", formData);
      setFormData({
        COM_NAME: "",
        COM_FORMATION_DATE: "",
        ACTIVE: "",
        LEVEL1: "",
        REMARKS: "",
      });
      setSnackbar({ open: true, message: "Committee created successfully!", severity: "success" });
    } catch (error) {
      console.error("Submission error:", error);
      setSnackbar({ open: true, message: "Failed to create committee", severity: "error" });
    }
  };

  const handleEdit = (committee: Committee) => {
    setEditingCommittee(committee);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommittee?.RECORD_ID) return;

    try {
      await axiosInstance.put(`/api/master/committees/${editingCommittee.RECORD_ID}/`, editingCommittee);
      setShowEditModal(false);
      await fetchCommittees();
      setSnackbar({ open: true, message: "Committee updated successfully!", severity: "success" });
    } catch (error) {
      console.error("Update error:", error);
      setSnackbar({ open: true, message: "Failed to update committee", severity: "error" });
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this committee?")) return;

    try {
      await axiosInstance.delete(`/api/master/committees/${id}/`);
      await fetchCommittees();
      setSnackbar({ open: true, message: "Committee deleted successfully!", severity: "success" });
    } catch (error) {
      console.error("Delete error:", error);
      setSnackbar({ open: true, message: "Failed to delete committee", severity: "error" });
    }
  };

  return (
    <Card sx={{ p: 3, maxWidth: 1200, margin: "auto", mt: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Committee Master Management
        </Typography>
        <Button variant="contained" onClick={() => setShowList(!showList)}>
          {showList ? "Create Committee" : "View Committees"}
        </Button>
      </Box>

      {showList ? (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600, color: "text.secondary" }}>
            Committees List
          </Typography>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Formation Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Active</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Level</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Remarks</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {committees.length > 0 ? (
                  committees.map((committee) => (
                    <TableRow key={committee.RECORD_ID} hover>
                      <TableCell>{committee.COM_NAME}</TableCell>
                      <TableCell>{committee.COM_FORMATION_DATE}</TableCell>
                      <TableCell>{committee.ACTIVE}</TableCell>
                      <TableCell>{committee.LEVEL1}</TableCell>
                      <TableCell>{committee.REMARKS}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(committee)}
                            size="small"
                            disabled={isFormDisabled}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(committee.RECORD_ID)}
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
                        No committees found
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
            Committee Registration Form
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Committee Name"
                name="COM_NAME"
                value={formData.COM_NAME}
                onChange={handleChange}
                required
                variant="outlined"
                disabled={isFormDisabled}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Formation Date"
                name="COM_FORMATION_DATE"
                type="date"
                value={formData.COM_FORMATION_DATE}
                onChange={handleChange}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                disabled={isFormDisabled}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Active"
                name="ACTIVE"
                value={formData.ACTIVE}
                onChange={handleChange}
                required
                variant="outlined"
                disabled={isFormDisabled}
              >
                <MenuItem value="">-- Select --</MenuItem>
                <MenuItem value="Y">Yes</MenuItem>
                <MenuItem value="N">No</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Level"
                name="LEVEL1"
                value={formData.LEVEL1}
                onChange={handleChange}
                required
                variant="outlined"
                disabled={isFormDisabled}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                name="REMARKS"
                value={formData.REMARKS}
                onChange={handleChange}
                multiline
                rows={3}
                variant="outlined"
                disabled={isFormDisabled}
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
              Save Committee
            </Button>
          </Box>
        </Box>
      )}

      {/* Edit Modal */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Committee</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUpdate} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Committee Name"
                  value={editingCommittee?.COM_NAME || ""}
                  onChange={(e) => setEditingCommittee((prev) => ({ ...prev!, COM_NAME: e.target.value }))}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Formation Date"
                  type="date"
                  value={editingCommittee?.COM_FORMATION_DATE || ""}
                  onChange={(e) => setEditingCommittee((prev) => ({ ...prev!, COM_FORMATION_DATE: e.target.value }))}
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Active"
                  value={editingCommittee?.ACTIVE || ""}
                  onChange={(e) => setEditingCommittee((prev) => ({ ...prev!, ACTIVE: e.target.value }))}
                  required
                  variant="outlined"
                >
                  <MenuItem value="Y">Yes</MenuItem>
                  <MenuItem value="N">No</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Level"
                  value={editingCommittee?.LEVEL1 || ""}
                  onChange={(e) => setEditingCommittee((prev) => ({ ...prev!, LEVEL1: e.target.value }))}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remarks"
                  value={editingCommittee?.REMARKS || ""}
                  onChange={(e) => setEditingCommittee((prev) => ({ ...prev!, REMARKS: e.target.value }))}
                  multiline
                  rows={3}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" disabled={isFormDisabled}>
            Update Committee
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

export default CommitteeMasterForm;
