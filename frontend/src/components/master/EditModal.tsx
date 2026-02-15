import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useSettings } from "../../context/SettingsContext";

interface EditModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (data: any) => void;
  data: any;
  tableName: string;
  relatedData?: any[];
  isReadOnly?: boolean;
}

const EditModal: React.FC<EditModalProps> = ({
  show,
  onHide,
  onSave,
  data,
  tableName,
  relatedData,
  isReadOnly = false,
}) => {
  const { darkMode } = useSettings();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [formData, setFormData] = useState<any>(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = e.target;
    const type = (e.target as HTMLInputElement).type;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev: any) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? parseFloat(value)
            : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderFormField = (key: string, value: any) => {
    // Skip these fields in the form
    if (
      ["CREATED_BY", "UPDATED_BY", "CREATED_AT", "UPDATED_AT"].includes(key)
    ) {
      return null;
    }

    // Handle special cases based on field name and table
    if (key === "IS_ACTIVE") {
      return (
        <FormControlLabel
          key={key}
          control={
            <Checkbox
              checked={value}
              onChange={handleChange}
              name={key}
              color="primary"
              disabled={isReadOnly}
            />
          }
          label="Is Active"
        />
      );
    }

    // Handle foreign key relationships
    if (key === "COUNTRY" && tableName === "state") {
      return (
        <FormControl fullWidth key={key} margin="normal">
          <InputLabel>Country</InputLabel>
          <Select
            name={key}
            value={value}
            label="Country"
            onChange={(e) => handleChange({ target: { name: key, value: e.target.value } })}
            required
            disabled={isReadOnly}
          >
            <MenuItem value="">
              <em>Select Country</em>
            </MenuItem>
            {relatedData?.map((country: any) => (
              <MenuItem key={country.COUNTRY_ID} value={country.COUNTRY_ID}>
                {country.NAME}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    if (key === "STATE" && tableName === "city") {
      return (
        <FormControl fullWidth key={key} margin="normal">
          <InputLabel>State</InputLabel>
          <Select
            name={key}
            value={value}
            label="State"
            onChange={(e) => handleChange({ target: { name: key, value: e.target.value } })}
            required
            disabled={isReadOnly}
          >
            <MenuItem value="">
              <em>Select State</em>
            </MenuItem>
            {relatedData?.map((state: any) => (
              <MenuItem key={state.STATE_ID} value={state.STATE_ID}>
                {state.NAME}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    // Handle number inputs
    if (key === "RESERVATION_PERCENTAGE") {
      return (
        <TextField
          key={key}
          fullWidth
          margin="normal"
          label={key.replace(/_/g, " ")}
          type="number"
          name={key}
          value={value}
          onChange={handleChange}
          inputProps={{ min: 0, max: 100, step: 0.01 }}
          required
          disabled={isReadOnly}
        />
      );
    }

    // Default text input
    return (
      <TextField
        key={key}
        fullWidth
        margin="normal"
        label={key.replace(/_/g, " ")}
        type="text"
        name={key}
        value={value || ""}
        onChange={handleChange}
        required={key !== "DESCRIPTION"}
        disabled={isReadOnly}
      />
    );
  };

  return (
    <Dialog
      open={show}
      onClose={onHide}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "#1e1e1e" : "#ffffff",
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Edit {tableName.charAt(0).toUpperCase() + tableName.slice(1)}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {Object.entries(formData).map(([key, value]) => {
              const field = renderFormField(key, value);
              if (!field) return null;
              return (
                <Grid item xs={12} sm={6} key={key}>
                  {field}
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onHide} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={isReadOnly}>
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditModal;