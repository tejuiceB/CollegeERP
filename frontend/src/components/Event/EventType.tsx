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
import axios from "../../api/axios";
import { usePagePermissions } from "../../hooks/usePagePermissions";
import { useLocation } from "react-router-dom";

interface EventType {
  RECORD_ID?: number;
  MAIN_TYPE: string;
  SUB_TYPE: string;
}

const EventTypeMasterForm: React.FC = () => {
  const [formData, setFormData] = useState<EventType>({
    MAIN_TYPE: "",
    SUB_TYPE: "",
  });

  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [showList, setShowList] = useState(false);
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const location = useLocation();
  const { isFormDisabled, can_edit, can_delete } = usePagePermissions(location.pathname, !!editingEventType);

  useEffect(() => {
    fetchEventTypes();
  }, []);

  useEffect(() => {
    if (showList) {
      fetchEventTypes();
    }
  }, [showList]);

  const fetchEventTypes = async () => {
    try {
      const res = await axios.get("/api/master/event-types/");
      setEventTypes(res.data as EventType[]);
    } catch (err) {
      console.error("Error fetching event types:", err);
      setSnackbar({ open: true, message: "Failed to fetch event types", severity: "error" });
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
      await axios.post("/api/master/event-types/", formData);
      setFormData({
        MAIN_TYPE: "",
        SUB_TYPE: "",
      });
      await fetchEventTypes();
      setSnackbar({ open: true, message: "Event Type created successfully!", severity: "success" });
    } catch (err) {
      console.error("Error saving event type:", err);
      setSnackbar({ open: true, message: "Failed to create event type", severity: "error" });
    }
  };

  const handleEdit = (eventType: EventType) => {
    setEditingEventType(eventType);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEventType?.RECORD_ID) return;

    try {
      await axios.put(`/api/master/event-types/${editingEventType.RECORD_ID}/`, editingEventType);
      setShowEditModal(false);
      await fetchEventTypes();
      setSnackbar({ open: true, message: "Event Type updated successfully!", severity: "success" });
    } catch (err) {
      console.error("Error updating event type:", err);
      setSnackbar({ open: true, message: "Failed to update event type", severity: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this event type?")) return;

    try {
      await axios.delete(`/api/master/event-types/${id}/`);
      await fetchEventTypes();
      setSnackbar({ open: true, message: "Event Type deleted successfully!", severity: "success" });
    } catch (err) {
      console.error("Error deleting event type:", err);
      setSnackbar({ open: true, message: "Failed to delete event type", severity: "error" });
    }
  };

  return (
    <Card sx={{ p: 3, maxWidth: 1200, margin: "auto", mt: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Event Type Management
        </Typography>
        <Button variant="contained" onClick={() => setShowList(!showList)}>
          {showList ? "Create Event Type" : "View Event Types"}
        </Button>
      </Box>

      {showList ? (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600, color: "text.secondary" }}>
            Event Types List
          </Typography>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Main Type</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Sub Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {eventTypes.length > 0 ? (
                  eventTypes.map((eventType) => (
                    <TableRow key={eventType.RECORD_ID} hover>
                      <TableCell>{eventType.RECORD_ID}</TableCell>
                      <TableCell>{eventType.MAIN_TYPE}</TableCell>
                      <TableCell>{eventType.SUB_TYPE}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(eventType)}
                            size="small"
                            disabled={isFormDisabled}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(eventType.RECORD_ID!)}
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
                        No event types found
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
            Event Type Registration Form
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Main Type"
                name="MAIN_TYPE"
                value={formData.MAIN_TYPE}
                onChange={handleChange}
                required
                variant="outlined"
                disabled={isFormDisabled}
              >
                <MenuItem value="">-- Select Main Type --</MenuItem>
                <MenuItem value="Educational">Educational</MenuItem>
                <MenuItem value="Non Educational">Non Educational</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sub Type"
                name="SUB_TYPE"
                value={formData.SUB_TYPE}
                onChange={handleChange}
                required
                variant="outlined"
                disabled={isFormDisabled}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button type="submit" variant="contained" size="large" disabled={isFormDisabled}>
              Save Event Type
            </Button>
          </Box>
        </Box>
      )}

      {/* Edit Modal */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Event Type</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUpdate} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Main Type"
                  value={editingEventType?.MAIN_TYPE || ""}
                  onChange={(e) => setEditingEventType((prev) => ({ ...prev!, MAIN_TYPE: e.target.value }))}
                  required
                  variant="outlined"
                >
                  <MenuItem value="Educational">Educational</MenuItem>
                  <MenuItem value="Non Educational">Non Educational</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Sub Type"
                  value={editingEventType?.SUB_TYPE || ""}
                  onChange={(e) => setEditingEventType((prev) => ({ ...prev!, SUB_TYPE: e.target.value }))}
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
            Update Event Type
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

export default EventTypeMasterForm;
