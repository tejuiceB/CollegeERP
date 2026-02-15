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
  fetchStatusEntries,
  createStatusEntry,
  updateStatusEntry,
  deleteStatusEntry,
} from "../../../api/establishmentService";
import DeleteConfirmDialog from "../../common/DeleteConfirmDialog";

interface StatusData {
  ID: number;
  RECORD_WORD: string;
  IS_DELETED: boolean;
  CREATED_BY?: string;
  CREATED_BY_NAME?: string; // Added this
  CREATED_AT?: string;
  UPDATED_BY?: string;
  UPDATED_BY_NAME?: string; // Added this
  UPDATED_AT?: string;
}

interface StatusEntryProps {
  tableName: string;
}

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

const StatusEntry: React.FC<StatusEntryProps> = ({ tableName }) => {
  const theme = useTheme();
  const [statuses, setStatuses] = useState<StatusData[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingEntry, setEditingEntry] = useState<StatusData | null>(null);
  const [newEntry, setNewEntry] = useState({
    RECORD_WORD: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StatusData | null>(null);

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
      const response = await fetchStatusEntries();
      setStatuses(response.data);
    } catch (err) {
      console.error("Error fetching statuses:", err);
      setError("Failed to fetch statuses");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (status: StatusData) => {
    setEditingEntry(status);
    setNewEntry({ RECORD_WORD: status.RECORD_WORD });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (editingEntry) {
        await updateStatusEntry(editingEntry.ID, newEntry);
      } else {
        await createStatusEntry(newEntry);
      }

      const response = await fetchStatusEntries();
      setStatuses(response.data);
      setOpen(false);
      setNewEntry({ RECORD_WORD: "" });
      setEditingEntry(null);
    } catch (err: any) {
      console.error("Error saving status:", err);
      setError(err.response?.data?.message || "Failed to save status");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setOpen(false);
    setNewEntry({ RECORD_WORD: "" });
    setEditingEntry(null);
  };

  const handleDeleteClick = (item: StatusData) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);
      await deleteStatusEntry(selectedItem.ID);
      const response = await fetchStatusEntries();
      setStatuses(response.data);
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <HeaderSection>
        <Box>
          <Typography variant="h5" fontWeight="500">
            Status Master Entry
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage employee status records
          </Typography>
        </Box>

        <Tooltip title="Add New Status">
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
            Add Status
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
                  <TableCell>Record Word</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated By</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statuses.map((status) => (
                  <TableRow key={status.ID}>
                    <TableCell>{status.ID}</TableCell>
                    <TableCell>{status.RECORD_WORD}</TableCell>
                    <TableCell>{status.CREATED_BY_NAME}</TableCell>
                    <TableCell>
                      {status.CREATED_AT
                        ? new Date(status.CREATED_AT).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>{status.UPDATED_BY_NAME || "-"}</TableCell>
                    <TableCell>
                      {status.UPDATED_AT
                        ? new Date(status.UPDATED_AT).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(status)}
                          color="primary"
                          disabled={!can_edit && !isSuperuser}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(status)}
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

      <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEntry ? "Edit Status" : "Add New Status"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Record Word"
            fullWidth
            required
            value={newEntry.RECORD_WORD}
            onChange={(e) =>
              setNewEntry({ ...newEntry, RECORD_WORD: e.target.value })
            }
            error={!newEntry.RECORD_WORD}
            helperText={!newEntry.RECORD_WORD ? "Record word is required" : ""}
            disabled={isFormDisabled}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!newEntry.RECORD_WORD || loading || isFormDisabled}
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
        title={selectedItem?.RECORD_WORD || ""}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  );
};

export default StatusEntry;
