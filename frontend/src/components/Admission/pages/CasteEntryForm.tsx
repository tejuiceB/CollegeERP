import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import axiosInstance from "../../../api/axios";
import { Paper, Button, TextField, Box, Typography, Stack, Grid, Snackbar, Alert } from "@mui/material";
import { usePagePermissions } from "../../../hooks/usePagePermissions";
import { useLocation } from "react-router-dom";

const CasteEntryForm = () => {
  const { register, handleSubmit, reset } = useForm();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const location = useLocation();
  const { isFormDisabled } = usePagePermissions(location.pathname);

  const onSubmit = async (data: any) => {
    try {
      const payload = { NAME: data.casteName }; // Map to backend expected key
      await axiosInstance.post("/api/master/caste/", payload);
      console.log("Data submitted successfully:", payload);
      setSnackbarMessage("Caste added successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      reset();
    } catch (error) {
      console.error("Error submitting data:", error);
      setSnackbarMessage("Error submitting data! Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Caste Name"
              {...register("casteName", { required: true })}
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Enter Caste Name"
              disabled={isFormDisabled}
            />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" color="primary" disabled={isFormDisabled}>
            Save
          </Button>
          <Button
            type="button"
            variant="outlined"
            color="secondary"
            onClick={() => reset()}
          >
            Clear
          </Button>
        </Stack>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </motion.div>
  );
};

export default CasteEntryForm;