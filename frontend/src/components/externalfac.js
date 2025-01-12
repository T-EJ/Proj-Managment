import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./externalfac.css";

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
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [studentsData, setStudentsData] = useState([]); // State for storing students data
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const navigate = useNavigate();

  // Fetch available subjects for dropdown
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:3001/subjects");
        if (response.ok) {
          const subjects = await response.json();
          setSubjectOptions(subjects);
        } else {
          console.error("Failed to fetch subjects.");
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setIsLoading(false);
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
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    console.log("Faculty ID:", facultyId); // Debugging line
    console.log("Faculty Subject:", facultySubject); // Debugging line
  
    if (!facultyId || !facultySubject) {
      alert("Invalid faculty ID or subject.");
      return;
    }
  
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:3001/view-students/${facultyId}`
      );
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch student data.");
      }
  
      const students = await response.json();
      setStudentsData(students); // Update the studentsData state
    } catch (error) {
      console.error("Error fetching students:", error);
      alert(`Error fetching students: ${error.message}`);
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="faculty-form-container">
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
          Add Faculty
        </button>
        <button type="button" onClick={fetchFacultyData} className="view-button">
          View Faculty
        </button>
      </form>

      {isLoading && <p>Loading...</p>}

      <h3 className="table-title">Faculty Data</h3>
      {facultyData.length > 0 ? (
        <table className="faculty-table">
          <thead>
            <tr>
              <th>Faculty Name</th>
              <th>Faculty Subject</th>
              <th>Student Count</th>
              <th>Total Fees</th>
              <th>Payable Fees</th>
              <th>Paid Amount</th>
              <th>Remaining Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {facultyData.map((data, index) => (
              <tr key={index}>
                <td>{data.faculty_name}</td>
                <td>{data.faculty_subject}</td>
                <td>{data.student_count}</td>
                <td>{data.total_fees}</td>
                <td>{data.payable_fees}</td>
                <td>{data.paid_amount}</td>
                <td>{data.remaining_amount}</td>
                <td>
                  <button onClick={() => handleUpdate(index)}>Update</button>
                  <button onClick={() => handleDelete(data.id)}>Delete</button>
                  <button onClick={() => viewStudents(data.id, data.faculty_subject)}>
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

      {/* Render students table if data is available */}
      {studentsData.length > 0 && (
        <div>
          <h3>Students for this Faculty</h3>
          <table id="studentTable" border="1">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Subject</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {studentsData.map((student) => (
                <tr key={student.student_id}>
                  <td>{student.student_id}</td>
                  <td>{student.student_name}</td>
                  <td>{student.subject}</td>
                  <td>{student.email}</td>
                  <td>{student.phone_no}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExternalFacultyForm;
