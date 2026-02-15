import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  useTheme,
  alpha,
  Stack,
  IconButton
} from "@mui/material";
import { Navbar } from "./layout/Navbar";
import Footer from "./layout/Footer";
import LoginModal from "./auth/LoginModal";
import { getDashboardRoute } from "../utils/roles";
import SchoolIcon from "@mui/icons-material/School";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface HomeProps {
  onLoginSuccess: (userData: any) => void;
}

const Home: React.FC<HomeProps> = ({ onLoginSuccess }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLoginSuccess = (userData: any) => {
    onLoginSuccess(userData);
    const dashboardRoute = getDashboardRoute(userData.designation.code);
    navigate(dashboardRoute);
  };

  const features: Feature[] = [
    {
      title: "Student Portal",
      description: "Academics, Attendance & Results",
      icon: <SchoolIcon fontSize="medium" />,
      color: theme.palette.primary.main,
    },
    {
      title: "Faculty Tools",
      description: "Grading, Schedule & Management",
      icon: <SupervisorAccountIcon fontSize="medium" />,
      color: theme.palette.secondary.main,
    },
    {
      title: "Admin Console",
      description: "Centralized Institution Control",
      icon: <AdminPanelSettingsIcon fontSize="medium" />,
      color: theme.palette.success.main,
    },
    {
      title: "Examination",
      description: "Automated Grading System",
      icon: <ReceiptLongIcon fontSize="medium" />,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      bgcolor: 'background.default',
      overflow: 'hidden'
    }}>
      {/* Fixed Header */}
      <Box sx={{ flexShrink: 0, zIndex: 1100 }}>
        <Navbar onLoginClick={() => setIsLoginOpen(true)} />
      </Box>

      {/* Main Scrollable Content Area */}
      <Box sx={{
        flexGrow: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        scrollBehavior: 'smooth'
      }}>

        {/* Background Design Elements */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          minHeight: '100%',
          opacity: 0.4,
          zIndex: 0,
          background: `radial-gradient(circle at 10% 20%, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 40%),
                       radial-gradient(circle at 90% 80%, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 40%)`,
          pointerEvents: 'none'
        }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, flexGrow: 1, py: { xs: 4, md: 8 }, display: 'flex', alignItems: 'center' }}>
          <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">

            {/* Left Column: Hero Text */}
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography
                  variant="overline"
                  color="primary"
                  fontWeight="bold"
                  sx={{ letterSpacing: 2, mb: 2, display: 'block' }}
                >
                  WELCOME TO THE FUTURE
                </Typography>
                <Typography
                  variant="h1"
                  fontWeight="900"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4.5rem' },
                    lineHeight: 1.1,
                    mb: 3,
                    background: theme.palette.mode === 'dark'
                      ? `linear-gradient(45deg, #fff 30%, ${theme.palette.grey[500]} 90%)`
                      : `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                    backgroundClip: "text",
                    textFillColor: "transparent",
                  }}
                >
                  Smart Campus <br /> Management
                </Typography>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{
                    mb: 5,
                    maxWidth: { xs: '100%', md: '85%' },
                    fontWeight: 400,
                    lineHeight: 1.6
                  }}
                >
                  A comprehensive ERP solution designed to streamline operations,
                  empower faculty, and enhance the student learning experience.
                </Typography>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => setIsLoginOpen(true)}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderRadius: '50px',
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                    }}
                  >
                    Login to Portal
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderRadius: '50px',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderWidth: 2,
                      '&:hover': { borderWidth: 2 }
                    }}
                  >
                    View Features
                  </Button>
                </Stack>
              </Box>
            </Grid>

            {/* Right Column: Features Grid */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={3}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card sx={{
                      height: '100%',
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.background.paper, 0.6),
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      boxShadow: theme.shadows[1],
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 30px ${alpha(feature.color, 0.2)}`,
                        borderColor: alpha(feature.color, 0.3)
                      }
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{
                          display: 'inline-flex',
                          p: 1.5,
                          borderRadius: 3,
                          bgcolor: alpha(feature.color, 0.1),
                          color: feature.color,
                          mb: 2
                        }}>
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* Fixed Footer */}
      <Box sx={{ flexShrink: 0, zIndex: 1100 }}>
        <Footer />
      </Box>

      <LoginModal
        open={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </Box>
  );
};

export default Home;
