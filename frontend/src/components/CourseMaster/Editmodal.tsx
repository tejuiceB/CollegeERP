import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "../../api/axios";

interface Program {
  PROGRAM_ID: number;
  CODE: string;
  NAME: string;
}

interface Institute {
  INSTITUTE_ID: number;
  CODE: string;
  NAME: string;
}

interface EditModalProps<T extends Record<string, any>> {
  show: boolean;
  onHide: () => void;
  onSave: (updatedData: T) => void;
  data: T | null;
  title: string;
}

const EditModal = <T extends Record<string, any>>({
  show,
  onHide,
  onSave,
  data,
  title,
}: EditModalProps<T>) => {
  const [formData, setFormData] = useState<T>({} as T);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);

  useEffect(() => {
    if (show && data) {
      fetchInstitutes();
      fetchPrograms();
      setFormData(data);
    }
  }, [show, data]);

  const fetchInstitutes = async () => {
    try {
      const response = await axiosInstance.get("/api/master/institutes/");
      setInstitutes(response.data);
    } catch (error) {
      console.error("Error fetching institutes:", error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await axiosInstance.get("/api/master/program/");
      setPrograms(response.data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const excludedFields = [
    "PROGRAM_ID",
    "CREATED_BY",
    "INSTITUTE",
    "DESCRIPTION",
    "UPDATED_BY",
    "SEMESTER_ID",
    "PROGRAM",
    "BRANCH_ID",
    "BRANCH",
    "YEAR_ID",
    "CREATED_AT",
    "UPDATED_AT",
    // Read-only display fields (shown in table but not editable)
    "PROGRAM_CODE",
    "PROGRAM_NAME",
    "INSTITUTE_CODE",
    "INSTITUTE_NAME",
    "BRANCH_CODE",
    "BRANCH_NAME",
    "YEAR_YEAR",
  ];

  const renderField = (key: string) => {
    const value = formData[key];

    // Special handling for IS_ACTIVE checkbox
    if (key === "IS_ACTIVE") {
      return (
        <FormControlLabel
          key={key}
          control={
            <Checkbox
              name={key}
              checked={Boolean(value)}
              onChange={handleChange}
            />
          }
          label="Is Active"
        />
      );
    }

    // Regular text fields
    return (
      <TextField
        key={key}
        fullWidth
        label={key.replace(/_/g, " ")}
        name={key}
        value={value || ""}
        onChange={handleChange}
        margin="normal"
        variant="outlined"
      />
    );
  };

  return (
    <Dialog open={show} onClose={onHide} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Edit {title}</Typography>
          <IconButton onClick={onHide} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ pt: 1 }}>
          {Object.keys(formData)
            .filter((key) => !excludedFields.includes(key))
            .map((key) => renderField(key))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onHide} variant="outlined" color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditModal;