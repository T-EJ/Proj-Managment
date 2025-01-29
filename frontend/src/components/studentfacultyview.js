import React, { useState, useEffect } from "react";
import './studentfacultyview.css';

const StudentFacultyView = () => {
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");  // subject should be the ID, not the name
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
        setSelectedSubject(""); // Reset selected subject if no faculty selected
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
  }, [selectedFaculty]);  // Only run when selectedFaculty changes

  const handleFacultyChange = (e) => {
    setSelectedFaculty(e.target.value);
    setSelectedSubject("");  // Reset selected subject when faculty changes
  };

  const handleSubjectChange = (e) => {
    // Use the subject's ID as the selected value
    const subjectId = e.target.value; 
    setSelectedSubject(subjectId);  // This now holds the subject ID
  };
  // Fetch student data based on selected faculty and subject
  const fetchStudentData = async () => {
    if (!selectedFaculty || !selectedSubject) {
      alert("Please select a faculty and a subject.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/get-students/${selectedFaculty}`);
      if (response.ok) {
        const students = await response.json();
        if (!students || students.length === 0) {
          alert("No students found for the selected faculty and subject.");
          setStudentData([]);
          return;
        }
        setStudentData(students);
        console.log("Fetched Student Data:", students);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to fetch student data.");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      alert("An error occurred while fetching student data.");
    }
  };

  // Calculate Total Values
  const totalStudentCount = studentData.reduce((sum, student) => sum + (student.StudentCount || 0), 0);
  const totalFees = studentData.reduce((sum, student) => sum + (student.TotalFees || 0), 0);
  const totalPayableFees = studentData.reduce((sum, student) => sum + (student.PayableFees || 0), 0);

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
                {subject.subject_name} - {subject.id}  {/* Ensure the ID is passed */}
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
              <th>Sr. No.</th>
              <th>Faculty Name</th>
              <th>Faculty Subject</th>
              <th>Student Count</th>
              <th>Total Fees</th>
              <th>Payable Fees</th>
            </tr>
          </thead>
          <tbody>
            {studentData.map((student, index) => (
              <tr key={index}>
                <td>{index + 1}</td> {/* Serial Number */}
                <td>{student.FacultyName || "N/A"}</td>
                <td>{student.FacultySubject || "N/A"}</td>
                <td>{student.StudentCount || 0}</td>
                <td>{student.TotalFees || 0}</td>
                <td>{student.PayableFees || 0}</td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="total-row">
              <td colSpan="3"><strong>Total</strong></td>
              <td><strong>{totalStudentCount}</strong></td>
              <td><strong>{totalFees}</strong></td>
              <td><strong>{totalPayableFees}</strong></td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>No student data available.</p>
      )}
    </div>
  );
};

export default StudentFacultyView;
