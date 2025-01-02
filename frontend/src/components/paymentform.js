import React, { useState } from "react";

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    student_id: "",
    total_amt: "",
    remaining_amt: "",
    amt_paid: "",
    payment_mode: "Cash",
    cheque_no: "",
    trans_id: "",
    date: "",
  });

  const [message, setMessage] = useState("");
  const [studentName, setStudentName] = useState("");
  const [nameError, setNameError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "student_id") {
      fetchStudentName(value);
    }
  };

  const fetchStudentName = async (studentId) => {
    if (!studentId) {
      setStudentName("");
      setNameError("Please enter a valid Student ID.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/student-details/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setStudentName(data.name); // Assuming the backend returns `name`
        setNameError("");
      } else if (response.status === 404) {
        setStudentName("");
        setNameError("Student not found. Please check the Student ID.");
      } else {
        setStudentName("");
        setNameError("Failed to fetch student name.");
      }
    } catch (error) {
      console.error("Error fetching student name:", error);
      setStudentName("");
      setNameError("An error occurred while fetching student name.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:3001/paymentinfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      if (response.ok) {
        setMessage("Payment information saved successfully!");
  
        // Generate and download receipt
        const receiptResponse = await fetch(
          `http://localhost:3001/generateReceipt?student_id=${formData.student_id}`
        );
  
        if (receiptResponse.ok) {
          console.log('Receipt generated successfully.');
          const blob = await receiptResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Receipt_${formData.student_id}.pdf`;
          a.click();
          setMessage("Receipt downloaded successfully!");
        } else {
          console.log('Failed to generate the receipt:', receiptResponse.statusText);
          setMessage("Failed to generate the receipt.");
        }
      } else {
        setMessage(data.error || "Failed to save payment information.");
      }
    } catch (error) {
      console.error("Error submitting payment form:", error);
      setMessage("An error occurred while submitting the form.");
    }
  };

  return (
    <div className="form-container">
      <h2>Student Payment Form</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label htmlFor="student_id">Student ID:</label>
          <input
            type="text"
            id="student_id"
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            required
          />
          {studentName && <p><strong>Student Name:</strong> {studentName}</p>}
          {nameError && <p className="error-message">{nameError}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="total_amt">Total Amount:</label>
          <input
            type="number"
            id="total_amt"
            name="total_amt"
            value={formData.total_amt}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="remaining_amt">Remaining Amount:</label>
          <input
            type="number"
            id="remaining_amt"
            name="remaining_amt"
            value={formData.remaining_amt}
            onChange={handleChange}
            required
          />
        </div> 
        <div className="form-group">
          <label htmlFor="amt_paid">Amount Paid:</label>
          <input
            type="number"
            id="amt_paid"
            name="amt_paid"
            value={formData.amt_paid}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="payment_mode">Payment Mode:</label>
          <select
            id="payment_mode"
            name="payment_mode"
            value={formData.payment_mode}
            onChange={handleChange}
          >
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="Online">Online</option>
          </select>
        </div>
        {formData.payment_mode === "Cheque" && (
          <div className="form-group">
            <label htmlFor="cheque_no">Cheque Number:</label>
            <input
              type="text"
              id="cheque_no"
              name="cheque_no"
              value={formData.cheque_no}
              onChange={handleChange}
            />
          </div>
        )}
        {formData.payment_mode === "Online" && (
          <div className="form-group">
            <label htmlFor="trans_id">Transaction ID:</label>
            <input
              type="text"
              id="trans_id"
              name="trans_id"
              value={formData.trans_id}
              onChange={handleChange}
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
