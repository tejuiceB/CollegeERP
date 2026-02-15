
import React, { useState, useEffect } from "react";
import {
  TextField,
  Grid,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Divider,
  FormControlLabel,
  Checkbox,
  Avatar,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import type { Dayjs } from "dayjs";
import { EmployeeFormData } from "./types";
import axios from "axios";
import {
  fetchTypeEntries,
  fetchShiftEntries,
  fetchStatusEntries,
} from "../../api/establishmentService";
import { SelectChangeEvent } from "@mui/material/Select";
import { masterService } from "../../api/masterService";
import { instituteService } from "../../api/instituteService";
import { employeeService } from "../../api/MasterEmployeeService";
import SearchEmployeeDialog from "./SearchEmployeeDialog";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";

const CreateEmployee = () => {
  const initialFormState: EmployeeFormData = {
    institute: "",
    department: "", // Change back to empty string
    shortCode: "",
    empType: "",
    empName: "",
    fatherName: "",
    motherName: "",
    dateOfBirth: null,
    designation: "",
    permanentAddress: "",
    email: "",
    localAddress: "",
    panNo: "",
    permanentCity: "",
    permanentPinNo: "",
    drivingLicNo: "",
    sex: "",
    status: "",
    maritalStatus: "",
    dateOfJoin: null,
    localCity: "",
    localPinNo: "",
    position: "",
    shift: "",
    bloodGroup: "",
    active: "yes",
    phoneNo: "",
    mobileNo: "",
    category: "", // Change back to empty string
    bankAccountNo: "",
    unaNo: "",
    profileImage: null,
  };

  const [formData, setFormData] = useState<EmployeeFormData>(initialFormState);

  const [institutes, setInstitutes] = useState([
    { id: "1", name: "Institute 1" },
    { id: "2", name: "Institute 2" },
  ]);

  const [sameAsPermAddress, setSameAsPermAddress] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [employeeTypes, setEmployeeTypes] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    // Essential fields for Admin
    const requiredFields = {
      institute: "Institute",
      department: "Department",
      empType: "Employee Type",
      empName: "Employee Name",
      designation: "Designation",
      email: "Email",
      // Mobile is optional but recommended, strict validation only on above
    };

    Object.entries(requiredFields).forEach(([key, label]) => {
      if (!formData[key as keyof EmployeeFormData]) {
        newErrors[key] = "This field is missing";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [openSearch, setOpenSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const response = await instituteService.getInstitutes();
        console.log("Institutes:", response.data);
        setInstitutes(response.data);
      } catch (error) {
        console.error("Error fetching institutes:", error);
      }
    };
    fetchInstitutes();
  }, []);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [typeRes, shiftRes, statusRes] = await Promise.all([
          fetchTypeEntries(),
          fetchShiftEntries(),
          fetchStatusEntries(),
        ]);

        // Log the raw responses to see their structure
        console.log("Raw Type Data:", typeRes.data);
        console.log("Raw Shift Data:", shiftRes.data);
        console.log("Raw Status Data:", statusRes.data);

        // Set the state without filtering
        setEmployeeTypes(typeRes.data || []);
        setShifts(shiftRes.data || []);
        setStatuses(statusRes.data || []);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [deptRes, desigRes] = await Promise.all([
          masterService.getDepartments(),
          masterService.getDesignations(),
        ]);
        console.log("Departments:", deptRes.data);
        console.log("Designations:", desigRes.data);
        setDepartments(deptRes.data);
        setDesignations(desigRes.data);
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };
    fetchMasterData();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await masterService.getCategories();
        console.log("Categories:", response.data);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Debug helper
  useEffect(() => {
    console.log("Employee Types:", employeeTypes);
    console.log("Shifts:", shifts);
    console.log("Statuses:", statuses);
  }, [employeeTypes, shifts, statuses]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log(`Input changed - name: ${name}, value: ${value}`); // Debug log
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add new handler for Select components
  const handleSelectChange = (e: SelectChangeEvent) => {
    console.log("Select Change:", e.target.name, e.target.value);
    setFormData((prev) => {
      const newState = {
        ...prev,
        [e.target.name]: e.target.value,
      };
      console.log("New Form Data:", newState);
      return newState;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        profileImage: file,
      });
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  // Cleanup preview URL on component unmount
  React.useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleDateChange =
    (field: "dateOfBirth" | "dateOfJoin") => (date: Date | null) => {
      setFormData({
        ...formData,
        [field]: date,
      });
    };

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (sameAsPermAddress && name.startsWith("permanent")) {
        const localField = name.replace("permanent", "local");
        return {
          ...prev,
          [name]: value,
          [localField]: value,
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSameAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = event.target.checked;
    setSameAsPermAddress(isChecked);

    if (isChecked) {
      // When checkbox is checked, copy all permanent address fields to local
      setFormData((prev) => ({
        ...prev,
        localAddress: prev.permanentAddress,
        localCity: prev.permanentCity,
        localPinNo: prev.permanentPinNo,
      }));
    }
  };

  const resetForm = () => {
    // Reset all form fields to initial state
    setFormData(initialFormState);
    setPhotoPreview(null);
    setIsEditing(false);
    setCurrentEmployeeId(null);
    setSameAsPermAddress(false); // Reset address checkbox

    // Reset any touched/modified form fields
    const formElements = document.querySelector("form");
    if (formElements) {
      formElements.reset();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setNotification({
        open: true,
        message: "Please fill in all required fields marked with *",
        severity: "error",
      });
      return;
    }

    try {
      const formDataObj = new FormData();

      // Core Required Fields (Validated)
      formDataObj.append("INSTITUTE", formData.institute);
      formDataObj.append("DEPARTMENT", String(formData.department));
      formDataObj.append("EMP_TYPE", String(formData.empType));
      formDataObj.append("EMP_NAME", formData.empName);
      formDataObj.append("DESIGNATION", formData.designation);
      if (formData.email) formDataObj.append("EMAIL", formData.email);

      // Other Fields (Send value only if present)
      if (formData.shortCode) formDataObj.append("SHORT_CODE", formData.shortCode);
      if (formData.position) formDataObj.append("POSITION", formData.position);
      if (formData.fatherName) formDataObj.append("FATHER_NAME", formData.fatherName);
      if (formData.motherName) formDataObj.append("MOTHER_NAME", formData.motherName);

      // Dates - Send only if valid
      if (formData.dateOfBirth) {
        formDataObj.append("DATE_OF_BIRTH", new Date(formData.dateOfBirth).toISOString().split("T")[0]);
      }
      if (formData.dateOfJoin) {
        formDataObj.append("DATE_OF_JOIN", new Date(formData.dateOfJoin).toISOString().split("T")[0]);
      }

      if (formData.mobileNo) formDataObj.append("MOBILE_NO", formData.mobileNo);
      if (formData.phoneNo) formDataObj.append("PHONE_NO", formData.phoneNo);

      // Selects & FKs - Only send if selected
      if (formData.sex) formDataObj.append("SEX", formData.sex);
      if (formData.status) formDataObj.append("STATUS", formData.status);
      if (formData.maritalStatus) formDataObj.append("MARITAL_STATUS", formData.maritalStatus);
      if (formData.shift) formDataObj.append("SHIFT", formData.shift);
      if (formData.category) formDataObj.append("CATEGORY", String(formData.category));
      if (formData.bloodGroup) formDataObj.append("BLOOD_GROUP", formData.bloodGroup);

      formDataObj.append("IS_ACTIVE", formData.active || "yes");

      // Address
      if (formData.permanentAddress) formDataObj.append("PERMANENT_ADDRESS", formData.permanentAddress);
      if (formData.permanentCity) formDataObj.append("PERMANENT_CITY", formData.permanentCity);
      if (formData.permanentPinNo) formDataObj.append("PERMANENT_PIN", formData.permanentPinNo);
      if (formData.localAddress) formDataObj.append("LOCAL_ADDRESS", formData.localAddress);
      if (formData.localCity) formDataObj.append("LOCAL_CITY", formData.localCity);
      if (formData.localPinNo) formDataObj.append("LOCAL_PIN", formData.localPinNo);

      // Banking/IDs
      if (formData.panNo) formDataObj.append("PAN_NO", formData.panNo);
      if (formData.drivingLicNo) formDataObj.append("DRIVING_LICENSE_NO", formData.drivingLicNo);
      if (formData.bankAccountNo) formDataObj.append("BANK_ACCOUNT_NO", formData.bankAccountNo);
      if (formData.unaNo) formDataObj.append("UAN_NO", formData.unaNo);

      // Add profile image if exists
      if (formData.profileImage) {
        formDataObj.append("PROFILE_IMAGE", formData.profileImage);
      }

      // Log data being sent
      console.log("Sending data:", Object.fromEntries(formDataObj));

      let response;
      if (isEditing && currentEmployeeId) {
        // Only include fields that have changed
        const currentEmployee = await employeeService.getEmployee(
          currentEmployeeId
        );
        const changedFields = {};

        // Add only changed fields to formData
        Object.entries(formData).forEach(([key, value]) => {
          const apiKey = key.toUpperCase();
          if (value !== currentEmployee.data[apiKey]) {
            formDataObj.append(apiKey, value);
          }
        });

        // Always include profile image if selected
        if (formData.profileImage) {
          formDataObj.append("PROFILE_IMAGE", formData.profileImage);
        }

        response = await employeeService.updateEmployee(
          currentEmployeeId,
          formDataObj
        );
      } else {
        response = await employeeService.createEmployee(formDataObj);
      }

      setNotification({
        open: true,
        message: isEditing
          ? "Employee updated successfully!"
          : `Employee created successfully! Employee ID: ${response.data.employee_id}`,
        severity: "success",
      });

      // Call resetForm after successful submission
      resetForm();
    } catch (error: any) {
      console.error("Submit Error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create employee";
      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Add this helper function at the top of the component
  const RequiredLabel = ({ label }: { label: string }) => (
    <span>
      {label} <span style={{ color: "#d32f2f" }}>*</span>
    </span>
  );

  // Add a new helper function for single star labels
  const SingleStarLabel = ({ label }: { label: string }) => (
    <span>
      {label} <span style={{ color: "#d32f2f" }}>*</span>
    </span>
  );

  const handleSearch = async (query: string) => {
    setSearchLoading(true);
    try {
      const response = await employeeService.searchEmployees(query);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching employees:", error);
      setNotification({
        open: true,
        message: "Error searching employees",
        severity: "error",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectEmployee = async (employeeId: string) => {
    try {
      const response = await employeeService.getEmployee(employeeId);
      const employeeData = response.data;

      // Map API response fields to form data fields
      const mappedFormData = {
        institute: employeeData.INSTITUTE,
        department: employeeData.DEPARTMENT,
        shortCode: employeeData.SHORT_CODE || "",
        empType: employeeData.EMP_TYPE || "",
        empName: employeeData.EMP_NAME,
        fatherName: employeeData.FATHER_NAME || "",
        motherName: employeeData.MOTHER_NAME || "",
        dateOfBirth: employeeData.DATE_OF_BIRTH
          ? new Date(employeeData.DATE_OF_BIRTH)
          : null,
        designation: employeeData.DESIGNATION,
        permanentAddress: employeeData.PERMANENT_ADDRESS || "",
        email: employeeData.EMAIL,
        localAddress: employeeData.LOCAL_ADDRESS || "",
        panNo: employeeData.PAN_NO || "",
        permanentCity: employeeData.PERMANENT_CITY || "",
        permanentPinNo: employeeData.PERMANENT_PIN || "",
        drivingLicNo: employeeData.DRIVING_LICENSE_NO || "",
        sex: employeeData.SEX || "",
        status: employeeData.STATUS || "",
        maritalStatus: employeeData.MARITAL_STATUS || "",
        dateOfJoin: employeeData.DATE_OF_JOIN
          ? new Date(employeeData.DATE_OF_JOIN)
          : null,
        localCity: employeeData.LOCAL_CITY || "",
        localPinNo: employeeData.LOCAL_PIN || "",
        position: employeeData.POSITION || "",
        shift: employeeData.SHIFT || "",
        bloodGroup: employeeData.BLOOD_GROUP || "",
        active: employeeData.IS_ACTIVE || "yes",
        phoneNo: employeeData.PHONE_NO || "",
        mobileNo: employeeData.MOBILE_NO || "",
        category: employeeData.CATEGORY,
        bankAccountNo: employeeData.BANK_ACCOUNT_NO || "",
        unaNo: employeeData.UAN_NO || "",
        profileImage: null, // Reset profile image since we'll load it separately
      };

      setFormData(mappedFormData);

      // Handle profile image if exists
      if (employeeData.PROFILE_IMAGE) {
        setPhotoPreview(employeeData.PROFILE_IMAGE);
      }

      setOpenSearch(false);
      setIsEditing(true);
      setCurrentEmployeeId(employeeId);

      // Show notification
      setNotification({
        open: true,
        message: "Employee data loaded for editing",
        severity: "success",
      });
    } catch (error) {
      console.error("Error fetching employee details:", error);
      setNotification({
        open: true,
        message: "Error fetching employee details",
        severity: "error",
      });
    }
  };

  // Add this helper to determine button text
  const getSubmitButtonText = () => {
    if (isEditing) {
      return "Update Employee Details";
    }
    return "Save Employee Details";
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={0.5}>
            {/* Header with Photo */}
            <Grid item xs={12} sx={{ mb: 0.5 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {isEditing
                      ? `Edit Employee: ${currentEmployeeId}`
                      : "Create Employee"}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<SearchIcon />}
                    size="small"
                    onClick={() => setOpenSearch(true)}
                  >
                    Search Employee
                  </Button>
                  {isEditing && (
                    <Button
                      variant="outlined"
                      color="info"
                      size="small"
                      onClick={resetForm}
                    >
                      Create New Employee
                    </Button>
                  )}
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    src={photoPreview || undefined}
                    sx={{
                      width: 100,
                      height: 100,
                      border: "2px solid #e0e0e0",
                      boxShadow: 1,
                      borderRadius: "8px", // Making it slightly square
                    }}
                  />
                  <Button variant="outlined" component="label" size="small">
                    Upload Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            {/* Official Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Official Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small" error={!!errors.institute}>
                <InputLabel>Institute <span style={{ color: '#d32f2f' }}>*</span></InputLabel>
                <Select
                  value={formData.institute}
                  name="institute"
                  onChange={handleSelectChange}
                  label="Institute *"
                >
                  {institutes.map((inst: any) => (
                    <MenuItem key={inst.INSTITUTE_ID} value={inst.CODE}>
                      {inst.NAME}
                    </MenuItem>
                  ))}
                </Select>
                {errors.institute && <Typography variant="caption" color="error" sx={{ ml: 1.5 }}>{errors.institute}</Typography>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small" error={!!errors.department}>
                <InputLabel>Department <span style={{ color: '#d32f2f' }}>*</span></InputLabel>
                <Select
                  value={formData.department}
                  name="department"
                  onChange={handleSelectChange}
                  label="Department *"
                >
                  {departments?.map((dept: any) => (
                    <MenuItem key={dept.DEPARTMENT_ID} value={dept.DEPARTMENT_ID}>
                      {dept.NAME}
                    </MenuItem>
                  ))}
                </Select>
                {errors.department && <Typography variant="caption" color="error" sx={{ ml: 1.5 }}>{errors.department}</Typography>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                label="Short Code"
                name="shortCode"
                value={formData.shortCode}
                onChange={handleInputChange}
                placeholder="e.g. EMP001"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small" error={!!errors.empType}>
                <InputLabel>Emp Type <span style={{ color: '#d32f2f' }}>*</span></InputLabel>
                <Select
                  value={formData.empType}
                  name="empType"
                  onChange={handleSelectChange}
                  label="Emp Type *"
                >
                  {employeeTypes?.map((type: any) => (
                    <MenuItem key={type.ID} value={type.ID}>
                      {type.RECORD_WORD}
                    </MenuItem>
                  ))}
                </Select>
                {errors.empType && <Typography variant="caption" color="error" sx={{ ml: 1.5 }}>{errors.empType}</Typography>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="e.g. Senior Developer"
              />
            </Grid>

            {/* Personal Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                value={formData.empName}
                onChange={handleInputChange}
                label={<span>Employee Name <span style={{ color: "#d32f2f" }}>*</span></span>}
                name="empName"
                error={!!errors.empName}
                helperText={errors.empName}
                placeholder="e.g. John Smith"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                label="Father Name"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
                placeholder="e.g. David Smith"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                label="Mother Name"
                name="motherName"
                value={formData.motherName}
                onChange={handleInputChange}
                placeholder="e.g. Sarah Smith"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small" error={!!errors.designation}>
                <InputLabel>Designation <span style={{ color: '#d32f2f' }}>*</span></InputLabel>
                <Select
                  value={formData.designation}
                  name="designation"
                  onChange={handleSelectChange}
                  label="Designation *"
                >
                  {designations?.map((desig: any) => (
                    <MenuItem
                      key={desig.DESIGNATION_ID}
                      value={desig.DESIGNATION_ID}
                    >
                      {desig.NAME}
                    </MenuItem>
                  ))}
                </Select>
                {errors.designation && <Typography variant="caption" color="error" sx={{ ml: 1.5 }}>{errors.designation}</Typography>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Shift</InputLabel>
                <Select
                  value={formData.shift}
                  name="shift"
                  onChange={handleSelectChange}
                  label="Shift"
                >
                  {shifts?.map((shift: any) => (
                    <MenuItem key={shift.ID} value={shift.ID}>
                      {shift.SHIFT_NAME}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Contact & Dates */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Contact & Dates
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
                label={<span>Email <span style={{ color: "#d32f2f" }}>*</span></span>}
                name="email"
                type="email"
                error={!!errors.email}
                helperText={errors.email}
                placeholder="e.g. john.smith@example.com"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                label="Phone"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleInputChange}
                placeholder="e.g. 020-12345678"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                value={formData.mobileNo}
                onChange={handleInputChange}
                label="Mobile No"
                name="mobileNo"
                placeholder="e.g. 9876543210"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Birth Date"
                  value={formData.dateOfBirth}
                  onChange={handleDateChange("dateOfBirth")}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Join Date"
                  value={formData.dateOfJoin}
                  onChange={handleDateChange("dateOfJoin")}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            {/* Address Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Address Details
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sameAsPermAddress}
                    onChange={handleSameAddressChange}
                    size="small"
                  />
                }
                label={<Typography variant="caption">Same as Permanent Address</Typography>}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                <Typography variant="caption" fontWeight="bold" display="block" mb={1}>Permanent Address</Typography>
                <Stack spacing={2}>
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    label="Address"
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleAddressChange}
                    placeholder="e.g. 123, Main Street, Apartment 4B"
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      size="small"
                      fullWidth
                      label="City"
                      name="permanentCity"
                      value={formData.permanentCity}
                      onChange={handleAddressChange}
                      placeholder="e.g. Mumbai"
                    />
                    <TextField
                      size="small"
                      fullWidth
                      label="PIN"
                      name="permanentPinNo"
                      value={formData.permanentPinNo}
                      onChange={handleAddressChange}
                      placeholder="e.g. 400001"
                    />
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                <Typography variant="caption" fontWeight="bold" display="block" mb={1}>Local Address</Typography>
                <Stack spacing={2}>
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    label="Address"
                    name="localAddress"
                    value={formData.localAddress}
                    onChange={handleInputChange}
                    disabled={sameAsPermAddress}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      size="small"
                      fullWidth
                      label="City"
                      name="localCity"
                      value={formData.localCity}
                      onChange={handleInputChange}
                      disabled={sameAsPermAddress}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      label="PIN"
                      name="localPinNo"
                      value={formData.localPinNo}
                      onChange={handleInputChange}
                      disabled={sameAsPermAddress}
                    />
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            {/* Row 5 - Additional Details */}
            <Grid item xs={2}>
              <FormControl fullWidth size="small">
                <InputLabel>{<SingleStarLabel label="Sex" />}</InputLabel>
                <Select
                  value={formData.sex}
                  name="sex"
                  onChange={handleSelectChange}
                  error={!formData.sex}
                  label={<SingleStarLabel label="Sex" />}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Blood Group</InputLabel>
                <Select
                  value={formData.bloodGroup}
                  name="bloodGroup"
                  onChange={handleSelectChange}
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (group) => (
                      <MenuItem key={group} value={group}>
                        {group}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Marital Status</InputLabel>
                <Select
                  value={formData.maritalStatus}
                  name="maritalStatus"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="single">Single</MenuItem>
                  <MenuItem value="married">Married</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  name="status"
                  onChange={handleSelectChange}
                  label="Status"
                >
                  {statuses?.map((status: any) => (
                    <MenuItem key={status.ID} value={status.ID}>
                      {status.RECORD_WORD}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <FormControl fullWidth size="small">
                <InputLabel>{<SingleStarLabel label="Category" />}</InputLabel>
                <Select
                  value={formData.category}
                  name="category"
                  onChange={handleSelectChange}
                  error={!formData.category}
                  label={<SingleStarLabel label="Category" />}
                >
                  {categories?.map((category: any) => (
                    <MenuItem
                      key={category.CATEGORY_ID}
                      value={category.CATEGORY_ID}
                    >
                      {category.NAME}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Active</InputLabel>
                <Select
                  value={formData.active}
                  name="active"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Row 6 - IDs and Numbers */}
            <Grid item xs={2}>
              <TextField
                size="small"
                fullWidth
                label="PAN No"
                name="panNo"
                value={formData.panNo} // Add this
                onChange={handleInputChange} // Add this
                placeholder="e.g. ABCDE1234F"
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                size="small"
                fullWidth
                label="UAN No"
                name="unaNo"
                value={formData.unaNo} // Add this 
                onChange={handleInputChange} // Add this
                placeholder="e.g. 123456789012"
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                size="small"
                fullWidth
                label="Bank A/C No"
                name="bankAccountNo"
                value={formData.bankAccountNo} // Add this
                onChange={handleInputChange} // Add this
                placeholder="e.g. 1234567890"
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                size="small"
                fullWidth
                label="Driving Lic No"
                name="drivingLicNo"
                value={formData.drivingLicNo} // Add this
                onChange={handleInputChange} // Add this
                placeholder="e.g. MH0123456789"
              />
            </Grid>

            {/* Submit Button */}
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 2,
              }}
            >
              {isEditing && (
                <Button
                  type="button"
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={resetForm}
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                color={isEditing ? "primary" : "primary"}
                size="small"
                sx={{ minWidth: 150 }}
              >
                {getSubmitButtonText()}
              </Button>
            </Grid>
          </Grid>
        </form>
        <SearchEmployeeDialog
          open={openSearch}
          onClose={() => setOpenSearch(false)}
          onSelect={handleSelectEmployee}
          onSearch={handleSearch}
          searchResults={searchResults}
          loading={searchLoading}
        />
      </Paper>
    </Box>
  );
};

export default CreateEmployee;
