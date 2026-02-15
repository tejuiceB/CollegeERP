import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import { Modal, Box, TextField, Button, Typography, FormControlLabel, Checkbox, Snackbar, Alert, Stack } from "@mui/material";

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  masterType: string;
  id: number;
  initialData: { NAME: string; IS_MANDATORY?: boolean };
  refreshData: () => void;
  isReadOnly?: boolean;
}

const EditModal: React.FC<EditModalProps> = ({ open, onClose, masterType, id, initialData, refreshData, isReadOnly }) => {
  const [name, setName] = useState(initialData?.NAME || "");
  const [isMandatory, setIsMandatory] = useState(initialData?.IS_MANDATORY || false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  useEffect(() => {
    if (initialData) {
      setName(initialData.NAME);
      if (masterType === 'checklist') {
        setIsMandatory(initialData.IS_MANDATORY || false);
      }
    }
  }, [initialData, masterType]);

  const handleSave = async () => {
    try {
      const payload: any = { NAME: name };
      if (masterType === 'checklist') {
        payload.IS_MANDATORY = isMandatory;
      }

      await axiosInstance.put(`api/master/${masterType}/${id}/`, payload);

      setSnackbarMessage("Data updated successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      // Delay close to show snackbar? Or just refresh.
      // Better to close modal and let parent refresh, usually. 
      // But snackbar is inside modal, so we must wait or move snackbar out.
      // For simplicity, let's just close after a short delay or immediately and trust user sees it?
      // Actually, if we close modal, snackbar unmounts. 
      // Let's just alert (non-blocking) or rely on parent. 
      // Reverting to simple alert but styled? No, let's keep it simple.
      // I'll just call refresh data and close, parent can show toast if needed.
      // Or I'll wait 1 second.
      setTimeout(() => {
        refreshData();
        onClose();
      }, 500);

    } catch (error) {
      console.error("Error updating data:", error);
      setSnackbarMessage("Error updating data!");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Edit {masterType.charAt(0).toUpperCase() + masterType.slice(1)}
        </Typography>

        <TextField
          label="Name"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ my: 2 }}
          disabled={isReadOnly}
        />

        {masterType === 'checklist' && (
          <FormControlLabel
            control={
              <Checkbox
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
                color="primary"
                disabled={isReadOnly}
              />
            }
            label="Is Mandatory?"
            sx={{ mb: 2, display: 'block' }}
          />
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={isReadOnly}>
            Save
          </Button>
        </Stack>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

      </Box>
    </Modal>
  );
};

export default EditModal;

// commit