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
  Typography,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import axiosInstance from "../../../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { usePagePermissions } from "../../../hooks/usePagePermissions";

// Define module types
type ModuleType = "master" | "student" | "staff";
type PermissionType = {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
};

interface DesignationFormData {
  DESIGNATION_ID?: number;
  NAME: string;
  CODE: string;
  DESCRIPTION: string;
  PERMISSIONS: Record<ModuleType, PermissionType>;
  IS_ACTIVE: boolean;
  CREATED_BY?: string;
  UPDATED_BY?: string;
}

const defaultPermissions: Record<ModuleType, PermissionType> = {
  master: {
    view: false,
    create: false,
    update: false,
    delete: false,
  },
  student: {
    view: false,
    create: false,
    update: false,
    delete: false,
  },
  staff: {
    view: false,
    create: false,
    update: false,
    delete: false,
  },
};

const DesignationEntry: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<DesignationFormData>({
    NAME: "",
    CODE: "",
    DESCRIPTION: "",
    PERMISSIONS: defaultPermissions,
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
      [name]: value,
    }));
  };

  const handlePermissionChange = (
    module: ModuleType,
    action: keyof PermissionType,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      PERMISSIONS: {
        ...prev.PERMISSIONS,
        [module]: {
          ...prev.PERMISSIONS[module],
          [action]: checked,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        "/api/master/designations/",
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

      setFormData({
        NAME: "",
        CODE: "",
        DESCRIPTION: "",
        PERMISSIONS: defaultPermissions,
        IS_ACTIVE: true,
      });
      setSuccess("Designation created successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Failed to create designation");
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
            label="Designation Name"
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
            label="Designation Code"
            name="CODE"
            value={formData.CODE}
            onChange={handleChange}
            required
            variant="outlined"
            inputProps={{ maxLength: 20, style: { textTransform: 'uppercase' } }}
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
            inputProps={{ maxLength: 500 }}
            disabled={isFormDisabled}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Permissions</Typography>
        </Grid>

        {Object.keys(defaultPermissions).map((moduleKey) => {
          const module = moduleKey as ModuleType;
          return (
            <Grid item xs={12} md={4} key={module}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ textTransform: 'capitalize', mb: 1 }}>
                    {module}
                  </Typography>
                  <Grid container>
                    {Object.keys(defaultPermissions[module]).map((actionKey) => {
                      const action = actionKey as keyof PermissionType;
                      return (
                        <Grid item xs={6} key={`${module}-${action}`}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.PERMISSIONS[module][action]}
                                onChange={(e) => handlePermissionChange(module, action, e.target.checked)}
                                size="small"
                                disabled={isFormDisabled}
                              />
                            }
                            label={<Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{action}</Typography>}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}

        <Grid item xs={12}>
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
            {loading ? <CircularProgress size={24} /> : "Create Designation"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DesignationEntry;
