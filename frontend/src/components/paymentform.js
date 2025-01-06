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
    installments: 1,  // Default to 1 installment
  });

  const [message, setMessage] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);
  const [nameError, setNameError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update formData when user changes input fields
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "student_id") {
      fetchStudentDetails(value);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    if (!studentId) {
      setStudentDetails(null);
      setNameError("Please enter a valid Student ID.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/student-details/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setStudentDetails({
          name: data.name,
          total_amt: data.total_amt,
          remaining_amt: data.remaining_amt,
        });
        setFormData((prev) => ({
          ...prev,
          total_amt: data.total_amt,
          remaining_amt: data.remaining_amt,
        }));
        setNameError("");
      } else if (response.status === 404) {
        setStudentDetails(null);
        setNameError("Student not found. Please check the Student ID.");
      } else {
        setStudentDetails(null);
        setNameError("Failed to fetch student details.");
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      setStudentDetails(null);
      setNameError("An error occurred while fetching student details.");
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
          const blob = await receiptResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Receipt_${formData.student_id}.pdf`;
          a.click();
          setMessage("Receipt downloaded successfully!");
        } else {
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
          {studentDetails && (
            <div>
              <p><strong>Student Name:</strong> {studentDetails.name}</p>
              <p><strong>Total Amount:</strong> {studentDetails.total_amt}</p>
              <p><strong>Remaining Amount:</strong> {studentDetails.remaining_amt}</p>
            </div>
          )}
          {nameError && <p className="error-message">{nameError}</p>}
        </div>
        
        {/* Total Amount Input */}
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
          <label htmlFor="amt_paid">Current transaction:</label>
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

        {/* Installments Dropdown */}
        <div className="form-group">
          <label htmlFor="installments">Number of Installments:</label>
          <select
            id="installments"
            name="installments"
            value={formData.installments}
            onChange={handleChange}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} installment(s)
              </option>
            ))}
          </select>
        </div>

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
