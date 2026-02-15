import React from "react";
import { useTheme as useMUITheme } from "@mui/material/styles";
import {
  Box,
  Container,
  Grid,
  Link,
  Typography,
  Divider,
  Stack,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";

const Footer: React.FC = () => {
  const theme = useMUITheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 1,
        px: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.background.paper
            : "#ffffff",
        color: theme.palette.text.secondary,
        backdropFilter: "blur(20px)",
        zIndex: 10, // Ensure it sits on top if needed
        flexShrink: 0
      }}
    >
      <Container maxWidth={false}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="nowrap" // Force single line
          sx={{ overflow: "hidden", gap: 2 }}
        >
          {/* Logo/Copyright - Left */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: "fit-content" }}>
            <Box component="img" src="/logo.svg" alt="Logo" sx={{ height: 16, display: { xs: 'none', sm: 'block' } }} />
            <Typography variant="caption" noWrap>
              © 2024 SynchronikERP
            </Typography>
          </Stack>

          {/* Links - Center (Hide on very small screens if necessary, or keep concise) */}
          <Stack
            direction="row"
            spacing={2}
            divider={
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: theme.palette.divider }}
              />
            }
            alignItems="center"
            justifyContent="center"
            sx={{ display: { xs: 'none', md: 'flex' } }} // Hide on mobile to ensure "one line" doesn't break
          >
            {["Privacy", "Terms", "Support"].map((text) => (
              <Link
                key={text}
                href="#"
                underline="hover"
                color="inherit"
              >
                <Typography variant="caption">{text}</Typography>
              </Link>
            ))}
          </Stack>

          {/* Social Icons - Right */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: "fit-content" }}>
            {[
              { icon: <GitHubIcon sx={{ fontSize: 16 }} />, url: "#" },
              { icon: <LinkedInIcon sx={{ fontSize: 16 }} />, url: "#" },
              { icon: <TwitterIcon sx={{ fontSize: 16 }} />, url: "#" },
            ].map((social, index) => (
              <Link
                key={index}
                href={social.url}
                color="inherit"
                sx={{
                  "&:hover": { color: theme.palette.primary.main },
                  display: "flex",
                }}
              >
                {social.icon}
              </Link>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
