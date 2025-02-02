import React, { useState } from "react";
import {
  Grid,
  Typography,
  Card,
  CardContent,
  IconButton,
  Drawer,
  useTheme,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { styled } from "@mui/system";
import { motion } from "framer-motion";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// ** Styled Components **
const Container = styled(motion.div)(({ theme }) => ({
  padding: "40px",
  minHeight: "100vh",
  background: theme.palette.mode === "dark"
    ? "linear-gradient(135deg, #1e1e2f, #2a2a40)"
    : "linear-gradient(135deg, #f0f4ff, #e6e9f2)",
  color: theme.palette.mode === "dark" ? "#fff" : "#000",
  transition: "background 0.5s ease, color 0.5s ease",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}));

const StyledCard = styled(Card)(({ theme }) => ({
  textAlign: "center",
  padding: "20px",
  borderRadius: "20px",
  backgroundColor: theme.palette.mode === "dark"
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(255, 255, 255, 0.8)",
  color: theme.palette.mode === "dark" ? "#fff" : "#000",
  backdropFilter: "blur(10px)",
  border: theme.palette.mode === "dark"
    ? "1px solid rgba(255, 255, 255, 0.2)"
    : "1px solid rgba(0, 0, 0, 0.1)",
  cursor: "pointer",
  transition: "transform 0.3s, box-shadow 0.3s, backdrop-filter 0.3s",
  boxShadow: theme.palette.mode === "dark"
    ? "0 8px 32px rgba(0, 0, 0, 0.2)"
    : "0 8px 32px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: theme.palette.mode === "dark"
      ? "0 12px 40px rgba(0, 0, 0, 0.3)"
      : "0 12px 40px rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(15px)", 
    zIndex: 1, 
  },
  "&:not(:hover)": {
    backdropFilter: "blur(5px)",
  },
}));

const Footer = styled("div")(({ theme }) => ({
  textAlign: "center",
  padding: "20px",
  marginTop: "40px",
  backgroundColor: theme.palette.mode === "dark" 
    ? "rgba(255, 255, 255, 0.1)" 
    : "rgba(253, 253, 253, 0.18)",
  color: theme.palette.mode === "dark" ? "#fff" : "#000", 
  position: "relative",
  bottom: 0,
  width: "100%",
  backdropFilter: "blur(5px)",
  boxShadow: theme.palette.mode === "dark" 
    ? "0 -2px 10px rgba(255, 255, 255, 0.2)" 
    : "0 -2px 10px rgba(0, 0, 0, 0.2)",
  zIndex: 1000,
  transition: "background-color 0.3s, color 0.3s",
}));

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const appTheme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  const toggleDrawer = () => setOpen(!open);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const features = [
    { label: "External Fac", icon: "📘", action: () => navigate("/externalfac") },
    { label: "Payment", icon: "💳", action: () => navigate("/payment-details") },
    { label: "Student Info", icon: "📘", action: () => navigate("/studentinfo") },
    { label: "Add Standard", icon: "🔢", action: () => navigate("/AddStandard") },
    { label: "Add Subject", icon: "📚", action: () => navigate("/AddSubject") },
    { label: "Student Faculty View", icon: "👥", action: () => navigate("/student-faculty-view") },
    { label: "Payment Form", icon: "💳", action: () => navigate("/paymentinfo") },
    { label: "Student Details", icon: "👨‍🎓", action: () => navigate("/student-details") },
    { label: "Fee Structure", icon: "📊", action: () => navigate("/feestructure") },
  ];

  return (
    <ThemeProvider theme={appTheme}>
      <Container
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Menu Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{ position: "fixed", top: 20, left: 20, zIndex: 1000 }}
        >
          <IconButton
            sx={{
              backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
              padding: 2,
              borderRadius: "50%",
              color: darkMode ? "#fff" : "#000",
              backdropFilter: "blur(10px)",
              transition: "background-color 0.3s",
              "&:hover": {
                backgroundColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
              },
            }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
        </motion.div>

        {/* Dark Mode Toggle */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{ position: "fixed", top: 20, right: 20, zIndex: 1000 }}
        >
          <IconButton sx={{ color: "#fff" }} onClick={toggleDarkMode}>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </motion.div>

        {/* Sidebar Drawer */}
        <Drawer anchor="left" open={open} onClose={toggleDrawer}>
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
            style={{ padding: "20px", width: "280px", color: darkMode ? "#fff" : "#000" }}
          >
            <IconButton
              onClick={() => {
                setOpen(false);
                navigate(-1);
              }}
              sx={{ color: darkMode ? "#fff" : "#000" }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Menu
            </Typography>
            {features.map((feature, index) => (
              <Typography
                key={index}
                sx={{
                  fontSize: "18px",
                  fontWeight: "500",
                  padding: "12px",
                  cursor: "pointer",
                  borderRadius: "10px",
                  transition: "background-color 0.3s",
                  "&:hover": {
                    backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                  },
                }}
                onClick={() => {
                  feature.action();
                  toggleDrawer();
                }}
              >
                {feature.icon} {feature.label}
              </Typography>
            ))}
          </motion.div>
        </Drawer>

        {/* Title */}
        <Typography variant="h3" align="center" fontWeight="bold" sx={{ mb: 4, color: "inherit" }}>
          Student/Parent Dashboard
        </Typography>

        {/* Features Grid */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={4} md={4} lg={4} key={index}>
              <StyledCard
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={feature.action}
              >
                <CardContent>
                  <Typography variant="h2">{feature.icon}</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {feature.label}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        {/* Footer */}
        <Footer>
          <img
            src="logo.png"
            alt="JG Group Tuition"
            style={{ height: "70px", marginBottom: "10px" }}
          />
          <Typography variant="h6" style={{ fontWeight: "bold" }}>
            LET YOUR CHILD GROW
          </Typography>
          <Typography variant="body2">
            Email: JG@gmail.com | Mobile: +91-9898378471, +91-1111222233
          </Typography>
          <img
            src="Cubix_Digital_logo.png"
            alt="Cubix Digital"
            style={{ height: "70px", marginBottom: "10px", marginLeft:"10px" }}
          />
          <Typography variant="h10" style={{ fontWeight: "bold" , marginLeft:"-80px"}}>
            Cubix Digital
          </Typography>
        </Footer>
      </Container>
    </ThemeProvider>
  );
};

export default Dashboard;
