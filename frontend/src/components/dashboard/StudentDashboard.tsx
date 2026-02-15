import React, { useState } from "react";
import { Box, Grid, Card, CardContent, Typography, useTheme, Avatar } from "@mui/material";
import { DashboardNavbar } from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";
import Footer from "../layout/Footer";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EventIcon from "@mui/icons-material/Event";

const StudentDashboard = ({ user }: any) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <DashboardNavbar
        user={user}
        title="Synchronik"
        onLogout={() => console.log("Logout")}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          user={user}
          title="Student Portal"
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
              Welcome back, {user?.name || "Student"}!
            </Typography>

            {/* Student Stats/Quick Info */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle1">Attendance</Typography>
                        <Typography variant="h3">85%</Typography>
                      </Box>
                      <EventIcon fontSize="large" sx={{ opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: "secondary.main", color: "secondary.contrastText" }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle1">CGPA</Typography>
                        <Typography variant="h3">8.9</Typography>
                      </Box>
                      <SchoolIcon fontSize="large" sx={{ opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: "success.main", color: "success.contrastText" }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle1">Assignments</Typography>
                        <Typography variant="h3">12/15</Typography>
                      </Box>
                      <AssignmentIcon fontSize="large" sx={{ opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>Recent Notices</Typography>
            <Card>
              <CardContent>
                <Typography color="text.secondary">No recent notices.</Typography>
              </CardContent>
            </Card>

          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default StudentDashboard;
