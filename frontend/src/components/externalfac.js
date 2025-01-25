import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./externalfac.css";
import {
  IconButton,
  Drawer,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
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

const ExternalFacultyForm = () => {
  const [formData, setFormData] = useState({
    faculty_name: "",
    faculty_subject: "",
    student_count: "",
    total_fees: "",
    payable_fees: "",
    paid_amount: "",
    remaining_amount: "",
  });

  const [facultyData, setFacultyData] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [studentsData, setStudentsData] = useState([]); // State for storing students data
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const classes = useStyles();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("http://localhost:3001/subjects");
        if (response.ok) {
          const subjects = await response.json();
          setSubjectOptions(subjects);
        } else {
          console.error("Failed to fetch subjects.");
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const fetchFacultyData = async () => {
    try {
      const response = await fetch("http://localhost:3001/get-faculty");
      if (response.ok) {
        const data = await response.json();
        setFacultyData(data);
        alert("Faculty data fetched successfully!");
      } else {
        alert("Failed to fetch faculty data.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while fetching faculty data.");
    }
  };

  const handleUpdate = (index) => {
    const faculty = facultyData[index];
    setFormData({ ...faculty });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/delete-faculty/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Faculty data deleted successfully!");
        setFacultyData(facultyData.filter((faculty) => faculty.id !== id));
      } else {
        alert("Failed to delete faculty data.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting faculty data.");
    }
  };

  const viewStudents = async (facultyId, facultySubject) => {
    if (!facultyId || !facultySubject) {
      alert("Invalid faculty ID or subject.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/view-students/${facultyId}/${facultySubject}`
      );
      if (response.ok) {
        const students = await response.json();
        setStudentsData(students);
        navigate(`/student-list/${facultyId}/${facultySubject}`); // Navigate to the student list page
      } else {
        alert("Failed to fetch student data.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while fetching student data.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.faculty_subject) {
      alert("Please select a valid subject.");
      return;
    }

    const updatedFormData = {
      ...formData,
      remaining_amount: formData.payable_fees - formData.paid_amount,
    };

    try {
      const response = await fetch("http://localhost:3001/add-faculty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      });

      if (response.ok) {
        alert("Faculty data added successfully!");
        setFacultyData([...facultyData, updatedFormData]);
        setFormData({
          faculty_name: "",
          faculty_subject: "",
          student_count: "",
          total_fees: "",
          payable_fees: "",
          paid_amount: "",
          remaining_amount: "",
        });
      } else {
        alert("Failed to add faculty data.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding faculty data.");
    }
  };

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
    { label: "Fee Structure", icon: "📊", action: () => navigate("/feestructure") },
  ];

  return (
    <div className="faculty-form-container">
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
            <div
              key={index}
              className={classes.menuItem}
              onClick={() => {
                feature.action();
                toggleDrawer();
              }}
            >
              {feature.icon} {feature.label}
            </div>
          ))}
        </div>
      </Drawer>

      <h2 className="form-title">External Faculty Form</h2>
      <form onSubmit={handleSubmit} className="faculty-form">
        <label>
          Faculty Name:
          <input
            type="text"
            name="faculty_name"
            value={formData.faculty_name}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Faculty Subject:
          <select
            name="faculty_subject"
            value={formData.faculty_subject}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Subject</option>
            {subjectOptions.map((subject) => (
              <option key={subject.id} value={subject.subject_name}>
                {subject.subject_name} (ID: {subject.id})
              </option>
            ))}
          </select>
        </label>
        <label>
          Student Count:
          <input
            type="number"
            name="student_count"
            value={formData.student_count}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Total Fees:
          <input
            type="number"
            name="total_fees"
            value={formData.total_fees}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Payable Fees:
          <input
            type="number"
            name="payable_fees"
            value={formData.payable_fees}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Paid Amount:
          <input
            type="number"
            name="paid_amount"
            value={formData.paid_amount}
            onChange={handleInputChange}
            required
          />
        </label>
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>

      <div className="faculty-data-container">
        <h3>Faculty Data</h3>
        <button onClick={fetchFacultyData} className="fetch-button">
          Fetch Faculty Data
        </button>
        {facultyData.length > 0 ? (
          <table className="faculty-data-table">
            <thead>
              <tr>
                <th>Faculty Name</th>
                <th>Subject</th>
                <th>Student Count</th>
                <th>Total Fees</th>
                <th>Payable Fees</th>
                <th>Paid Amount</th>
                <th>Remaining Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facultyData.map((faculty, index) => (
                <tr key={faculty.id}>
                  <td>{faculty.faculty_name}</td>
                  <td>{faculty.faculty_subject}</td>
                  <td>{faculty.student_count}</td>
                  <td>{faculty.total_fees}</td>
                  <td>{faculty.payable_fees}</td>
                  <td>{faculty.paid_amount}</td>
                  <td>{faculty.remaining_amount}</td>
                  <td>
                    <button onClick={() => handleUpdate(index)}>Update</button>
                    <button onClick={() => handleDelete(faculty.id)}>Delete</button>
                    <button
                      onClick={() =>
                        viewStudents(faculty.id, faculty.faculty_subject)
                      }
                    >
                      View Students
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No faculty data available.</p>
        )}
      </div>
    </div>
  );
};

export default ExternalFacultyForm;

         
