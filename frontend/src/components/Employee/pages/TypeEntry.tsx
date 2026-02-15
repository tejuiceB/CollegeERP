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
  Typography, // Added Typography import
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { usePagePermissions } from "../../../hooks/usePagePermissions";
import { useLocation } from "react-router-dom";
import axios from "../../../utils/axios";
import {
  fetchTypeEntries,
  createTypeEntry,
  updateTypeEntry,
  deleteTypeEntry,
} from "../../../api/establishmentService";
import DeleteConfirmDialog from "../../common/DeleteConfirmDialog";

interface TypeEntryProps {
  tableName: string;
}

interface TypeData {
  ID: number;
  RECORD_WORD: string;
  IS_DELETED: boolean;
  CREATED_BY?: string;
  CREATED_BY_NAME?: string;
  CREATED_AT?: string;
  UPDATED_BY?: string;
  UPDATED_BY_NAME?: string;
  UPDATED_AT?: string;
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

const TypeEntry: React.FC<TypeEntryProps> = ({ tableName }) => {
  const theme = useTheme();
  const [types, setTypes] = useState<TypeData[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingEntry, setEditingEntry] = useState<TypeData | null>(null);
  const [newEntry, setNewEntry] = useState({
    RECORD_WORD: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TypeData | null>(null);

  const location = useLocation();
  const { isFormDisabled, can_edit, can_delete, isSuperuser } = usePagePermissions(location.pathname, !!editingEntry);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetchTypeEntries();
      console.log("Fetched types data:", response.data); // Debug log
      setTypes(response.data);
    } catch (err) {
      console.error("Error fetching types:", err);
      setError("Failed to fetch types");
    } finally {
      setLoading(false);
    }
  };

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

  const handleEdit = async (type: TypeData) => {
    try {
      setEditingEntry(type);
      setNewEntry({ RECORD_WORD: type.RECORD_WORD });
      setOpen(true);
      console.log("Editing entry:", type); // Debug log
    } catch (err) {
      console.error("Error in handleEdit:", err);
      setError("Failed to load entry for editing");
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      console.log(
        "Submitting entry:",
        editingEntry ? "update" : "create",
        newEntry
      ); // Debug log

      if (editingEntry) {
        // Debug the update call
        console.log("Updating entry ID:", editingEntry.ID);
        const response = await updateTypeEntry(editingEntry.ID, newEntry);
        console.log("Update response:", response); // Debug log
      } else {
        await createTypeEntry(newEntry);
      }

      await fetchData();
      setOpen(false);
      setNewEntry({ RECORD_WORD: "" });
      setEditingEntry(null);
    } catch (err: any) {
      console.error("Error saving type:", err);
      console.error("Error details:", err.response?.data); // Debug log
      setError(err.response?.data?.message || "Failed to save type");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setOpen(false);
    setNewEntry({ RECORD_WORD: "" });
    setEditingEntry(null); // Reset editing entry
  };

  const handleDeleteClick = (item: TypeData) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);
      await deleteTypeEntry(selectedItem.ID);
      await fetchData(); // Refresh data
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
            Type Master Entry
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage employee types and their details
          </Typography>
        </Box>

        <Tooltip title="Add New Type">
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
            Add Type
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
                {types.map((type) => (
                  <TableRow key={type.ID}>
                    <TableCell>{type.ID}</TableCell>
                    <TableCell>{type.RECORD_WORD}</TableCell>
                    <TableCell>{type.CREATED_BY_NAME}</TableCell>
                    <TableCell>
                      {type.CREATED_AT
                        ? new Date(type.CREATED_AT).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>{type.UPDATED_BY_NAME || "-"}</TableCell>
                    <TableCell>
                      {type.UPDATED_AT
                        ? new Date(type.UPDATED_AT).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(type)}
                          color="primary"
                          disabled={!can_edit && !isSuperuser}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(type)}
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
        <DialogTitle>{editingEntry ? "Edit Type" : "Add New Type"}</DialogTitle>
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

export default TypeEntry;
