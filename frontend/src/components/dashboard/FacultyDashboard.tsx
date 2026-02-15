import React, { useState } from "react";
import { Grid, Paper, Typography, Box, useTheme, Card, CardContent } from "@mui/material";
import {
  Assessment,
  Assignment,
  Schedule,
  People,
  MenuBook,
  CalendarMonth,
} from "@mui/icons-material";
import { DashboardProps } from "../../types/dashboard";
import { DashboardNavbar } from "../layout/Navbar";
import Sidebar, { SidebarMenuItem } from "../layout/Sidebar";
import Footer from "../layout/Footer";

const FacultyDashboard: React.FC<DashboardProps> = ({ user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const theme = useTheme();

  const menuItems: SidebarMenuItem[] = [
    { icon: <MenuBook />, text: "Courses", onClick: () => console.log("Courses") },
    { icon: <CalendarMonth />, text: "Schedule", onClick: () => console.log("Schedule") },
  ];

  const quickActions = [
    { text: "Take Attendance", icon: <People fontSize="large" />, color: "primary.main" },
    { text: "Upload Marks", icon: <Assessment fontSize="large" />, color: "success.main" },
    { text: "Create Assignment", icon: <Assignment fontSize="large" />, color: "warning.main" },
    { text: "View Schedule", icon: <Schedule fontSize="large" />, color: "secondary.main" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <DashboardNavbar
        user={user}
        title="Faculty Dashboard"
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
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Welcome, {user?.username || "Faculty"}
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Quick Actions */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {quickActions.map((action, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Card
                        sx={{
                          cursor: "pointer",
                          transition: "0.3s",
                          "&:hover": { transform: "translateY(-5px)", boxShadow: 3 }
                        }}
                      >
                        <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>
                          <Box sx={{ color: action.color, mb: 1 }}>
                            {action.icon}
                          </Box>
                          <Typography variant="subtitle1" fontWeight="medium">{action.text}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Today's Classes */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" gutterBottom>Today's Classes</Typography>
                  {/* Add class schedule here */}
                  <Typography color="text.secondary">No classes scheduled for today.</Typography>
                </Paper>
              </Grid>

              {/* Pending Tasks */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" gutterBottom>Pending Tasks</Typography>
                  {/* Add pending tasks list here */}
                  <Typography color="text.secondary">No pending tasks.</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default FacultyDashboard;
