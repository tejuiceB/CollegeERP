import React, { useState } from "react";
import { Box, useTheme } from "@mui/material";
import { Navbar } from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useSettings } from "../../context/SettingsContext";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const theme = useTheme();
  // const { darkMode } = useSettings(); // Theme handled by MUI ThemeProvider now

  const handleLoginClick = () => {
    // No-op for authenticated routes or handle login redirect
    console.log("Login clicked in Layout");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Navbar onLoginClick={handleLoginClick} />
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: "auto",
            bgcolor: "background.default",
          }}
        >
          {children}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
