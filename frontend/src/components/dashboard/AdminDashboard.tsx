import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Construction as ConstructionIcon,
} from "@mui/icons-material";
import { DashboardNavbar } from "../layout/Navbar";
import Sidebar, { SidebarMenuItem } from "../layout/Sidebar";
import Footer from "../layout/Footer";

// Mock Data
const stats = [
  {
    title: "Total Students",
    value: "2,543",
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    color: "primary.main",
    trend: "+5.2%",
  },
  {
    title: "Total Faculty",
    value: "145",
    icon: <PersonIcon sx={{ fontSize: 40 }} />,
    color: "success.main",
    trend: "+2.1%",
  },
  {
    title: "Courses",
    value: "48",
    icon: <MenuBookIcon sx={{ fontSize: 40 }} />,
    color: "warning.main",
    trend: "0%",
  },
  {
    title: "Revenue",
    value: "$124k",
    icon: <AttachMoneyIcon sx={{ fontSize: 40 }} />,
    color: "error.main",
    trend: "+12.5%",
  },
];

const quickActions = [
  { title: "Add Student", icon: <AddIcon />, color: "primary" },
  { title: "Add Faculty", icon: <PersonIcon />, color: "secondary" },
  { title: "Create Course", icon: <SchoolIcon />, color: "success" },
  { title: "Send Notice", icon: <NotificationsIcon />, color: "warning" },
];

const AdminDashboard = ({ user }: any) => {
  const [activeView, setActiveView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const theme = useTheme();

  const menuItems: SidebarMenuItem[] = [
    {
      icon: <DashboardIcon />,
      text: "Dashboard",
      onClick: () => setActiveView("dashboard"),
      path: "#",
    },
    {
      icon: <PeopleIcon />,
      text: "Students",
      onClick: () => setActiveView("students"),
      path: "#",
    },
    {
      icon: <PersonIcon />,
      text: "Faculty",
      onClick: () => setActiveView("faculty"),
      path: "#",
    },
    {
      icon: <SchoolIcon />,
      text: "Courses",
      onClick: () => setActiveView("courses"),
      path: "#",
    },
    {
      icon: <AttachMoneyIcon />,
      text: "Fees",
      onClick: () => setActiveView("fees"),
      path: "#",
    },
    {
      icon: <AssignmentIcon />,
      text: "Examinations",
      onClick: () => setActiveView("exams"),
      path: "#",
    },
    {
      icon: <NotificationsIcon />,
      text: "Notices",
      onClick: () => setActiveView("notices"),
      path: "#",
    },
    {
      icon: <SettingsIcon />,
      text: "Settings",
      onClick: () => setActiveView("settings"),
      path: "#",
    },
  ];

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: 'text.primary', mb: 4 }}>
              Dashboard Overview
            </Typography>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      height: "100%",
                      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
                      borderRadius: 3,
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 25px 0 rgba(0,0,0,0.1)' }
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                            {stat.title}
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" sx={{ my: 1, color: 'text.primary' }}>
                            {stat.value}
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <TrendingUpIcon fontSize="small" color={stat.trend.startsWith('+') ? "success" : "error"} />
                            <Typography variant="caption" fontWeight="600" sx={{ ml: 0.5, color: stat.trend.startsWith('+') ? "success.main" : "error.main" }}>
                              {stat.trend} <Box component="span" color="text.disabled" fontWeight="400">vs last month</Box>
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            color: stat.color,
                            p: 1.5,
                            borderRadius: '12px',
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            display: 'flex'
                          }}
                        >
                          {stat.icon}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Quick Actions & Charts (Placeholder) */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={{ height: "100%", minHeight: 400, borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="700" gutterBottom>Enrollment Analytics</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 2, border: `1px dashed ${theme.palette.divider}` }}>
                      <Typography color="text.secondary" fontWeight="500">Chart Placeholder</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: "100%", borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="700" gutterBottom>
                      Quick Actions
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      {quickActions.map((action, idx) => (
                        <Grid item xs={6} key={idx}>
                          <Button
                            variant="outlined"
                            fullWidth
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              py: 3,
                              gap: 1.5,
                              height: '100%',
                              borderRadius: 2,
                              borderColor: alpha(theme.palette.divider, 0.5),
                              color: 'text.primary',
                              '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: alpha(theme.palette.primary.main, 0.02)
                              }
                            }}
                          >
                            <Box sx={{ color: `${action.color}.main` }}>{action.icon}</Box>
                            <Typography variant="caption" fontWeight="600">{action.title}</Typography>
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', opacity: 0.7 }}>
            <ConstructionIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" fontWeight="600">
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Module
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Under Maintenance / Coming Soon
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Fixed Header */}
      <Box sx={{ flexShrink: 0, zIndex: 1200 }}>
        <DashboardNavbar
          user={user}
          title="Synchronik"
          onLogout={() => console.log("Logout")}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </Box>

      {/* Main Container: Sidebar + Content */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          user={user}
          menuItems={menuItems}
          title="Admin Dashboard"
        />

        {/* Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden", // Prevent outer scroll
            position: 'relative'
          }}
        >
          {/* Scrollable Dashboard Content */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              overflowX: 'hidden',
              p: { xs: 2, md: 3 },
              bgcolor: "#f4f6f8", // Light gray background for contrast
              scrollBehavior: 'smooth'
            }}
          >
            {renderContent()}
          </Box>

          {/* Fixed Footer at Bottom of Viewport */}
          <Box sx={{ flexShrink: 0, zIndex: 1100 }}>
            <Footer />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
