import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import Sidebar from "../layout/Sidebar";
import { DashboardNavbar } from "../layout/Navbar";
import Footer from "../layout/Footer";
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon
} from "@mui/icons-material";

const CoeDashboard = ({ user }: any) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const menuItems = [
    { icon: <DashboardIcon />, text: "Dashboard", path: "#" },
    { icon: <AssessmentIcon />, text: "Exams", path: "#" },
    { icon: <AssignmentIcon />, text: "Results", path: "#" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <DashboardNavbar
        user={user}
        title="Examination Controller Dashboard"
        onLogout={() => console.log("Logout")}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          user={user}
          menuItems={menuItems}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: "auto",
            bgcolor: "background.default",
            display: "flex",
            flexDirection: "column",
            p: 3
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">Welcome, {user?.username || "COE"}</Typography>
            <Typography variant="body1">Here you can manage all examination related activities.</Typography>
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default CoeDashboard;
