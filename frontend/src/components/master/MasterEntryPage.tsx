import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import MasterTableList from "./MasterTableList";
import CountryEntry from "./masterPages/CountryEntry";
import StateEntry from "./masterPages/StateEntry";
import CityEntry from "./masterPages/CityEntry";
import CurrencyEntry from "./masterPages/CurrencyEntry";
import LanguageEntry from "./masterPages/LanguageEntry";
import DesignationEntry from "./masterPages/DesignationEntry";
import CategoryEntry from "./masterPages/CategoryEntry";
import MasterTableView from "./MasterTableView";
import {
  Paper,
  Select,
  MenuItem,
  FormControl,
  Box,
  Typography,
  Container,
  Grid,
  Tabs,
  Tab,
  Alert,
  Divider,
  InputLabel,
} from "@mui/material";
import { usePagePermissions } from "../../hooks/usePagePermissions";
import { useSettings } from "../../context/SettingsContext";
import DepartmentEntry from "./masterPages/DepartmentEntry";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ProgramEntryForm from "../CourseMaster/ProgramEntryForm";
import BranchEntryForm from "../CourseMaster/BranchEntryForm";
import YearEntryForm from "../CourseMaster/YearEntryForm";
import SemesterEntryForm from "../CourseMaster/SemesterEntryForm";

const MasterEntryPage: React.FC = () => {
  const { tableName } = useParams();
  const { darkMode } = useSettings();
  const location = useLocation();
  const [selectedAction, setSelectedAction] = useState<"create" | "update">(
    "create"
  );
  const [selectedTable, setSelectedTable] = useState<string>("");
  const navigate = useNavigate();

  const { isFormDisabled } = usePagePermissions(location.pathname);

  // Check if we're on the establishment route
  const isEstablishmentRoute = location.pathname.includes("/establishment/");

  // Define different table lists based on route
  const generalMasterTables = [
    { name: "country", display: "Country" },
    { name: "state", display: "State" },
    { name: "city", display: "City" },
    { name: "currency", display: "Currency" },
    { name: "language", display: "Language" },
    { name: "designation", display: "Designation" },
    { name: "department", display: "Department" },
    { name: "category", display: "Category" },
  ];

  const courseMasterTables = [
    { name: "program", display: "Program" },
    { name: "branch", display: "Branch" },
    { name: "year", display: "Year" },
    { name: "semester", display: "Semester" },
  ];

  // Use appropriate table list based on route
  const tables = isEstablishmentRoute ? courseMasterTables : generalMasterTables;

  const handleTableChange = (value: string) => {
    setSelectedTable(value);
    // Navigate to the appropriate route based on current location
    const basePath = isEstablishmentRoute ? "../establishment/master" : "../master";
    navigate(`${basePath}/${value}`);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: "create" | "update") => {
    setSelectedAction(newValue);
  };

  const renderCreateForm = () => {
    switch (tableName?.toLowerCase()) {
      case "country":
        return <CountryEntry />;
      case "state":
        return <StateEntry />;
      case "city":
        return <CityEntry />;
      case "currency":
        return <CurrencyEntry />;
      case "language":
        return <LanguageEntry />;
      case "designation":
        return <DesignationEntry />;
      case "department":
        return <DepartmentEntry />;
      case "category":
        return <CategoryEntry />;
      case "program":
        return <ProgramEntryForm />;
      case "branch":
        return <BranchEntryForm />;
      case "year":
        return <YearEntryForm />;
      case "semester":
        return <SemesterEntryForm />;
      default:
        return <Typography>Form not implemented for {tableName}</Typography>;
    }
  };

  // Helper to get display name
  const getDisplayName = (name: string | undefined) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "#1e1e1e" : "#fff",
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="600" gutterBottom>
              Master Entry Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage system-wide master data tables
            </Typography>
          </Box>

          <FormControl variant="outlined" size="small" sx={{ minWidth: 250 }}>
            <InputLabel>Select Master Table</InputLabel>
            <Select
              value={tableName || ""}
              onChange={(e) => handleTableChange(e.target.value)}
              label="Select Master Table"
            >
              <MenuItem value="" disabled>
                <em>Select a table...</em>
              </MenuItem>
              {tables.map((table) => (
                <MenuItem key={table.name} value={table.name}>
                  {table.display}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Content Section */}
        {tableName ? (
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Tabs
                value={isFormDisabled ? "update" : selectedAction}
                onChange={handleTabChange}
                aria-label="master entry actions"
              >
                {!isFormDisabled && (
                  <Tab
                    label="Create New Entry"
                    value="create"
                    icon={<AddCircleOutlineIcon />}
                    iconPosition="start"
                  />
                )}
                <Tab
                  label="Update Entries"
                  value="update"
                  icon={<ListAltIcon />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            <Box sx={{ minHeight: 400 }}>
              {selectedAction === "create" && (
                <Box>
                  <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: 'primary.main' }}>
                    Create New {getDisplayName(tableName)}
                  </Typography>
                  {renderCreateForm()}
                </Box>
              )}

              {selectedAction === "update" || isFormDisabled ? (
                <MasterTableView tableName={tableName} isReadOnly={isFormDisabled} />
              ) : null}
            </Box>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            Please select a master table from the dropdown above to manage its entries.
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default MasterEntryPage;
