import React, { useState } from "react";
import "./paymentform.css";

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
    installments: 1,
    subject_name: "",
    collected_by: "",
    bank_name: "", // Added bank_name field
  });

  const [message, setMessage] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);
  const [nameError, setNameError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "student_id") {
      fetchStudentDetails(value);
    }
  };

  const handleDownloadReceipt = (studentId) => {
    const receiptUrl = `http://localhost:5000/generateReceipt?student_id=${studentId}`;
    const link = document.createElement("a");
    link.href = receiptUrl;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchStudentDetails = async (studentId) => {
    if (!studentId) {
      setStudentDetails(null);
      setNameError("Please enter a valid Student ID.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/studentfeesdetails/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setStudentDetails({
          name: data.name,
          student_id: data.student_id,
          email: data.email,
          total_amt: data.total_amount,
          remaining_amt: data.remaining_amt,
        });
        setFormData((prev) => ({
          ...prev,
          total_amt: data.total_amount,
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
  
    if (!formData.student_id) {
      setMessage("Please enter a valid student ID.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:3001/paymentinfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          student_id: studentDetails?.student_id || "",
          name: studentDetails?.name || "Unknown",
          installments: formData.installments || 1,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setMessage(`Payment saved! Receipt Number: ${data.receiptNumber}`);
  
        // Attempt to generate and download receipt using receipt_number
        const receiptResponse = await fetch(
          `http://localhost:3001/generateReceipt?receipt_number=${data.receiptNumber}`
        );
  
        if (receiptResponse.ok) {
          const blob = await receiptResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${data.receiptNumber}.pdf`; // Updated file name
          a.click();
  
          setMessage(`Receipt downloaded! Receipt Number: ${data.receiptNumber}`);
        } else {
          const errorData = await receiptResponse.json();
          console.error("Receipt generation error:", errorData.error);
          setMessage("Payment saved but failed to generate the receipt.");
        }
      } else {
        setMessage(data.error || "Failed to save payment.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setMessage("An error occurred while submitting the form.");
    }
  };
  

  return (
    <div className="form-container">
      <h2>Student Payment Form</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label htmlFor="student_id">Student Name:</label>
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
              <p><strong>Student ID:</strong> {studentDetails.student_id}</p>
              <p><strong>Email:</strong> {studentDetails.email}</p>
              <p><strong>Total Amount:</strong> {studentDetails.total_amt}</p>
              <p><strong>Remaining Amount:</strong> {studentDetails.remaining_amt}</p>
            </div>
          )}
          {nameError && <p className="error-message">{nameError}</p>}
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
          <label htmlFor="subject_name">Select Subject Category:</label>
          <select
            id="subject_name"
            name="subject_name"
            value={formData.subject_name}
            onChange={handleChange}
            required
          >
            <option value="">-- Select --</option>
            <option value="Maths_Science">Maths & Science</option>
            <option value="SS">Social Science</option>
            <option value="Gujarati">Gujarati</option>
            <option value="Sanskrit">Sanskrit</option>
          </select>
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
            <label htmlFor="bank_name">Bank Name:</label>
            <input
              type="text"
              id="bank_name"
              name="bank_name"
              value={formData.bank_name || ""}
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
          <label htmlFor="collected_by">Collected By:</label>
          <select
            id="collected_by"
            name="collected_by"
            value={formData.collected_by}
            onChange={handleChange}
            required
          >
            <option value="">-- Select --</option>
            <option value="Jimesh Gandhi">Jimesh Gandhi</option>
            <option value="Preeti Gandhi">Preeti Gandhi</option>
          </select>
        </div>

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

        <button type="submit" className="submit-button">Submit</button>
      </form>
    </div>
  );
};

export default PaymentForm;
