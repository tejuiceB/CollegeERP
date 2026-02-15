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
  Typography
} from "@mui/material";
import axiosInstance from "../../../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { usePagePermissions } from "../../../hooks/usePagePermissions";

interface CountryData {
  COUNTRY_ID: number;
  NAME: string;
}

interface StateFormData {
  STATE_ID?: number;
  COUNTRY: number;
  NAME: string;
  CODE: string;
  IS_ACTIVE: boolean;
  CREATED_BY?: string;
  UPDATED_BY?: string;
}

const StateEntry: React.FC = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [formData, setFormData] = useState<StateFormData>({
    COUNTRY: 0,
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
    fetchCountries();
  }, [navigate]);

  const fetchCountries = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get("/api/master/countries/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCountries(response.data);
    } catch (err) {
      console.error("Error fetching countries:", err);
      setError("Failed to fetch countries");
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
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!token || !user?.user_id) {
        setError("Authentication required");
        navigate("/login");
        return;
      }

      if (formData.COUNTRY === 0) {
        setError("Please select a country");
        setLoading(false);
        return;
      }

      const response = await axiosInstance.post(
        "/api/master/states/",
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
          COUNTRY: 0,
          NAME: "",
          CODE: "",
          IS_ACTIVE: true,
        });
        setSuccess("State created successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Failed to create state");
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
            <InputLabel id="country-select-label">Country</InputLabel>
            <Select
              labelId="country-select-label"
              name="COUNTRY"
              value={formData.COUNTRY === 0 ? '' : formData.COUNTRY}
              label="Country"
              onChange={(e) => handleChange({ target: { name: "COUNTRY", value: e.target.value } })}
              required
              disabled={isFormDisabled}
            >
              <MenuItem value=""><em>Select Country</em></MenuItem>
              {countries.map((country) => (
                <MenuItem key={country.COUNTRY_ID} value={country.COUNTRY_ID}>
                  {country.NAME}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="State Name"
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
            label="State Code"
            name="CODE"
            value={formData.CODE}
            onChange={handleChange}
            required
            variant="outlined"
            inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
            helperText="2 characters (e.g., MH)"
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
            {loading ? <CircularProgress size={24} /> : "Create State"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StateEntry;
