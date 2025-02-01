  import React, { useState, useEffect } from "react";
  import "./studentinfo.css";

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

    return (
      <div className="form-container">
        <h2>Student Information Form</h2>
        {message && <p className="message success">{message}</p>}

        <form onSubmit={handleSubmit} className="student-form">
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
            <div className="form-group" key={name}>
              <label htmlFor={name}>{label}:</label>
              <input
                type={type}
                id={name}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={`Enter ${label}`}
                required={required}
              />
            </div>
          ))}

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

          {/* Subjects Selection */}
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
                    ❌
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addSubjectField} className="add-btn">
              ➕ Add Subject
            </button>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-button">
            🚀 Submit
          </button>
        </form>
      </div>
    );
  };

  export default StudentForm;
