import React, { useState } from "react";
import {
  Grid,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  Drawer,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles(() => ({
  container: {
    padding: "20px",
    position: "relative",
  },
  card: {
    textAlign: "center",
    padding: "10px",
    borderRadius: "10px",
    backgroundColor: "#f7f7f7",
  },
  icon: {
    fontSize: "50px",
  },
  reloadButton: {
    backgroundColor: "#ff7043",
    color: "#fff",
    margin: "20px auto",
    padding: "10px 20px",
  },
  footer: {
    textAlign: "center",
    marginTop: "20px",
  },
  menuButton: {
    position: "fixed",
    top: "20px",
    left: "20px",
    zIndex: 1000,
    backgroundColor: "#333",
    padding: "10px",
    borderRadius: "50%",
    color: "#fff",
  },
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 240,
    backgroundColor: "#333",
    color: "#fff",
    padding: "20px",
    borderRight: "none",
    transition: "all 0.3s ease-in-out",
  },
  drawerContent: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  menuItem: {
    fontSize: "18px",
    fontWeight: "500",
    padding: "10px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    "&:hover": {
      backgroundColor: "#444",
    },
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const features = [
    { label: "External Fac", icon: "📘", action: () => navigate("/externalfac") },
    { label: "Payment", icon: "💳", action: () => navigate("/payment-details") },
    { label: "StudentInfo", icon: "📘", action: () => navigate("/studentinfo") },
    { label: "AddStandard", icon: "🔢", action: () => navigate("/AddStandard") },
    { label: "AddSubject", icon: "℁", action: () => navigate("/AddSubject") },
    { label: "Student Faculty View", icon: "👥", action: () => navigate("/student-faculty-view") },
    { label: "Payment Form", icon: "💳", action: () => navigate("/paymentinfo") },
    { label: "Student Details", icon: "👨‍🎓", action: () => navigate("/student-details") },
    { label: "Fee Structure", icon: "📊", action: () => navigate("/feestructure") }, // New Feature
  ];

  return (
    <div className={classes.container}>
      <IconButton className={classes.menuButton} onClick={toggleDrawer}>
        <MenuIcon />
      </IconButton>

      <Drawer
        className={classes.drawer}
        anchor="left"
        open={open}
        onClose={toggleDrawer}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerContent}>
          <Typography
            variant="h6"
            style={{ color: "#fff", marginBottom: "20px" }}
          >
            Menu
          </Typography>
          {features.map((feature, index) => (
            <div key={index} className={classes.menuItem} onClick={feature.action}>
              {feature.icon} {feature.label}
            </div>
          ))}
        </div>
      </Drawer>

      <Typography variant="h4" align="center" gutterBottom>
        Student/Parent Dashboard
      </Typography>
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h2" className={classes.icon}>
                  {feature.icon}
                </Typography>
                <Typography variant="subtitle1">{feature.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <div className={classes.footer}>
        <img
          src="logo.jpeg"
          alt="JG Group Tuition"
          style={{ height: "60px", marginBottom: "10px" }}
        />
        <Typography variant="body1">LET YOUR CHILD GROW</Typography>
        <Typography variant="body2">
          Email: JG@gmail.com | Mobile: +91-9898378471, +91-1111222233
        </Typography>
      </div>
    </div>
  );
};

export default Dashboard;
