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

interface EventMaster {
  RECORD_ID?: number;
  EVENT_TYPE: number | string;
  EVENT_NAME: string;
  ORGANIZED_BY: number | string;
  EVENT_START_DT: string;
  EVENT_END_DT: string;
  EVENT_PURPOSE: string;
  EVENT_REMARKS?: string;
}

interface EventType {
  RECORD_ID: number;
  MAIN_TYPE: string;
  SUB_TYPE: string;
}

interface Committee {
  RECORD_ID: number;
  COM_NAME: string;
}

const EventMasterForm: React.FC = () => {
  const [formData, setFormData] = useState<EventMaster>({
    EVENT_TYPE: "",
    EVENT_NAME: "",
    ORGANIZED_BY: "",
    EVENT_START_DT: "",
    EVENT_END_DT: "",
    EVENT_PURPOSE: "",
    EVENT_REMARKS: "",
  });

  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [events, setEvents] = useState<EventMaster[]>([]);
  const [showList, setShowList] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventMaster | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const location = useLocation();
  const { isFormDisabled, can_edit, can_delete } = usePagePermissions(location.pathname, !!editingEvent);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (showList) {
      fetchData();
    }
  }, [showList]);

  const fetchData = async () => {
    try {
      const [eventTypesRes, committeesRes, eventsRes] = await Promise.all([
        axios.get("/api/master/event-types/"),
        axios.get("/api/master/committees/"),
        axios.get("/api/master/events/"),
      ]);
      setEventTypes(eventTypesRes.data as EventType[]);
      setCommittees(committeesRes.data as Committee[]);
      setEvents(eventsRes.data as EventMaster[]);
    } catch (err) {
      console.error("Error fetching data:", err);
      setSnackbar({ open: true, message: "Failed to fetch data", severity: "error" });
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
      await axios.post("/api/master/events/", formData);
      setFormData({
        EVENT_TYPE: "",
        EVENT_NAME: "",
        ORGANIZED_BY: "",
        EVENT_START_DT: "",
        EVENT_END_DT: "",
        EVENT_PURPOSE: "",
        EVENT_REMARKS: "",
      });
      await fetchData();
      setSnackbar({ open: true, message: "Event created successfully!", severity: "success" });
    } catch (err) {
      console.error("Error saving event:", err);
      setSnackbar({ open: true, message: "Failed to create event", severity: "error" });
    }
  };

  const handleEdit = (event: EventMaster) => {
    setEditingEvent(event);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent?.RECORD_ID) return;

    try {
      await axios.put(`/api/master/events/${editingEvent.RECORD_ID}/`, editingEvent);
      setShowEditModal(false);
      await fetchData();
      setSnackbar({ open: true, message: "Event updated successfully!", severity: "success" });
    } catch (err) {
      console.error("Error updating event:", err);
      setSnackbar({ open: true, message: "Failed to update event", severity: "error" });
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await axios.delete(`/api/master/events/${id}/`);
      await fetchData();
      setSnackbar({ open: true, message: "Event deleted successfully!", severity: "success" });
    } catch (err) {
      console.error("Error deleting event:", err);
      setSnackbar({ open: true, message: "Failed to delete event", severity: "error" });
    }
  };

  const getEventTypeName = (id: number | string) => {
    const eventType = eventTypes.find((et) => et.RECORD_ID === Number(id));
    return eventType ? `${eventType.MAIN_TYPE} - ${eventType.SUB_TYPE}` : "";
  };

  const getCommitteeName = (id: number | string) => {
    const committee = committees.find((c) => c.RECORD_ID === Number(id));
    return committee?.COM_NAME || "";
  };

  return (
    <Card sx={{ p: 3, maxWidth: 1200, margin: "auto", mt: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Event Master Management
        </Typography>
        <Button variant="contained" onClick={() => setShowList(!showList)}>
          {showList ? "Create Event" : "View Events"}
        </Button>
      </Box>

      {showList ? (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600, color: "text.secondary" }}>
            Events List
          </Typography>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Event Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Organized By</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>End Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.length > 0 ? (
                  events.map((event) => (
                    <TableRow key={event.RECORD_ID} hover>
                      <TableCell>{event.EVENT_NAME}</TableCell>
                      <TableCell>{getEventTypeName(event.EVENT_TYPE)}</TableCell>
                      <TableCell>{getCommitteeName(event.ORGANIZED_BY)}</TableCell>
                      <TableCell>{event.EVENT_START_DT}</TableCell>
                      <TableCell>{event.EVENT_END_DT}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(event)}
                            size="small"
                            disabled={isFormDisabled}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(event.RECORD_ID)}
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
                        No events found
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
            Event Registration Form
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Event Type"
                name="EVENT_TYPE"
                value={formData.EVENT_TYPE}
                onChange={handleChange}
                required
                variant="outlined"
                disabled={isFormDisabled}
              >
                <MenuItem value="">-- Select Event Type --</MenuItem>
                {eventTypes.map((et) => (
                  <MenuItem key={et.RECORD_ID} value={et.RECORD_ID}>
                    {et.MAIN_TYPE} - {et.SUB_TYPE}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Organized By"
                name="ORGANIZED_BY"
                value={formData.ORGANIZED_BY}
                onChange={handleChange}
                required
                variant="outlined"
                disabled={isFormDisabled}
              >
                <MenuItem value="">-- Select Organizing Committee --</MenuItem>
                {committees.map((c) => (
                  <MenuItem key={c.RECORD_ID} value={c.RECORD_ID}>
                    {c.COM_NAME}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Event Name"
                name="EVENT_NAME"
                value={formData.EVENT_NAME}
                onChange={handleChange}
                required
                variant="outlined"
                disabled={isFormDisabled}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                name="EVENT_START_DT"
                type="date"
                value={formData.EVENT_START_DT}
                onChange={handleChange}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                disabled={isFormDisabled}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="End Date"
                name="EVENT_END_DT"
                type="date"
                value={formData.EVENT_END_DT}
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
                label="Event Purpose"
                name="EVENT_PURPOSE"
                value={formData.EVENT_PURPOSE}
                onChange={handleChange}
                multiline
                rows={3}
                variant="outlined"
                disabled={isFormDisabled}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Event Remarks"
                name="EVENT_REMARKS"
                value={formData.EVENT_REMARKS}
                onChange={handleChange}
                multiline
                rows={3}
                variant="outlined"
                disabled={isFormDisabled}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button type="submit" variant="contained" size="large" disabled={isFormDisabled}>
              Save Event
            </Button>
          </Box>
        </Box>
      )}

      {/* Edit Modal */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUpdate} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Event Type"
                  value={editingEvent?.EVENT_TYPE || ""}
                  onChange={(e) => setEditingEvent((prev) => ({ ...prev!, EVENT_TYPE: e.target.value }))}
                  required
                  variant="outlined"
                >
                  {eventTypes.map((et) => (
                    <MenuItem key={et.RECORD_ID} value={et.RECORD_ID}>
                      {et.MAIN_TYPE} - {et.SUB_TYPE}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Organized By"
                  value={editingEvent?.ORGANIZED_BY || ""}
                  onChange={(e) => setEditingEvent((prev) => ({ ...prev!, ORGANIZED_BY: e.target.value }))}
                  required
                  variant="outlined"
                >
                  {committees.map((c) => (
                    <MenuItem key={c.RECORD_ID} value={c.RECORD_ID}>
                      {c.COM_NAME}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Name"
                  value={editingEvent?.EVENT_NAME || ""}
                  onChange={(e) => setEditingEvent((prev) => ({ ...prev!, EVENT_NAME: e.target.value }))}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={editingEvent?.EVENT_START_DT || ""}
                  onChange={(e) => setEditingEvent((prev) => ({ ...prev!, EVENT_START_DT: e.target.value }))}
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={editingEvent?.EVENT_END_DT || ""}
                  onChange={(e) => setEditingEvent((prev) => ({ ...prev!, EVENT_END_DT: e.target.value }))}
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Purpose"
                  value={editingEvent?.EVENT_PURPOSE || ""}
                  onChange={(e) => setEditingEvent((prev) => ({ ...prev!, EVENT_PURPOSE: e.target.value }))}
                  multiline
                  rows={2}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Remarks"
                  value={editingEvent?.EVENT_REMARKS || ""}
                  onChange={(e) => setEditingEvent((prev) => ({ ...prev!, EVENT_REMARKS: e.target.value }))}
                  multiline
                  rows={2}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" disabled={isFormDisabled}>
            Update Event
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

export default EventMasterForm;
