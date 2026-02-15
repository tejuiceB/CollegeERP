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

interface StateData {
  STATE_ID: number;
  NAME: string;
}

interface CityFormData {
  CITY_ID?: number;
  STATE: number;
  NAME: string;
  CODE: string;
  IS_ACTIVE: boolean;
  CREATED_BY?: string;
  UPDATED_BY?: string;
}

const CityEntry: React.FC = () => {
  const navigate = useNavigate();
  const [states, setStates] = useState<StateData[]>([]);
  const [formData, setFormData] = useState<CityFormData>({
    STATE: 0,
    NAME: "",
    CODE: "",
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
      return;
    }
    // Call fetchStates only if we have a token
    fetchStates(token);
  }, [navigate]);

  const fetchStates = async (token: string) => {
    try {
      const response = await axiosInstance.get("/api/master/states/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setStates(response.data);
    } catch (err: any) {
      console.error("Error fetching states:", err);
      if (err.response?.status === 401) {
        // If token is invalid/expired, redirect to login
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to fetch states");
      }
    }
  };

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
      if (!token) {
        navigate("/login");
        return;
      }

      if (formData.STATE === 0) {
        setError("Please select a state");
        setLoading(false);
        return;
      }

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      await axiosInstance.post(
        "/api/master/cities/",
        {
          ...formData,
          CODE: formData.CODE.toUpperCase(),
          CREATED_BY: user.username,
          UPDATED_BY: user.username,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setFormData({
        STATE: 0,
        NAME: "",
        CODE: "",
        IS_ACTIVE: true,
      });
      setSuccess("City created successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Failed to create city");
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
          <FormControl fullWidth>
            <InputLabel id="state-select-label">State</InputLabel>
            <Select
              labelId="state-select-label"
              name="STATE"
              value={formData.STATE === 0 ? '' : formData.STATE}
              label="State"
              onChange={(e) => handleChange({ target: { name: "STATE", value: e.target.value } })}
              required
              disabled={isFormDisabled}
            >
              <MenuItem value=""><em>Select State</em></MenuItem>
              {states.map((state) => (
                <MenuItem key={state.STATE_ID} value={state.STATE_ID}>
                  {state.NAME}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="City Name"
            name="NAME"
            value={formData.NAME}
            onChange={handleChange}
            required
            variant="outlined"
            disabled={isFormDisabled}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="City Code"
            name="CODE"
            value={formData.CODE}
            onChange={handleChange}
            required
            variant="outlined"
            inputProps={{ maxLength: 5, style: { textTransform: 'uppercase' } }}
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
            {loading ? <CircularProgress size={24} /> : "Create City"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CityEntry;
