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
import { EmployeeFormData } from "../MasterEmployee/types";
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
import SearchEmployeeDialog from "../MasterEmployee/SearchEmployeeDialog";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { loadFromLocalStorage, saveToLocalStorage } from '../../utils/storageUtils';
import axiosInstance from "../../api/axios";

const EmployeeDetail = () => {
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

  const [openSearch, setOpenSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pagePermissions, setPagePermissions] = useState({
    can_add: false,
    can_edit: false,
    can_delete: false,
    can_view: false,
    isSuperuser: false
  });

  useEffect(() => {
    const fetchPagePermissions = async () => {
      try {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;

        if (user?.is_superuser || user?.IS_SUPERUSER) {
          setPagePermissions({
            can_add: true,
            can_edit: true,
            can_delete: true,
            can_view: true,
            isSuperuser: true
          });
          return;
        }

        const response = await axiosInstance.get("/api/permissions/my_permissions/");
        if (response.data.status === "success") {
          const currentPath = "/dashboard/establishment/employeedetails";
          const perm = response.data.data.find((p: any) => p.menu_path === currentPath);
          if (perm) {
            setPagePermissions({
              can_add: perm.can_add,
              can_edit: perm.can_edit,
              can_delete: perm.can_delete,
              can_view: perm.can_view,
              isSuperuser: false
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch page permissions", error);
      }
    };
    fetchPagePermissions();
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [isEmployeeSelected, setIsEmployeeSelected] = useState(false);

  const isFormDisabled = !pagePermissions.isSuperuser && (
    (isEditing ? !pagePermissions.can_edit : !pagePermissions.can_add)
  );

  const canSearch = pagePermissions.isSuperuser || pagePermissions.can_edit;
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(
    null
  );

  const navigate = useNavigate();

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
      const updates = { [name]: value };

      if (sameAsPermAddress && name.startsWith("permanent")) {
        const localField = name.replace("permanent", "local");
        updates[localField] = value;
      }

      return { ...prev, ...updates };
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
    localStorage.removeItem('currentEmployeeData');
    localStorage.removeItem('currentEmployeeId');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataObj = new FormData();

      // Convert string IDs to numbers before sending
      const requiredFields = {
        EMP_NAME: formData.empName,
        EMAIL: formData.email,
        DESIGNATION: formData.designation,
        DEPARTMENT: Number(formData.department), // Convert to number
        INSTITUTE: formData.institute,
        DATE_OF_JOIN: formData.dateOfJoin
          ? new Date(formData.dateOfJoin).toISOString().split("T")[0]
          : "",
        MOBILE_NO: formData.mobileNo,
        SEX: formData.sex,
        CATEGORY: Number(formData.category), // Convert to number
        EMP_TYPE: Number(formData.empType), // Add this line
        SHORT_CODE: formData.shortCode,     // Add this
        POSITION: formData.position,        // Add this
      };

      // Log what we're sending
      console.log("Form Data Values:", {
        department: formData.department, // This will now be the CODE
        category: formData.category, // This will now be the CODE
        position: formData.position,
      });

      // Validate required fields
      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const isAdmin = ["SUPERADMIN", "ADMIN"].includes(user.designation?.code);

      if (!isAdmin && missingFields.length > 0) {
        setNotification({
          open: true,
          message: `Please fill in required fields: ${missingFields.join(
            ", "
          )}`,
          severity: "error",
        });
        return;
      }

      // Add required fields
      Object.entries(requiredFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formDataObj.append(key, String(value));
        }
      });

      // Add optional fields
      const optionalFields = {
        SHORT_CODE: formData.shortCode || "",
        FATHER_NAME: formData.fatherName || "",
        MOTHER_NAME: formData.motherName || "",
        DATE_OF_BIRTH: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString().split("T")[0]
          : undefined, // Send undefined instead of empty string
        PERMANENT_ADDRESS: formData.permanentAddress || "",
        LOCAL_ADDRESS: formData.localAddress || "",
        PAN_NO: formData.panNo || "",
        PERMANENT_CITY: formData.permanentCity || "",
        PERMANENT_PIN: formData.permanentPinNo || "",
        DRIVING_LICENSE_NO: formData.drivingLicNo || "",
        STATUS: formData.status || "",
        MARITAL_STATUS: formData.maritalStatus || "",
        LOCAL_CITY: formData.localCity || "",
        LOCAL_PIN: formData.localPinNo || "",
        SHIFT: formData.shift || "",
        BLOOD_GROUP: formData.bloodGroup || "",
        IS_ACTIVE: formData.active || "yes",
        PHONE_NO: formData.phoneNo || "",
        BANK_ACCOUNT_NO: formData.bankAccountNo || "",
        UAN_NO: formData.unaNo || "",
      };

      // Add optional fields
      Object.entries(optionalFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataObj.append(key, String(value));
        }
      });

      // Add profile image if exists
      if (formData.profileImage) {
        formDataObj.append("PROFILE_IMAGE", formData.profileImage);
      }

      // Log data being sent
      // console.log("Sending data:", Object.fromEntries(formDataObj)); // formDataObj is not easily viewable this way

      let response;
      if (isEditing && currentEmployeeId) {
        response = await employeeService.updateEmployee(
          currentEmployeeId,
          formDataObj
        );

        // Update localStorage after successful save
        saveToLocalStorage('currentEmployeeData', formData);

        setNotification({
          open: true,
          message: "Employee updated successfully!",
          severity: "success",
        });

        return response; // Return response for handleSaveAndNext
      }
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

      // Handle profile image
      if (employeeData.PROFILE_IMAGE) {
        // Store the full image URL/data in localStorage
        saveToLocalStorage('currentEmployeePhoto', employeeData.PROFILE_IMAGE);
        setPhotoPreview(employeeData.PROFILE_IMAGE);
      }

      // Save to localStorage
      saveToLocalStorage('currentEmployeeData', mappedFormData);
      saveToLocalStorage('currentEmployeeId', employeeId);

      // Handle profile image if exists
      if (employeeData.PROFILE_IMAGE) {
        setPhotoPreview(employeeData.PROFILE_IMAGE);
      }

      setOpenSearch(false);
      setIsEditing(true);
      setIsEmployeeSelected(true);  // Enable buttons when employee is selected
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

  // Add this useEffect to load photo on component mount
  useEffect(() => {
    const savedPhoto = loadFromLocalStorage('currentEmployeePhoto', null);
    if (savedPhoto) {
      setPhotoPreview(savedPhoto);
    }
  }, []);

  // Add this helper to determine button text
  const getSubmitButtonText = () => {
    if (isEditing) {
      return "Update Employee Details";
    }
    return "Save Employee Details";
  };

  // Add this function near other handlers
  const handleNextClick = () => {
    if (!currentEmployeeId) {
      setNotification({
        open: true,
        message: "Please select an employee first",
        severity: "error"
      });
      return;
    }
    navigate(`/dashboard/establishment/academic-qualification?empId=${currentEmployeeId}`);
  };

  const handleSaveAndNext = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await handleSubmit(e);  // Wait for save to complete
      if (response && currentEmployeeId) {     // Only navigate if save was successful
        handleNextClick();
      }
    } catch (error) {
      console.error("Error in save and next:", error);
    }
  };

  useEffect(() => {
    const savedEmployeeId = loadFromLocalStorage('currentEmployeeId', null);
    const savedEmployeeData = loadFromLocalStorage('currentEmployeeData', null);

    if (savedEmployeeId && savedEmployeeData) {
      setCurrentEmployeeId(savedEmployeeId);
      setFormData(savedEmployeeData);
      setIsEmployeeSelected(true);
      setIsEditing(true);
    }
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
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
                      : "Employee Details"}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<SearchIcon />}
                    size="small"
                    onClick={() => setOpenSearch(true)}
                    disabled={!canSearch}
                  >
                    Search Employee
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">

                  <Avatar
                    src={photoPreview || undefined}
                    sx={{
                      width: 100,
                      height: 100,
                      border: "2px solid #e0e0e0",
                      boxShadow: 1,
                      borderRadius: "8px",
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

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" error={!formData.institute} disabled={isFormDisabled}>
                <InputLabel><SingleStarLabel label="Institute" /></InputLabel>
                <Select
                  value={formData.institute}
                  name="institute"
                  onChange={handleSelectChange}
                  label={<SingleStarLabel label="Institute" />}
                >
                  {institutes.map((inst: any) => (
                    <MenuItem key={inst.INSTITUTE_ID} value={inst.CODE}>
                      {inst.NAME}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" error={!formData.department} disabled={isFormDisabled}>
                <InputLabel><SingleStarLabel label="Department" /></InputLabel>
                <Select
                  value={formData.department}
                  name="department"
                  onChange={handleSelectChange}
                  label={<SingleStarLabel label="Department" />}
                >
                  {departments?.map((dept: any) => (
                    <MenuItem key={dept.DEPARTMENT_ID} value={dept.DEPARTMENT_ID}>
                      {dept.NAME}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                size="small"
                fullWidth
                label="Short Code"
                name="shortCode"
                value={formData.shortCode}
                onChange={handleInputChange}
                placeholder="e.g. EMP001"
                disabled={isFormDisabled}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" error={!formData.empType} disabled={isFormDisabled}>
                <InputLabel><SingleStarLabel label="Emp Type" /></InputLabel>
                <Select
                  value={formData.empType}
                  name="empType"
                  onChange={handleSelectChange}
                  label={<SingleStarLabel label="Emp Type" />}
                >
                  {employeeTypes?.map((type: any) => (
                    <MenuItem key={type.ID} value={type.ID}>
                      {type.RECORD_WORD}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                size="small"
                fullWidth
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="e.g. Senior Developer"
                disabled={isFormDisabled}
              />
            </Grid>

            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                size="small"
                fullWidth
                value={formData.empName}
                onChange={handleInputChange}
                label={<SingleStarLabel label="Employee Name" />}
                name="empName"
                error={!formData.empName}
                helperText={!formData.empName ? "Required" : ""}
                placeholder="e.g. John Smith"
                disabled={isFormDisabled}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                size="small"
                fullWidth
                label="Father Name"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
                placeholder="e.g. David Smith"
                disabled={isFormDisabled}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                size="small"
                fullWidth
                label="Mother Name"
                name="motherName"
                value={formData.motherName}
                onChange={handleInputChange}
                placeholder="e.g. Sarah Smith"
                disabled={isFormDisabled}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" error={!formData.designation} disabled={isFormDisabled}>
                <InputLabel><SingleStarLabel label="Designation" /></InputLabel>
                <Select
                  value={formData.designation}
                  name="designation"
                  onChange={handleSelectChange}
                  label={<SingleStarLabel label="Designation" />}
                >
                  {designations?.map((desig: any) => (
                    <MenuItem key={desig.DESIGNATION_ID} value={desig.DESIGNATION_ID}>
                      {desig.NAME}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" disabled={isFormDisabled}>
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" disabled={isFormDisabled}>
                <InputLabel>Marital Status</InputLabel>
                <Select
                  value={formData.maritalStatus}
                  name="maritalStatus"
                  onChange={handleSelectChange}
                  label="Marital Status"
                >
                  <MenuItem value="single">Single</MenuItem>
                  <MenuItem value="married">Married</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Birth Date"
                  value={formData.dateOfBirth}
                  onChange={handleDateChange("dateOfBirth")}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                  disabled={isFormDisabled}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" error={!formData.sex} disabled={isFormDisabled}>
                <InputLabel><SingleStarLabel label="Sex" /></InputLabel>
                <Select
                  value={formData.sex}
                  name="sex"
                  onChange={handleSelectChange}
                  label={<SingleStarLabel label="Sex" />}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" disabled={isFormDisabled}>
                <InputLabel>Blood Group</InputLabel>
                <Select
                  value={formData.bloodGroup}
                  name="bloodGroup"
                  onChange={handleSelectChange}
                  label="Blood Group"
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                    <MenuItem key={group} value={group}>{group}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" error={!formData.category} disabled={isFormDisabled}>
                <InputLabel><SingleStarLabel label="Category" /></InputLabel>
                <Select
                  value={formData.category}
                  name="category"
                  onChange={handleSelectChange}
                  label={<SingleStarLabel label="Category" />}
                >
                  {categories?.map((cat: any) => (
                    <MenuItem key={cat.CATEGORY_ID} value={cat.CATEGORY_ID}>
                      {cat.NAME}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" disabled={isFormDisabled}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  name="status"
                  onChange={handleSelectChange}
                  label="Status"
                >
                  {statuses?.map((stats: any) => (
                    <MenuItem key={stats.ID} value={stats.ID}>
                      {stats.RECORD_WORD}
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

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                size="small"
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
                label={<SingleStarLabel label="Email" />}
                name="email"
                type="email"
                error={!formData.email}
                helperText={!formData.email ? "Required" : ""}
                disabled={isFormDisabled}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                size="small"
                fullWidth
                label="Phone No"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleInputChange}
                disabled={isFormDisabled}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                size="small"
                fullWidth
                label="Mobile No"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleInputChange}
                disabled={isFormDisabled}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Join Date"
                  value={formData.dateOfJoin}
                  onChange={handleDateChange("dateOfJoin")}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                  disabled={isFormDisabled}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" disabled={isFormDisabled}>
                <InputLabel>Active</InputLabel>
                <Select
                  value={formData.active}
                  name="active"
                  onChange={handleSelectChange}
                  label="Active"
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
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
                    disabled={isFormDisabled}
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
                    placeholder="e.g. 123, Main Street"
                    disabled={isFormDisabled}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      size="small"
                      fullWidth
                      label="City"
                      name="permanentCity"
                      value={formData.permanentCity}
                      onChange={handleAddressChange}
                      disabled={isFormDisabled}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      label="PIN"
                      name="permanentPinNo"
                      value={formData.permanentPinNo}
                      onChange={handleAddressChange}
                      disabled={isFormDisabled}
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
                    disabled={isFormDisabled || sameAsPermAddress}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      size="small"
                      fullWidth
                      label="City"
                      name="localCity"
                      value={formData.localCity}
                      onChange={handleInputChange}
                      disabled={isFormDisabled || sameAsPermAddress}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      label="PIN"
                      name="localPinNo"
                      value={formData.localPinNo}
                      onChange={handleInputChange}
                      disabled={isFormDisabled || sameAsPermAddress}
                    />
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            {/* IDs */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Identification & Bank Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                size="small"
                fullWidth
                label="PAN No"
                name="panNo"
                value={formData.panNo}
                onChange={handleInputChange}
                disabled={isFormDisabled}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                size="small"
                fullWidth
                label="UAN No"
                name="unaNo"
                value={formData.unaNo}
                onChange={handleInputChange}
                disabled={isFormDisabled}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                size="small"
                fullWidth
                label="Bank A/C No"
                name="bankAccountNo"
                value={formData.bankAccountNo}
                onChange={handleInputChange}
                disabled={isFormDisabled}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                size="small"
                fullWidth
                label="Driving Lic No"
                name="drivingLicNo"
                value={formData.drivingLicNo}
                onChange={handleInputChange}
                disabled={isFormDisabled}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>

              <Button
                variant="outlined"
                color="secondary"
                onClick={resetForm}
                disabled={isFormDisabled}
              >
                Clear
              </Button>
              {isEditing && (
                <Button
                  variant="outlined"
                  onClick={handleNextClick}
                  disabled={!isEmployeeSelected}
                >
                  Next (Skip Save)
                </Button>
              )}

              <Button
                type="submit"
                variant="contained"
                onClick={handleSaveAndNext}
                disabled={isFormDisabled}
              >
                {isEditing ? "Update & Next" : "Save & Next"}
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

export default EmployeeDetail;

//emplyee
