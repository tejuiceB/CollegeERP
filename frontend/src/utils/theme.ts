import { createTheme, alpha } from "@mui/material/styles";

// Premium Color Palette
const primaryColor = "#6366f1"; // Indigo 500
const secondaryColor = "#ec4899"; // Pink 500
const successColor = "#10b981"; // Emerald 500
const errorColor = "#ef4444"; // Red 500
const warningColor = "#f59e0b"; // Amber 500

const darkBackground = "#0f172a"; // Slate 900
const darkPaper = "#1e293b"; // Slate 800

const lightBackground = "#f8fafc"; // Slate 50
const lightPaper = "#ffffff";

const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 700, fontSize: "2.5rem" },
  h2: { fontWeight: 700, fontSize: "2rem" },
  h3: { fontWeight: 600, fontSize: "1.75rem" },
  h4: { fontWeight: 600, fontSize: "1.5rem" },
  h5: { fontWeight: 600, fontSize: "1.25rem" },
  h6: { fontWeight: 600, fontSize: "1rem" },
  button: { textTransform: "none" as const, fontWeight: 600 },
};

const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: "8px 16px",
        boxShadow: "none",
        "&:hover": {
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        },
      },
      containedPrimary: {
        background: `linear-gradient(45deg, ${primaryColor}, #818cf8)`,
      },
      containedSecondary: {
        background: `linear-gradient(45deg, ${secondaryColor}, #f472b6)`,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: 8,
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: primaryColor,
      contrastText: "#fff",
    },
    secondary: {
      main: secondaryColor,
      contrastText: "#fff",
    },
    background: {
      default: lightBackground,
      paper: lightPaper,
    },
    success: { main: successColor },
    error: { main: errorColor },
    warning: { main: warningColor },
  },
  typography,
  components: {
    ...components,
    MuiPaper: {
      styleOverrides: {
        root: {
          ...components.MuiPaper.styleOverrides.root,
          backgroundColor: lightPaper,
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: primaryColor,
      contrastText: "#fff",
    },
    secondary: {
      main: secondaryColor,
      contrastText: "#fff",
    },
    background: {
      default: darkBackground,
      paper: darkPaper,
    },
    success: { main: successColor },
    error: { main: errorColor },
    warning: { main: warningColor },
  },
  typography,
  components: {
    ...components,
    MuiPaper: {
      styleOverrides: {
        root: {
          ...components.MuiPaper.styleOverrides.root,
          backgroundColor: darkPaper,
        },
      },
    },
  },
});
