import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Box
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditModal from "./EditModal";
import { usePagePermissions } from "../../hooks/usePagePermissions";
import { useLocation } from "react-router-dom";

interface MasterTableViewProps {
  masterType: string;
  isReadOnly?: boolean;
}

const MasterTableView: React.FC<MasterTableViewProps> = ({ masterType, isReadOnly = false }) => {
  interface DataItem {
    id: number;
    NAME: string;
    IS_MANDATORY?: boolean; // For checklist
  }

  const [dataList, setDataList] = useState<DataItem[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);

  const location = useLocation();
  const { can_edit, can_delete, isSuperuser } = usePagePermissions(location.pathname);

  useEffect(() => {
    fetchData();
  }, [masterType]);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`api/master/${masterType}/`);
      // Adapt response based on known structure or dynamic mapping
      setDataList(
        response.data.map((item: any) => ({
          id: item.CASTE_ID || item.QUOTA_ID || item.ADMN_QUOTA_ID || item.RECORD_ID || item.id,
          NAME: item.NAME || item.CASTE_NAME, // Handle CASTE_NAME if returned by API
          IS_MANDATORY: item.IS_MANDATORY
        }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      // Removed alert to be less intrusive, or use Snackbar if parent provided it
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    let endpoint = `api/master/${masterType}/${id}/`;

    try {
      await axiosInstance.delete(endpoint);
      setDataList((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("Error deleting data!");
    }
  };

  const handleEdit = (item: DataItem) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const getTitle = () => {
    switch (masterType) {
      case 'caste': return 'Caste List';
      case 'quota': return 'Quota List';
      case 'admission': return 'Admission Quota List';
      case 'checklist': return 'Checklist Documents';
      default: return `${masterType} List`;
    }
  }

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Typography variant="h6" gutterBottom align="left" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
        {getTitle()}
      </Typography>

      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Name</TableCell>
              {masterType === 'checklist' && <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Mandatory</TableCell>}
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataList.length > 0 ? (
              dataList.map((item) => (
                <TableRow
                  key={item.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {item.id}
                  </TableCell>
                  <TableCell>{item.NAME}</TableCell>
                  {masterType === 'checklist' && (
                    <TableCell>{item.IS_MANDATORY ? "Yes" : "No"}</TableCell>
                  )}
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(item)}
                        size="small"
                        disabled={!can_edit && !isSuperuser}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(item.id)}
                        size="small"
                        disabled={!can_delete && !isSuperuser}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={masterType === 'checklist' ? 4 : 3} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    No records found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedItem && (
        <EditModal
          open={editModalOpen}
          // @ts-ignore
          onClose={() => setEditModalOpen(false)}
          masterType={masterType}
          id={selectedItem.id}
          initialData={selectedItem}
          refreshData={fetchData}
          isReadOnly={!can_edit && !isSuperuser}
        />
      )}
    </Box>
  );
};

export default MasterTableView;
