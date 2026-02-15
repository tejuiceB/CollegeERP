import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Tooltip,
  Fade,
  InputBase,
  styled,
  alpha,
  Typography,
  Button,
  Divider,
  ListItemIcon,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuIcon from "@mui/icons-material/Menu";
import { useSettings } from "../../context/SettingsContext";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { SessionTimer } from './SessionTimer';

// Styled components
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
      "&:focus": {
        width: "30ch",
      },
    },
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

interface NavbarProps {
  onLoginClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const mobileMenuId = "primary-search-account-menu-mobile";

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
      sx={{
        "& .MuiPaper-root": {
          borderRadius: 2,
          boxShadow: theme.shadows[8],
          minWidth: 200,
        }
      }}
    >
      <MenuItem component={Link} to="/" onClick={handleMobileMenuClose}>
        <Typography variant="body1" fontWeight="medium">Home</Typography>
      </MenuItem>
      <MenuItem component={Link} to="/about" onClick={handleMobileMenuClose}>
        <Typography variant="body1" fontWeight="medium">About</Typography>
      </MenuItem>
      <MenuItem component={Link} to="/contact" onClick={handleMobileMenuClose}>
        <Typography variant="body1" fontWeight="medium">Contact</Typography>
      </MenuItem>
      <MenuItem onClick={() => { handleMobileMenuClose(); onLoginClick(); }}>
        <Button variant="contained" fullWidth size="small">Login</Button>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: alpha(theme.palette.background.default, 0.8)
        }}
      >
        <Toolbar>
          <Box
            component={Link}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "text.primary",
              mr: 2
            }}
          >
            <Box component="img" src="/logo.svg" sx={{ height: 32, mr: 1.5 }} alt="Logo" />
            <Typography variant="h6" fontWeight="bold" color="primary">
              SynchronikERP
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Menu */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: 'center', gap: 3 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Typography variant="subtitle2" color="text.primary" sx={{ '&:hover': { color: 'primary.main' }, fontWeight: 500 }}>
                Home
              </Typography>
            </Link>
            <Link to="/about" style={{ textDecoration: 'none' }}>
              <Typography variant="subtitle2" color="text.primary" sx={{ '&:hover': { color: 'primary.main' }, fontWeight: 500 }}>
                About
              </Typography>
            </Link>
            <Link to="/contact" style={{ textDecoration: 'none' }}>
              <Typography variant="subtitle2" color="text.primary" sx={{ '&:hover': { color: 'primary.main' }, fontWeight: 500 }}>
                Contact
              </Typography>
            </Link>
            <Button
              variant="contained"
              onClick={onLoginClick}
              sx={{ borderRadius: '20px', px: 3, textTransform: 'none' }}
            >
              Login
            </Button>
          </Box>

          {/* Mobile Menu Icon */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
    </Box>
  );
};

interface DashboardNavbarProps {
  user: any;
  title?: string;
  onLogout?: () => void;
  onSidebarToggle?: () => void; // Added prop
}

// Dashboard Navbar with Premium Look
export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  user,
  title,
  onLogout,
  onSidebarToggle,
}) => {
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useSettings();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationEl, setNotificationEl] = useState<null | HTMLElement>(null);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationEl(event.currentTarget);
  };

  const handleSessionTimeout = () => {
    if (onLogout) onLogout();
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: alpha(theme.palette.background.default, 0.8),
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        color: theme.palette.text.primary,
        height: "70px", // Slightly taller for premium feel
        justifyContent: "center",
        boxShadow: `0 4px 6px -1px ${alpha(theme.palette.common.black, 0.05)}`
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", minHeight: "70px !important" }}>

        {/* Left: Toggle & Title */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onSidebarToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                textFillColor: "transparent",
              }}
            >
              {title || "Dashboard"}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Welcome back, {user?.username}
            </Typography>
          </Box>
        </Box>

        {/* Right: Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>

          {/* Session Timer - Pill Shape */}
          <Box sx={{
            display: { xs: 'none', md: 'block' },
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            px: 2,
            py: 0.5,
            borderRadius: '20px'
          }}>
            <SessionTimer onTimeout={handleSessionTimeout} />
          </Box>

          {/* Dark Mode */}
          <Tooltip title="Toggle Theme">
            <IconButton onClick={toggleDarkMode} color="inherit" sx={{ bgcolor: theme.palette.action.hover }}>
              {darkMode ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton onClick={handleNotificationClick} color="inherit" sx={{ bgcolor: theme.palette.action.hover }}>
              <Badge badgeContent={3} color="error" variant="dot">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem variant="middle" sx={{ mx: 1, height: 24, alignSelf: 'center' }} />

          {/* Profile */}
          <Box
            onClick={handleProfileClick}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              p: 0.5,
              pr: 1.5,
              borderRadius: '30px',
              transition: '0.2s',
              '&:hover': { bgcolor: theme.palette.action.hover }
            }}
          >
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar
                alt={user?.username || "User"}
                src={user?.avatar}
                sx={{ width: 36, height: 36, border: `2px solid ${theme.palette.background.paper}` }}
              />
            </StyledBadge>
            <Box sx={{ ml: 1.5, display: { xs: 'none', md: 'block' } }}>
              <Typography variant="subtitle2" fontWeight="600" lineHeight={1}>
                {user?.username || "User"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.designation?.name || "Member"}
              </Typography>
            </Box>
            <KeyboardArrowDownIcon fontSize="small" color="action" sx={{ ml: 1, display: { xs: 'none', md: 'block' } }} />
          </Box>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          TransitionComponent={Fade}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              borderRadius: 2,
              minWidth: 180
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => setAnchorEl(null)}>
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon> Profile
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>
            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon> Account
          </MenuItem>
          <Divider />
          <MenuItem onClick={onLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon><Box component="span" sx={{ color: 'error.main' }}>Logout</Box></ListItemIcon> Maximum Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
