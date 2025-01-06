import React, { useState, useEffect } from "react";
import "./studentinfo.css";

const StudentForm = () => {
  const [formData, setFormData] = useState({
    student_id: "", // Field for student ID
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
    const fetchStandards = async () => {
      try {
        const response = await fetch("http://localhost:3001/standards");
        const data = await response.json();
        setStandards(data);
      } catch (error) {
        console.error("Error fetching standards:", error);
      }
    };

    const fetchSubjects = async () => {
      try {
        const response = await fetch("http://localhost:3001/subjects");
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchStandards();
    fetchSubjects();
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
    const updatedSubjects = selectedSubjects.filter((_, i) => i !== index);
    setSelectedSubjects(updatedSubjects);
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
        setMessage(data.message);
        setFormData({
          student_id: "", // Reset student ID
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

  return (
    <div className="form-container">
      <h2>Student Information Form</h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit} className="student-form">
        {/* Student ID Field */}
        <div className="form-group">
          <label htmlFor="student_id">Student ID:</label>
          <input
            type="text"
            id="student_id"
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            placeholder="Enter Student ID"
          />
        </div>

        {/* Name Field */}
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Phone Number Field */}
        <div className="form-group">
          <label htmlFor="phone_no">Phone Number:</label>
          <input
            type="text"
            id="phone_no"
            name="phone_no"
            value={formData.phone_no}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* School Name Field */}
        <div className="form-group">
          <label htmlFor="school_name">School Name:</label>
          <input
            type="text"
            id="school_name"
            name="school_name"
            value={formData.school_name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Board Field */}
        <div className="form-group">
          <label htmlFor="board">Board:</label>
          <input
            type="text"
            id="board"
            name="board"
            value={formData.board}
            onChange={handleChange}
            required
          />
        </div>

        {/* Standard Dropdown */}
        <div className="form-group">
          <label htmlFor="standard_id">Standard:</label>
          <select
            id="standard_id"
            name="standard_id"
            value={formData.standard_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Standard</option>
            {standards.map((standard) => (
              <option key={standard.id} value={standard.id}>
                {standard.standard_name}
              </option>
            ))}
          </select>
        </div>

        {/* Medium Field */}
        <div className="form-group">
          <label htmlFor="medium">Medium:</label>
          <input
            type="text"
            id="medium"
            name="medium"
            value={formData.medium}
            onChange={handleChange}
            required
          />
        </div>

        {/* Subjects */}
        <div className="form-group">
          <label>Subjects:</label>
          {selectedSubjects.map((subject, index) => (
            <div key={index} className="subject-row">
              <select
                value={subject}
                onChange={(e) => handleSubjectChange(index, e.target.value)}
                required
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
                  className="remove-btn"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addSubjectField} className="add-btn">
            Add Subject
          </button>
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default StudentForm;
