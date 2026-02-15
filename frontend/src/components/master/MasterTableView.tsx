import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import { useNavigate } from "react-router-dom";
import EditModal from "./EditModal";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import { useSettings } from "../../context/SettingsContext";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import { usePagePermissions } from "../../hooks/usePagePermissions";
import { useLocation } from "react-router-dom";

interface MasterData {
  [key: string]: any;
}

interface MasterTableViewProps {
  tableName: string;
  isReadOnly?: boolean;
}

const getEndpointName = (tableName: string): string => {
  const irregularPlurals: { [key: string]: string } = {
    country: "countries",
    city: "cities",
    currency: "currencies",
    category: "categories",
  };

  // CourseMaster tables use singular endpoints
  const singularEndpoints: { [key: string]: string } = {
    program: "program",
    branch: "branch",
    year: "year",
    semester: "semester",
  };

  const lowerTableName = tableName.toLowerCase();

  // Check if it's a singular endpoint first
  if (singularEndpoints[lowerTableName]) {
    return singularEndpoints[lowerTableName];
  }

  // Then check irregular plurals
  return irregularPlurals[lowerTableName] || `${tableName}s`;
};

const MasterTableView: React.FC<MasterTableViewProps> = ({ tableName, isReadOnly = false }) => {
  const navigate = useNavigate();
  const { darkMode } = useSettings();
  const [data, setData] = useState<MasterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterData | null>(null);
  const [relatedData, setRelatedData] = useState<any[]>([]);

  const location = useLocation();
  const { can_edit, can_delete, isSuperuser } = usePagePermissions(location.pathname);

  useEffect(() => {
    fetchData();
    fetchRelatedData();
  }, [tableName]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = getEndpointName(tableName);
      const response = await axiosInstance.get(`/api/master/${endpoint}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setData(response.data);
      setError("");
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to fetch data");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (tableName === "state") {
        const response = await axiosInstance.get("/api/master/countries/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRelatedData(response.data);
      } else if (tableName === "city") {
        const response = await axiosInstance.get("/api/master/states/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRelatedData(response.data);
      }
    } catch (err) {
      console.error("Error fetching related data:", err);
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!window.confirm("Are you sure you want to delete selected items?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const endpoint = getEndpointName(tableName);
      await Promise.all(
        ids.map((id) =>
          axiosInstance.delete(`/api/master/${endpoint}/${id}/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      fetchData();
      setSelectedItems([]);
      alert("Selected items deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting items:", err);
      alert(err.response?.data?.message || "Failed to delete items");
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data.map((item) => item[`${tableName.toUpperCase()}_ID`]);
      setSelectedItems(newSelected);
      return;
    }
    setSelectedItems([]);
  };

  const handleSelect = (id: string) => {
    const selectedIndex = selectedItems.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedItems, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedItems.slice(1));
    } else if (selectedIndex === selectedItems.length - 1) {
      newSelected = newSelected.concat(selectedItems.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedItems.slice(0, selectedIndex),
        selectedItems.slice(selectedIndex + 1)
      );
    }

    setSelectedItems(newSelected);
  };

  const handleEdit = (item: MasterData) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleUpdate = async (updatedData: MasterData) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = getEndpointName(tableName);
      const id = updatedData[`${tableName.toUpperCase()}_ID`];

      const response = await axiosInstance.put(
        `/api/master/${endpoint}/${id}/`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setShowEditModal(false);
        fetchData();
        alert(`${tableName} updated successfully!`);
      }
    } catch (err: any) {
      console.error("Error updating item:", err);
      alert(err.response?.data?.message || `Failed to update ${tableName}`);
    }
  };

  const getColumnHeaders = () => {
    if (data.length === 0) return [];
    const item = data[0];
    return Object.keys(item).filter(
      (key) =>
        !["CREATED_BY", "UPDATED_BY", "CREATED_AT", "UPDATED_AT"].includes(key)
    );
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const idField = `${tableName.toUpperCase()}_ID`;

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        overflow: "hidden",
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2
      }}
    >
      <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" component="div" sx={{ textTransform: 'capitalize' }}>
          {tableName} List
        </Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {selectedItems.length > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => handleDelete(selectedItems)}
              size="small"
              disabled={!can_delete && !isSuperuser}
            >
              Delete ({selectedItems.length})
            </Button>
          )}
        </Box>
      </Box>

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="sticky table" size="medium">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={
                    selectedItems.length > 0 && selectedItems.length < data.length
                  }
                  checked={data.length > 0 && selectedItems.length === data.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              {getColumnHeaders().map((header) => (
                <TableCell
                  key={header}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                  }}
                >
                  {header.replace(/_/g, " ")}
                </TableCell>
              ))}
              <TableCell
                sx={{
                  fontWeight: 600,
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => {
              const isItemSelected = selectedItems.indexOf(item[idField]) !== -1;
              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={item[idField]}
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onChange={() => handleSelect(item[idField])}
                    />
                  </TableCell>
                  {getColumnHeaders().map((header) => (
                    <TableCell key={header}>
                      {typeof item[header] === 'boolean'
                        ? (item[header] ? "Yes" : "No")
                        : String(item[header])
                      }
                    </TableCell>
                  ))}
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(item)}
                        disabled={!can_edit && !isSuperuser}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete([item[idField]])}
                        disabled={!can_delete && !isSuperuser}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={getColumnHeaders().length + 2} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">No data found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {editingItem && (
        <EditModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          onSave={handleUpdate}
          data={editingItem}
          tableName={tableName}
          relatedData={relatedData}
          isReadOnly={!can_edit && !isSuperuser}
        />
      )}
    </Paper>
  );
};

export default MasterTableView;
