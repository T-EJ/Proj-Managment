import React, { useState, useEffect } from "react";

const StudentForm = () => {
  const [formData, setFormData] = useState({
    student_id: "",
    name: "",
    phone_no: "",
    email: "",
    school_name: "",
    board: "",
    standard_id: "",
    medium: "",
  });

  const [standards, setStandards] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [standardsResponse, subjectsResponse] = await Promise.all([
          fetch("http://localhost:3001/standards"),
          fetch("http://localhost:3001/subjects"),
        ]);

        const standardsData = await standardsResponse.json();
        const subjectsData = await subjectsResponse.json();

        setStandards(standardsData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubjectChange = (index, value) => {
    const updatedSubjects = [...selectedSubjects];
    updatedSubjects[index] = value;
    setSelectedSubjects(updatedSubjects);
  };

  const addSubjectField = () => {
    setSelectedSubjects([...selectedSubjects, ""]);
  };

  const removeSubjectField = (index) => {
    setSelectedSubjects((prevSubjects) =>
      prevSubjects.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestBody = {
      ...formData,
      subjects: selectedSubjects,
    };

    try {
      const response = await fetch("http://localhost:3001/studentinfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Student added successfully! 🎉");
        setTimeout(() => setMessage(""), 3000); // Auto-clear message after 3 seconds
        setFormData({
          student_id: "",
          name: "",
          phone_no: "",
          email: "",
          school_name: "",
          board: "",
          standard_id: "",
          medium: "",
        });
        setSelectedSubjects([]);
      } else {
        setMessage(data.error || "Failed to submit data");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("An error occurred while submitting the form.");
    }
  };

  const styles = {
    body: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh", // Ensures the body takes up the full height of the screen
      background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
      padding: "20px",
    },
    formContainer: {
      background: "#ffffff",
      borderRadius: "16px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      padding: "40px",
      maxWidth: "600px",
      width: "100%",
      animation: "fadeIn 0.5s ease-in-out",
    },
    formTitle: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#2c3e50",
      textAlign: "center",
      marginBottom: "24px",
      position: "relative",
    },
    messageSuccess: {
      color: "#2ecc71",
      textAlign: "center",
      fontWeight: "600",
    },
    studentForm: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    formGroup: {
      marginBottom: "20px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: "600",
      color: "#555",
      marginBottom: "8px",
    },
    input: {
      width: "100%",
      padding: "12px",
      border: "2px solid #ddd",
      borderRadius: "8px",
      fontSize: "14px",
      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
    },
    select: {
      width: "100%",
      padding: "12px",
      border: "2px solid #ddd",
      borderRadius: "8px",
      fontSize: "14px",
      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
    },
    subjectRow: {
      display: "flex",
      gap: "8px",
    },
    removeButton: {
      background: "transparent",
      border: "none",
      color: "#e74c3c",
      fontSize: "18px",
      cursor: "pointer",
    },
    addButton: {
      padding: "10px 20px",
      backgroundColor: "#3498db",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
    },
    submitButton: {
      background: "#2ecc71",
      padding: "12px 24px",
      border: "none",
      borderRadius: "8px",
      color: "#fff",
      fontSize: "16px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.body}>
      <div style={styles.formContainer}>
        <h2 style={styles.formTitle}>Student Information Form</h2>
        {message && <p style={styles.messageSuccess}>{message}</p>}

        <form onSubmit={handleSubmit} style={styles.studentForm}>
          {/* Input Fields */}
          {[
            { label: "Student ID", name: "student_id", type: "text" },
            { label: "Name", name: "name", type: "text", required: true },
            { label: "Phone Number", name: "phone_no", type: "text", required: true },
            { label: "Email", name: "email", type: "email", required: true },
            { label: "School Name", name: "school_name", type: "text", required: true },
            { label: "Board", name: "board", type: "text", required: true },
            { label: "Medium", name: "medium", type: "text", required: true },
          ].map(({ label, name, type, required }) => (
            <div style={styles.formGroup} key={name}>
              <label htmlFor={name} style={styles.label}>{label}:</label>
              <input
                type={type}
                id={name}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={`Enter ${label}`}
                required={required}
                style={styles.input}
              />
            </div>
          ))}

          {/* Standard Dropdown */}
          <div style={styles.formGroup}>
            <label htmlFor="standard_id" style={styles.label}>Standard:</label>
            <select
              id="standard_id"
              name="standard_id"
              value={formData.standard_id}
              onChange={handleChange}
              required
              style={styles.select}
            >
              <option value="">Select Standard</option>
              {standards.map((standard) => (
                <option key={standard.id} value={standard.id}>
                  {standard.standard_name}
                </option>
              ))}
            </select>
          </div>

          {/* Subjects Selection */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Subjects:</label>
            {selectedSubjects.map((subject, index) => (
              <div key={index} style={styles.subjectRow}>
                <select
                  value={subject}
                  onChange={(e) => handleSubjectChange(index, e.target.value)}
                  required
                  style={styles.select}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subjectOption) => (
                    <option key={subjectOption.id} value={subjectOption.id}>
                      {subjectOption.subject_name}
                    </option>
                  ))}
                </select>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeSubjectField(index)}
                    style={styles.removeButton}
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSubjectField}
              style={styles.addButton}
            >
              ➕ Add Subject
            </button>
          </div>

          {/* Submit Button */}
          <button type="submit" style={styles.submitButton}>🚀 Submit</button>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;