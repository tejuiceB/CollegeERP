import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import Sidebar from "../layout/Sidebar";
import { DashboardNavbar } from "../layout/Navbar";
import Footer from "../layout/Footer";
import {
  Dashboard as DashboardIcon,
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon
} from "@mui/icons-material";

const FinanceDashboard = ({ user }: any) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const menuItems = [
    { icon: <DashboardIcon />, text: "Dashboard", path: "#" },
    { icon: <AttachMoneyIcon />, text: "Transactions", path: "#" },
    { icon: <ReceiptIcon />, text: "Reports", path: "#" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <DashboardNavbar
        user={user}
        title="Finance Dashboard"
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
              Welcome Finance, {user?.username}
            </Typography>
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default FinanceDashboard;
