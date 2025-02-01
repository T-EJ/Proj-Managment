import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


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
      const response = await fetch("http://localhost:3001/delete-faculty/${id}", {
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
      "  http://localhost:3001/view-students/${facultyId}"
      );
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch student data.");
      }
  
      const students = await response.json();
      setStudentsData(students); // Update the studentsData state
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Error fetching students: ${error.message}");
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
                <td class="action-buttons">
                  <button onClick={() => handleUpdate(index)} class="update-button">Update</button>
                  <button onClick={() => handleDelete(data.id)} class="delete-button">Delete</button>
                 

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
    <style>{`
  /* General Reset */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', sans-serif; /* Modern font */
    line-height: 1.6;
    background: #f5f7fa;
    color: #34495e;
  }

  /* Faculty Form Container */
  .faculty-form-container {
    max-width: 1200px;
    margin: 40px auto;
    padding: 40px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease-in-out;
  }
  .faculty-form-container:hover {
    transform: translateY(-4px);
  }

  /* Form Title */
  .form-title {
    text-align: center;
    font-size: 32px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 30px;
    position: relative;
  }
  .form-title::after {
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background: #3498db;
    margin: 10px auto 0;
    border-radius: 4px;
  }

  /* Faculty Form */
  .faculty-form {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-bottom: 40px;
  }

  /* Labels */
  .faculty-form label {
    font-weight: 600;
    color: #34495e;
    margin-bottom: 8px;
    display: block;
    font-size: 14px;
  }

  /* Inputs and Selects */
  .faculty-form input,
  .faculty-form select {
    width: 100%;
    padding: 14px;
    border-radius: 10px;
    border: 2px solid #ddd;
    font-size: 16px;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .faculty-form input:focus,
  .faculty-form select:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 12px rgba(52, 152, 219, 0.3);
  }

  /* Buttons */
  .submit-button,
  .view-button {
    grid-column: span 1;
    padding: 24px;
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    background: linear-gradient(135deg, #3498db, #2980b9);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
    box-shadow: 0 6px 12px rgba(52, 152, 219, 0.2);
  }
  .submit-button:hover,
  .view-button:hover {
    background: linear-gradient(135deg, #2980b9, #1a5276);
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(52, 152, 219, 0.3);
  }
  .submit-button:active,
  .view-button:active {
    transform: translateY(0);
    box-shadow: 0 4px 8px rgba(52, 152, 219, 0.2);
  }

  /* Table Title */
  .table-title {
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin-top: 40px;
    margin-bottom: 20px;
    position: relative;
  }
  .table-title::after {
    content: '';
    display: block;
    width: 100px;
    height: 5px;
    background: #3498db;
    margin: 10px auto 0;
    border-radius: 5px;
  }

  /* Faculty Table */
  .faculty-table {
    width: 100%;
    margin-top: 20px;
    border-collapse: collapse;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  .faculty-table th,
  .faculty-table td {
    padding: 18px;
    text-align: left;
    border-bottom: 1px solid #ecf0f1;
  }
  .faculty-table th {
    background: #3498db;
    color: #ffffff;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .faculty-table td {
    color: #34495e;
    font-size: 15px;
  }
  .faculty-table tr:hover {
    background: #f9f9f9;
  }

  /* Container for Action Buttons */
.faculty-table .action-buttons {
  display: flex;
  gap: 10px; /* Space between buttons */
  justify-content: center; /* Center buttons horizontally */
}

/* Individual Button Styles */
.faculty-table button {
  padding: 6px 20px;
  font-size: 14px;
  color: #ffffff;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 8px rgba(231, 76, 60, 0.2);
}

/* Hover Effects for Buttons */
.faculty-table button:hover {
  background: linear-gradient(135deg, #c0392b, #a52d1e);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(231, 76, 60, 0.3);
}

.faculty-table button:active {
  transform: translateY(0);
  box-shadow: 0 4px 8px rgba(231, 76, 60, 0.2);
}

  /* Loading Spinner */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .loading-spinner {
    border: 6px solid rgba(52, 152, 219, 0.3);
    border-top: 6px solid #3498db;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin: 40px auto;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .faculty-form {
      grid-template-columns: 1fr;
    }
    .submit-button,
    .view-button {
      grid-column: span 1;
    }
    .faculty-form input,
    .faculty-form select {
      padding: 12px;
      font-size: 14px;
    }
    .table-title {
      font-size: 24px;
    }
    .faculty-table th,
    .faculty-table td {
      padding: 14px;
      font-size: 14px;
    }
  }
`}</style>
    </div>
  );
};

export default ExternalFacultyForm;