import React, { useState, useEffect } from "react";
import { Table, Button, Form } from "react-bootstrap";
import axiosInstance from "../../api/axios";
import { useNavigate } from "react-router-dom";
import InstituteEditModal from "./InstituteEditModal"; 

interface InstituteData {
  [key: string]: any;
}

const InstituteTableView: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<InstituteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InstituteData | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axiosInstance.get("/api/master/institutes/", {
            headers: { Authorization: `Bearer ${token}` },
            params: { is_deleted: false }, // Fetch only non-deleted records
        });
        setData(response.data);
        setLoading(false);
    } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to fetch data");
        if (err.response?.status === 401) {
            navigate("/login");
        }
    }
  };


  const handleDelete = async (ids: string[]) => {
    if (!window.confirm("Are you sure you want to mark selected items as deleted?")) {
        return;
    }

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Authentication token not found. Please log in again.");
            navigate("/login");
            return;
        }

        console.log("Soft Deleting IDs:", ids);

        await Promise.all(
            ids.map(async (id) => {
                try {
                    const response = await axiosInstance.patch(
                        `/api/master/institutes/${id}/`,
                        { is_deleted: true }, // Send the soft delete flag
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    console.log(`Marked ID as deleted: ${id}, Status: ${response.status}`);
                } catch (deleteError: any) {
                    console.error(`Error marking ID ${id} as deleted:`, deleteError.response || deleteError.message);
                    alert(`Failed to mark item with ID ${id}: ${deleteError.response?.data?.message || deleteError.message}`);
                }
            })
        );

        fetchData(); // Refresh data after soft deletion
        setSelectedItems([]);
        setSelectAll(false);
        alert("Selected items marked as deleted successfully!");

    } catch (err: any) {
        console.error("Error in handleDelete function:", err.response || err.message);
        alert(err.response?.data?.message || "Failed to mark items as deleted");
    }
  };


  const handleEdit = (item: InstituteData) => {
    // fetch full institute details before editing (list API returns limited fields)
    const id = item.INSTITUTE_ID;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication required");
      return;
    }
    axiosInstance
      .get(`/api/master/institutes/${id}/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((resp) => {
        setEditingItem(resp.data);
        setShowEditModal(true);
      })
      .catch((err) => {
        console.error("Error fetching institute details:", err);
        alert(err.response?.data?.message || "Failed to load institute details");
      });
  };

 // New function to handle update
 const handleUpdate = async (updatedData: InstituteData) => {
    try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication required");
      return;
    }
    const id = updatedData["INSTITUTE_ID"];

    // Normalize WEBSITE and convert year to number where applicable
    const payload: any = { ...updatedData };
    if (payload.WEBSITE && typeof payload.WEBSITE === "string") {
      const trimmed = payload.WEBSITE.trim();
      if (trimmed && !/^(https?:)\/\//i.test(trimmed)) {
        payload.WEBSITE = `http://${trimmed}`;
      } else {
        payload.WEBSITE = trimmed;
      }
    } else {
      // remove empty website to avoid validation errors
      delete payload.WEBSITE;
    }
    if (payload.ESTD_YEAR === "" || payload.ESTD_YEAR === null || payload.ESTD_YEAR === undefined) {
      delete payload.ESTD_YEAR;
    } else if (typeof payload.ESTD_YEAR === "string") {
      const num = Number(payload.ESTD_YEAR);
      if (!isNaN(num)) payload.ESTD_YEAR = num;
    }

    const response = await axiosInstance.put(
      `/api/master/institutes/${id}/`,
      payload,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    
        if (response.status === 200) {
            setShowEditModal(false);
            fetchData();
            alert("Institute updated successfully!");
        }
    } 
    catch (err: any) {
        console.error("Error updating item:", err);
        alert(err.response?.data?.message || "Failed to update institute");
    }
    };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h4>Institute List</h4>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Institute ID</th>
            <th>Name</th>
            <th>Code</th>
            <th>Address</th>
            <th>Contact Number</th>
            <th>Email</th>
            <th>Website</th>
            <th>Established Year</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.INSTITUTE_ID}>
              <td>{item.INSTITUTE_ID}</td>
              <td>{item.NAME}</td>
              <td>{item.CODE}</td>
              <td>{item.ADDRESS}</td>
              <td>{item.CONTACT_NUMBER}</td>
              <td>{item.EMAIL}</td>
              <td>{item.WEBSITE}</td>
              <td>{item.ESTD_YEAR}</td>
              <td>
                <Button
                  variant="primary"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete([item.INSTITUTE_ID])}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {editingItem && (
    <InstituteEditModal
        show={showEditModal}
        item={editingItem} // Make sure 'item' is passed correctly
        onSave={handleUpdate}
        onClose={() => setShowEditModal(false)}
    />
)}
    </div>
  );
};

export default InstituteTableView;
