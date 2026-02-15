import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axiosInstance from "../../../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { usePagePermissions } from "../../../hooks/usePagePermissions";

interface DepartmentFormData {
  DEPARTMENT_ID?: number;
  INSTITUTE_CODE: string;
  NAME: string;
  CODE: string;
  IS_ACTIVE: boolean;
  CREATED_BY?: string;
  UPDATED_BY?: string;
}

const DepartmentEntry: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<DepartmentFormData>({
    INSTITUTE_CODE: "",
    NAME: "",
    CODE: "",
    IS_ACTIVE: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [institutes, setInstitutes] = useState<any[]>([]);

  const location = useLocation();
  const { isFormDisabled } = usePagePermissions(location.pathname, false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    // Load institutes when component mounts
    const fetchInstitutes = async () => {
      try {
        const response = await axiosInstance.get("/api/master/institutes/");
        setInstitutes(response.data);
      } catch (error) {
        console.error("Error fetching institutes:", error);
        setError("Failed to load institutes");
      }
    };
    fetchInstitutes();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = e.target;
    // Checkbox handling
    if ((e.target as HTMLInputElement).type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!token || !user?.user_id) {
        setError("Authentication required");
        navigate("/login");
        return;
      }

      const response = await axiosInstance.post(
        "/api/master/departments/",
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
          INSTITUTE_CODE: "",
          NAME: "",
          CODE: "",
          IS_ACTIVE: true,
        });
        setSuccess("Department created successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Failed to create department");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="institute-select-label">Institute</InputLabel>
            <Select
              labelId="institute-select-label"
              name="INSTITUTE_CODE"
              value={formData.INSTITUTE_CODE}
              label="Institute"
              onChange={(e) => handleChange({ target: { name: "INSTITUTE_CODE", value: e.target.value } })}
              required
              disabled={isFormDisabled}
            >
              <MenuItem value=""><em>Select Institute</em></MenuItem>
              {institutes.map((institute) => (
                <MenuItem key={institute.INSTITUTE_ID} value={institute.CODE}>
                  {institute.NAME}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Department Name"
            name="NAME"
            value={formData.NAME}
            onChange={handleChange}
            required
            variant="outlined"
            inputProps={{ maxLength: 255 }}
            disabled={isFormDisabled}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Department Code"
            name="CODE"
            value={formData.CODE}
            onChange={handleChange}
            required
            variant="outlined"
            inputProps={{ maxLength: 20 }}
            disabled={isFormDisabled}
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.IS_ACTIVE}
                onChange={(e) => setFormData({ ...formData, IS_ACTIVE: e.target.checked })}
                name="IS_ACTIVE"
                color="primary"
                disabled={isFormDisabled}
              />
            }
            label="Is Active"
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading || isFormDisabled}
            sx={{ mt: 2, minWidth: 150 }}
          >
            {loading ? <CircularProgress size={24} /> : "Create Department"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DepartmentEntry;
