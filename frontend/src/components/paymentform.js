import React, { useState } from "react";


const PaymentForm = () => {
  const [formData, setFormData] = useState({
    student_id: "",
    total_amt: "",
    remaining_amt: "",
    amt_paid: "",
    payment_mode: "Cash", // Default mode
    cheque_no: "",
    trans_id: "",
    date: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        setMessage(data.message || "Payment information saved successfully!");
        setFormData({
          student_id: "",
          total_amt: "",
          remaining_amt: "",
          amt_paid: "",
          payment_mode: "Cash",
          cheque_no: "",
          trans_id: "",
          date: "",
        });
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