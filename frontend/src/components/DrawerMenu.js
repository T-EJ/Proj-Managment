import React, { useState } from "react";
import { Drawer, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const DrawerMenu = ({ darkMode, toggleDarkMode, features }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = () => setOpen(!open);

  return (
    <>
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

      {/* Sidebar Drawer */}
      <Drawer anchor="left" open={open} onClose={toggleDrawer}>
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 120 }}
          style={{ padding: "20px", width: "280px", color: darkMode ? "#fff" : "#000" }}
        >
          {/* Back Arrow Button */}
          <IconButton
            onClick={() => {
              setOpen(false); // Close the drawer
              navigate(-1); // Navigate to the previous route
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
                setOpen(false); // Close the drawer after action
              }}
            >
              {feature.icon} {feature.label}
            </Typography>
          ))}
        </motion.div>
      </Drawer>
    </>
  );
};

export default DrawerMenu;
