import React, { useState, useEffect } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  styled,
  Box,
  IconButton,
  Tooltip,
  useTheme,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { usePagePermissions } from "../../../hooks/usePagePermissions";
import { useLocation } from "react-router-dom";
import {
  fetchShiftEntries,
  createShiftEntry,
  updateShiftEntry,
  deleteShiftEntry,
} from "../../../api/establishmentService";
import DeleteConfirmDialog from "../../common/DeleteConfirmDialog";

// Styled components
const PageContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  height: "100%",
  position: "relative",
});

const HeaderSection = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const TableSection = styled("div")(({ theme }) => ({
  flexGrow: 1,
  overflow: "hidden",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: "calc(100vh - 250px)",
  ".MuiTableHead-root": {
    ".MuiTableCell-root": {
      backgroundColor: theme.palette.background.paper,
      fontWeight: 600,
    },
  },
  ".MuiTableBody-root": {
    ".MuiTableRow-root": {
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
    },
  },
}));

const FormContainer = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(2),
  gridTemplateColumns: "repeat(2, 1fr)",
  padding: theme.spacing(2),
  "& .MuiTextField-root": {
    width: "100%",
  },
}));

interface ShiftData {
  ID: number;
  SHIFT_NAME: string;
  FROM_TIME: string;
  TO_TIME: string;
  LATE_COMING_TIME?: string;
  EARLY_GOING_TIME?: string;
  IS_DELETED: boolean;
  CREATED_BY?: string;
  CREATED_AT?: string;
  UPDATED_BY?: string;
  UPDATED_AT?: string;
}

interface ShiftEntryProps {
  tableName: string;
}

const ShiftEntry: React.FC<ShiftEntryProps> = ({ tableName }) => {
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newEntry, setNewEntry] = useState({
    SHIFT_NAME: "",
    FROM_TIME: "",
    TO_TIME: "",
    LATE_COMING_TIME: "",
    EARLY_GOING_TIME: "",
  });
  const [editingEntry, setEditingEntry] = useState<ShiftData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShiftData | null>(null);
  const theme = useTheme();

  const location = useLocation();
  const { isFormDisabled, can_edit, can_delete, isSuperuser } = usePagePermissions(location.pathname, !!editingEntry);

  useEffect(() => {
    try {
      // Get user data
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("Found user data:", userData);

      // Check for required auth data
      if (!userData.user_id) {
        console.warn("No user_id found in data");
        return;
      }

      // User is authenticated, proceed with data fetch
      fetchData();
    } catch (error) {
      console.error("Error checking auth:", error);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetchShiftEntries();
      setShifts(response.data);
    } catch (err) {
      console.error("Error fetching shifts:", err);
      setError("Failed to fetch shifts");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (shift: ShiftData) => {
    setEditingEntry(shift);
    setNewEntry({
      SHIFT_NAME: shift.SHIFT_NAME,
      FROM_TIME: shift.FROM_TIME,
      TO_TIME: shift.TO_TIME,
      LATE_COMING_TIME: shift.LATE_COMING_TIME || "",
      EARLY_GOING_TIME: shift.EARLY_GOING_TIME || "",
    });
    setOpen(true);
  };

  const handleDeleteClick = (item: ShiftData) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);
      await deleteShiftEntry(selectedItem.ID);
      const response = await fetchShiftEntries();
      setShifts(response.data);
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (editingEntry) {
        await updateShiftEntry(editingEntry.ID, newEntry);
      } else {
        await createShiftEntry(newEntry);
      }

      const response = await fetchShiftEntries();
      setShifts(response.data);
      setOpen(false);
      setNewEntry({
        SHIFT_NAME: "",
        FROM_TIME: "",
        TO_TIME: "",
        LATE_COMING_TIME: "",
        EARLY_GOING_TIME: "",
      });
      setEditingEntry(null);
    } catch (err: any) {
      console.error("Error saving shift:", err);
      setError(err.response?.data?.message || "Failed to save shift");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setOpen(false);
    setNewEntry({
      SHIFT_NAME: "",
      FROM_TIME: "",
      TO_TIME: "",
      LATE_COMING_TIME: "",
      EARLY_GOING_TIME: "",
    });
    setEditingEntry(null);
  };

  return (
    <PageContainer>
      <HeaderSection>
        <Box>
          <Typography variant="h5" fontWeight="500">
            Shift Master Entry
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage employee shift schedules and timings
          </Typography>
        </Box>

        <Tooltip title="Add New Shift">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{
              minWidth: 130,
              boxShadow: theme.shadows[2],
            }}
            disabled={isFormDisabled}
          >
            Add Shift
          </Button>
        </Tooltip>
      </HeaderSection>

      {error && (
        <Alert
          severity="error"
          variant="outlined"
          onClose={() => setError("")}
          sx={{ borderRadius: 1 }}
        >
          {error}
        </Alert>
      )}

      <TableSection>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="200px"
          >
            <CircularProgress size={40} />
          </Box>
        ) : (
          <StyledTableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Shift Name</TableCell>
                  <TableCell>From Time</TableCell>
                  <TableCell>To Time</TableCell>
                  <TableCell>Late Coming</TableCell>
                  <TableCell>Early Going</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shifts.map((shift) => (
                  <TableRow key={shift.ID}>
                    <TableCell>{shift.ID}</TableCell>
                    <TableCell>{shift.SHIFT_NAME}</TableCell>
                    <TableCell>{shift.FROM_TIME}</TableCell>
                    <TableCell>{shift.TO_TIME}</TableCell>
                    <TableCell>{shift.LATE_COMING_TIME || "-"}</TableCell>
                    <TableCell>{shift.EARLY_GOING_TIME || "-"}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(shift)}
                          color="primary"
                          disabled={!can_edit && !isSuperuser}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(shift)}
                          color="error"
                          disabled={!can_delete && !isSuperuser}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        )}
      </TableSection>

      <Dialog open={open} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEntry ? "Edit Shift" : "Add New Shift"}
        </DialogTitle>
        <DialogContent dividers>
          <FormContainer>
            <TextField
              autoFocus
              required
              label="Shift Name"
              value={newEntry.SHIFT_NAME}
              onChange={(e) =>
                setNewEntry({ ...newEntry, SHIFT_NAME: e.target.value })
              }
              error={!newEntry.SHIFT_NAME}
              helperText={!newEntry.SHIFT_NAME ? "Shift name is required" : ""}
              disabled={isFormDisabled}
            />
            <TextField
              type="time"
              required
              label="From Time"
              value={newEntry.FROM_TIME}
              onChange={(e) =>
                setNewEntry({ ...newEntry, FROM_TIME: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              error={!newEntry.FROM_TIME}
              helperText={!newEntry.FROM_TIME ? "Start time is required" : ""}
              disabled={isFormDisabled}
            />
            <TextField
              type="time"
              required
              label="To Time"
              value={newEntry.TO_TIME}
              onChange={(e) =>
                setNewEntry({ ...newEntry, TO_TIME: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              error={!newEntry.TO_TIME}
              helperText={!newEntry.TO_TIME ? "End time is required" : ""}
              disabled={isFormDisabled}
            />
            <TextField
              type="time"
              label="Late Coming Time"
              value={newEntry.LATE_COMING_TIME}
              onChange={(e) =>
                setNewEntry({ ...newEntry, LATE_COMING_TIME: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              disabled={isFormDisabled}
            />
            <TextField
              type="time"
              label="Early Going Time"
              value={newEntry.EARLY_GOING_TIME}
              onChange={(e) =>
                setNewEntry({ ...newEntry, EARLY_GOING_TIME: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              disabled={isFormDisabled}
            />
          </FormContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !newEntry.SHIFT_NAME ||
              !newEntry.FROM_TIME ||
              !newEntry.TO_TIME ||
              loading ||
              isFormDisabled
            }
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : editingEntry ? (
              "Update"
            ) : (
              "Submit"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title={selectedItem?.SHIFT_NAME || ""}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  );
};

export default ShiftEntry;
