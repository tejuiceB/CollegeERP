import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import Sidebar from "../layout/Sidebar";
import { DashboardNavbar } from "../layout/Navbar";
import Footer from "../layout/Footer";
import {
  Dashboard as DashboardIcon,
  Hotel as HotelIcon,
  Book as BookIcon,
  Settings as SettingsIcon
} from "@mui/icons-material";

const HostelDashboard = ({ user }: any) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const menuItems = [
    { icon: <DashboardIcon />, text: "Dashboard", path: "#" },
    { icon: <HotelIcon />, text: "Rooms", path: "#" },
    { icon: <BookIcon />, text: "Bookings", path: "#" },
    { icon: <SettingsIcon />, text: "Settings", path: "#" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <DashboardNavbar
        user={user}
        title="Hostel Dashboard"
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
            <Typography variant="h4" fontWeight="bold">
              Welcome Hostel, {user?.username}
            </Typography>
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default HostelDashboard;
