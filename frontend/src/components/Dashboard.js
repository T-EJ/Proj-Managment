import React, { useState } from "react";
import { Grid, Button, Typography, Card, CardContent, IconButton, Drawer } from "@mui/material";
import { makeStyles } from "@mui/styles";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const useStyles = makeStyles(() => ({
  container: {
    padding: "20px",
    position: "relative", // To prevent the button from overlapping the content
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
    position: "fixed", // Fixing the button to the left side of the screen
    top: "20px", // Space from the top
    left: "20px", // Space from the left side
    zIndex: 1000, // Ensure it's always above the content
    backgroundColor: "#333", // Dark background for visibility
    padding: "10px",
    borderRadius: "50%", // Circular button style
    color: "#fff", // Icon color
  },
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 240,
    backgroundColor: "#333", // Dark background color for the menu
    color: "#fff", // White text
    padding: "20px",
    borderRight: "none",
    transition: "all 0.3s ease-in-out", // Smooth transition for the drawer
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
      backgroundColor: "#444", // Darker shade on hover
    },
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false); // State to control drawer visibility
  const navigate = useNavigate(); // Define navigate using useNavigate

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const features = [
    //  <img
    //        src="logo.jpeg"
    //        alt="JG Group Tuition"
    //        style={{ height: "60px", width: " 200px", marginBottom: "10px" }}
    //      /> 
    // { label: "Inbox", icon: "✉" },
    // { label: "Batch Schedules", icon: "🕒" },
    // { label: "Exam", icon: "🎓" },
    // { label: "Result", icon: "📈" },
    // { label: "Study Material", icon: "📚" },
    { label: "External Fac", icon: "📘", action: () => navigate("/externalfac") },
    { label: "Payment", icon: "💳", action: () => navigate("/payment-details") }, // Add navigate for Payment
    { label: "StudentInfo", icon: "📘", action: () => navigate("/studentinfo") },
    { label: "AddStandard", icon: "🔢", action: () => navigate("/AddStandard") },
    { label: "AddSubject", icon: "℁", action: () => navigate("/AddSubject") },
  ];

  

  return (
    
    <div className={classes.container}>
      {/* <img
          src="logo.jpeg"
          alt="JG Group Tuition"
          style={{ height: "60px", width: " 200px", marginBottom: "10px" }}
        /> */}
      {/* Hamburger Menu Button */}
      <IconButton className={classes.menuButton} onClick={toggleDrawer}>
        <MenuIcon />
      </IconButton>

      {/* Slide-out Drawer */}
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
          <Typography variant="h6" style={{ color: "#fff", marginBottom: "20px" }}>
            Menu
          </Typography>
          {features.map((feature, index) => (
            <div
              key={index}
              className={classes.menuItem}
              onClick={feature.action} // Trigger the action on click
            >
              {feature.icon} {feature.label}
            </div>
          ))}
        </div>
      </Drawer>

      {/* Dashboard Content */}
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
      {/* <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Button className={classes.reloadButton}>RELOAD SUBSCRIPTION</Button>
      </div> */}
      <div className={classes.footer}>
        <img
          src="logo.jpeg"
          alt="JG Group Tuition"
          style={{ height: "60px", marginBottom: "10px" }}
        />
        <Typography variant="body1">
        LET YOUR CHILD GROW
        </Typography>
        <Typography variant="body2">
          Email: JG@gmail.com | Mobile: +91-9898378471, +91-1111222233
        </Typography>
      </div>
    </div>
  );
};

export default Dashboard;