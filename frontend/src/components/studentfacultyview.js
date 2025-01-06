import React, { useState, useEffect } from "react";
import './studentfacultyview.css';  // Ensure the correct path to the CSS file.

const StudentFacultyView = () => {
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [studentData, setStudentData] = useState([]);

  // Fetch faculty data
  useEffect(() => {
    const fetchFacultyOptions = async () => {
      try {
        const response = await fetch("http://localhost:3001/get-faculty");
        if (response.ok) {
          const faculty = await response.json();
          setFacultyOptions(faculty);
        } else {
          alert("Failed to fetch faculty data.");
        }
      } catch (error) {
        console.error("Error fetching faculty data:", error);
        alert("An error occurred while fetching faculty data.");
      }
    };

    fetchFacultyOptions();
  }, []);

  // Fetch subject data based on selected faculty
  useEffect(() => {
    const fetchSubjectOptions = async () => {
      if (!selectedFaculty) {
        setSubjectOptions([]);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/get-subjects/${selectedFaculty}`);
        if (response.ok) {
          const subjects = await response.json();
          setSubjectOptions(subjects);
        } else {
          alert("Failed to fetch subjects data.");
        }
      } catch (error) {
        console.error("Error fetching subjects data:", error);
        alert("An error occurred while fetching subjects data.");
      }
    };

    fetchSubjectOptions();
  }, [selectedFaculty]);

  const handleFacultyChange = (e) => {
    setSelectedFaculty(e.target.value);
    setSelectedSubject("");
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  // Fetch student data based on selected faculty and subject
  const fetchStudentData = async () => {
    if (!selectedFaculty || !selectedSubject) {
      alert("Please select a faculty and a subject.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/get-students/${selectedFaculty}/${selectedSubject}`);
      if (response.ok) {
        const students = await response.json();
        if (!students || students.length === 0) {
          alert("No students found for the selected faculty and subject.");
          setStudentData([]);
          return;
        }
        setStudentData(students);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to fetch student data.");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      alert("An error occurred while fetching student data.");
    }
  };

  return (
    <div className="student-faculty-view-container">
      <h2 className="form-title">View Students by Faculty</h2>
      <form className="faculty-form">
        <label>
          Select Faculty:
          <select value={selectedFaculty} onChange={handleFacultyChange} required>
            <option value="">Select Faculty</option>
            {facultyOptions.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.faculty_name} - {faculty.id}
              </option>
            ))}
          </select>
        </label>

        <label>
          Select Subject:
          <select value={selectedSubject} onChange={handleSubjectChange} required>
            <option value="">Select Subject</option>
            {subjectOptions.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.subject_name} - {subject.id}
              </option>
            ))}
          </select>
        </label>

        <button type="button" onClick={fetchStudentData} className="fetch-button">
          Fetch Students
        </button>
      </form>

      <h3 className="table-title">Student Data</h3>
      {studentData.length > 0 ? (
        <table className="student-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Remaining Amount</th>
            </tr>
          </thead>
          <tbody>
            {studentData.map((student, index) => (
              <tr key={index}>
                <td>{student.student_name}</td>
                <td>{student.remaining_amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No student data available.</p>
      )}
    </div>
  );
};

export default StudentFacultyView;
