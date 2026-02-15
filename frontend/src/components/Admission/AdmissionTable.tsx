import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent
} from "@mui/material";
import { motion } from "framer-motion";
import CasteEntryForm from "./pages/CasteEntryForm";
import QuotaEntryForm from "./pages/QuotaEntryForm";
import AdmissionQuotaEntryForm from "./pages/AdmissionQuotaEntryForm";
import CheckListDocumentEntryForm from "./pages/CheckListDocumentEntryForm";
import MasterTableView from "./MasterTableView";
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';

const MasterEntryForm = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<"create" | "view">("create");

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Optionally reset viewMode or keep it persistent? Keeping it persistent feels fine.
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: "create" | "view" | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return viewMode === "create" ? <CasteEntryForm /> : <MasterTableView masterType="caste" />;
      case 1:
        return viewMode === "create" ? <QuotaEntryForm /> : <MasterTableView masterType="quota" />;
      case 2:
        return viewMode === "create" ? <AdmissionQuotaEntryForm /> : <MasterTableView masterType="admission" />;
      case 3:
        return viewMode === "create" ? <CheckListDocumentEntryForm /> : <MasterTableView masterType="checklist" />;
      default:
        return null;
    }
  };

  const getTabLabel = (index: number) => {
    switch (index) {
      case 0: return "Caste";
      case 1: return "Quota";
      case 2: return "Admission Quota";
      case 3: return "Checklist Docs";
      default: return "";
    }
  }

  return (
    <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Master Entry Form
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="create" aria-label="create">
              <AddIcon sx={{ mr: 1, fontSize: 20 }} />
              Create
            </ToggleButton>
            <ToggleButton value="view" aria-label="view">
              <ListIcon sx={{ mr: 1, fontSize: 20 }} />
              List
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Caste" />
            <Tab label="Quota" />
            <Tab label="Admission Quota" />
            <Tab label="Checklist Documents" />
          </Tabs>
        </Box>

        <motion.div
          key={activeTab + viewMode}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Render content directly without extra surface/paper nesting */}
          <Box sx={{ minHeight: 300 }}>
            {renderContent()}
          </Box>
        </motion.div>

      </CardContent>
    </Card>
  );
};

export default MasterEntryForm;
