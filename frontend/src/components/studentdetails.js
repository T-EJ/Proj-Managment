import React, { useState } from "react";
import './FetchStudentDetails.css';


const FetchStudentDetails = () => {
  const [studentId, setStudentId] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);
  const [error, setError] = useState("");

  const fetchDetails = async () => {
    if (!studentId) {
      setError("Please enter a Student ID.");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3001/student-details/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setStudentDetails(data);
        setError("");
      } else if (response.status === 404) {
        setError("Student not found. Please check the Student ID.");
        setStudentDetails(null);
      } else {
        setError("Failed to fetch student details. Please try again later.");
        setStudentDetails(null);
      }
    } catch (err) {
      console.error("Error fetching student details:", err);
      setError("An error occurred while fetching student details.");
      setStudentDetails(null);
    }
  };

  return (
    <div className="student-details-container">
      <h2>Fetch Student Details</h2>
      <div className="form-group">
        <label htmlFor="student_id">Student ID:</label>
        <input
          type="text"
          id="student_id"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Enter Student ID"
        />
        <button onClick={fetchDetails}>Fetch Details</button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {studentDetails && (
        <div className="student-details">
          <h3>Student Information</h3>
          <p><strong>Name:</strong> {studentDetails.name}</p>
          <p><strong>Phone:</strong> {studentDetails.phone_no}</p>
          <p><strong>Email:</strong> {studentDetails.email}</p>
          <p><strong>School:</strong> {studentDetails.school_name}</p>
          <p><strong>Board:</strong> {studentDetails.board}</p>
          <p><strong>Standard:</strong> {studentDetails.standard_id}</p>
          <p><strong>Medium:</strong> {studentDetails.medium}</p>

          <h3>Payment Information</h3>
          <p><strong>Total Amount:</strong> {studentDetails.total_amt}</p>
          <p><strong>Remaining Amount:</strong> {studentDetails.remaining_amt}</p>
          <p><strong>Amount Paid:</strong> {studentDetails.amt_paid}</p>
          <p><strong>Payment Mode:</strong> {studentDetails.payment_mode}</p>
          {studentDetails.payment_mode === "Cheque" && (
            <p><strong>Cheque Number:</strong> {studentDetails.cheque_no}</p>
          )}
          {studentDetails.payment_mode === "Online" && (
            <p><strong>Transaction ID:</strong> {studentDetails.trans_id}</p>
          )}
          <p><strong>Payment Date:</strong> {studentDetails.date}</p>
        </div>
      )}
    </div>
  );
};

export default FetchStudentDetails;
