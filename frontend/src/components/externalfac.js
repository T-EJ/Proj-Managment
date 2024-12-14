import React, { useState } from "react";
import "./externalfac.css"; // Add CSS file reference

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const fetchStudentCount = async () => {
    if (!subjectId) {
      alert("Please enter a subject ID to fetch student count.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/student-count/${subjectId}`);
      if (response.ok) {
        const { count } = await response.json();
        setFormData({ ...formData, student_count: count });
        alert(`Student count fetched successfully: ${count}`);
      } else {
        alert("Failed to fetch student count.");
      }
    } catch (error) {
      console.error("Error fetching student count:", error);
      alert("An error occurred while fetching the student count.");
    }
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

  const viewStudents = async (subjectId) => {
    try {
      const response = await fetch(`http://localhost:3001/view-students/${subjectId}`);
      if (response.ok) {
        const students = await response.json();
        alert(`Students for subject ${subjectId}: ${JSON.stringify(students)}`);
      } else {
        alert("Failed to fetch students.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while fetching students.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
          <input
            type="text"
            name="faculty_subject"
            value={formData.faculty_subject}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Subject ID for Student Count:
          <input
            type="text"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            placeholder="Enter Subject ID"
          />
          <button type="button" onClick={fetchStudentCount} className="fetch-button">
            Fetch Student Count
          </button>
        </label>
        <label>
          Student Count:
          <input
            type="number"
            name="student_count"
            value={formData.student_count}
            onChange={handleInputChange}
            readOnly
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
                  <button onClick={() => viewStudents(data.faculty_subject)}>
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
  );
};

export default ExternalFacultyForm;
