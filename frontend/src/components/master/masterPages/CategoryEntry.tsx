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
} from "@mui/material";
import axiosInstance from "../../../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { usePagePermissions } from "../../../hooks/usePagePermissions";

interface CategoryFormData {
  CATEGORY_ID?: number;
  NAME: string;
  CODE: string;
  DESCRIPTION: string;
  RESERVATION_PERCENTAGE: number;
  IS_ACTIVE: boolean;
  CREATED_BY?: string;
  UPDATED_BY?: string;
}

const CategoryEntry: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CategoryFormData>({
    NAME: "",
    CODE: "",
    DESCRIPTION: "",
    RESERVATION_PERCENTAGE: 0,
    IS_ACTIVE: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const location = useLocation();
  const { isFormDisabled } = usePagePermissions(location.pathname, false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      [name]: name === "RESERVATION_PERCENTAGE" ? parseFloat(value) : value,
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

      if (!token || !user?.username) {
        setError("Authentication required");
        navigate("/login");
        return;
      }

      const response = await axiosInstance.post(
        "/api/master/categories/",
        {
          ...formData,
          CODE: formData.CODE.toUpperCase(),
          CREATED_BY: user.username,
          UPDATED_BY: user.username,
          RESERVATION_PERCENTAGE: parseFloat(
            formData.RESERVATION_PERCENTAGE.toString()
          ),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        setFormData({
          NAME: "",
          CODE: "",
          DESCRIPTION: "",
          RESERVATION_PERCENTAGE: 0,
          IS_ACTIVE: true,
        });
        setSuccess("Category created successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      console.error("Error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Failed to create category";

      // If there's a specific field error, add it to the message
      const fieldError = err.response?.data?.field;
      setError(fieldError ? `${errorMessage} (${fieldError})` : errorMessage);

      if (err.response?.status === 401) {
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
          <TextField
            fullWidth
            label="Category Name"
            name="NAME"
            value={formData.NAME}
            onChange={handleChange}
            required
            variant="outlined"
            inputProps={{ maxLength: 50 }}
            disabled={isFormDisabled}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Category Code"
            name="CODE"
            value={formData.CODE}
            onChange={handleChange}
            required
            variant="outlined"
            inputProps={{ maxLength: 10 }}
            disabled={isFormDisabled}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="DESCRIPTION"
            value={formData.DESCRIPTION}
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
            label="Reservation Percentage"
            name="RESERVATION_PERCENTAGE"
            value={formData.RESERVATION_PERCENTAGE}
            onChange={handleChange}
            required
            type="number"
            variant="outlined"
            inputProps={{ min: 0, max: 100, step: 0.01 }}
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
            {loading ? <CircularProgress size={24} /> : "Create Category"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CategoryEntry;
