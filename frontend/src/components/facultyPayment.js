import React, { useState } from "react";
import "./paymentform.css";

const FacultyPaymentForm = () => {
  const [formData, setFormData] = useState({
    faculty_name: "",
    paid_amount: "",
    remaining_amount: "",
    payment_date: "",
    bank_name: "",
    payment_type: "",
    upi_id: "",
    cheque_no: "", // Added cheque_no
  });

  const [message, setMessage] = useState("");
  const [facultyDetails, setFacultyDetails] = useState(null);
  const [nameError, setNameError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "faculty_name") {
      fetchFacultyDetails(value);
    }
  };

  const fetchFacultyDetails = async (facultyName) => {
    if (!facultyName) {
      setFacultyDetails(null);
      setNameError("Please enter a valid Faculty Name.");
      return;
    }

    setLoading(true); // Start loading
    try {
      const response = await fetch(`http://localhost:3001/faculty-details?faculty_name=${facultyName}`);
      console.log("Fetching faculty details for:", facultyName); // Log the faculty name being fetched
      console.log("Response status:", response.status); // Log the response status

      if (response.ok) {
        const data = await response.json();
        console.log("Faculty details fetched:", data); // Log the fetched faculty details
        setFacultyDetails({
          id: data.id,
          faculty_name: data.faculty_name,
          remaining_amount: data.remaining_amount,
        });
        setFormData((prev) => ({
          ...prev,
          remaining_amount: data.remaining_amount,
        }));
        setNameError("");
      } else if (response.status === 404) {
        setFacultyDetails(null);
        setNameError("Faculty not found. Please check the Faculty Name.");
        console.error("Faculty not found for:", facultyName); // Log 404 error
      } else {
        setFacultyDetails(null);
        setNameError("Failed to fetch faculty details.");
        console.error("Failed to fetch faculty details for:", facultyName); // Log other errors
      }
    } catch (error) {
      console.error("Error fetching faculty details:", error); // Log fetch or network errors
      setFacultyDetails(null);
      setNameError("An error occurred while fetching faculty details.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData); // Log the form data being submitted

    if (!formData.faculty_name || !formData.paid_amount || !formData.payment_date || !formData.payment_type) {
      setMessage("Please fill in all required fields.");
      return;
    }

    setSubmitting(true); // Start submitting
    try {
      const response = await fetch("http://localhost:3001/faculty-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status); // Log the response status
      const data = await response.json();
      console.log("Response data:", data); // Log the response data

      if (response.ok) {
        setMessage(data.message);

        if (data.newRemainingAmt !== undefined) {
          setFormData((prev) => ({
            ...prev,
            remaining_amount: data.newRemainingAmt,
          }));
        }
      } else {
        setMessage(data.error || "Failed to save payment.");
        console.error("Error response from backend:", data.error); // Log backend error
      }
    } catch (error) {
      console.error("Submit error:", error); // Log any fetch or network errors
      setMessage("An error occurred while submitting the form.");
    } finally {
      setSubmitting(false); // Stop submitting
    }
  };

  return (
    <div className="form-container">
      <h2>Faculty Payment Form</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label htmlFor="faculty_name">Faculty Name:</label>
          <input
            type="text"
            id="faculty_name"
            name="faculty_name"
            value={formData.faculty_name}
            onChange={handleChange}
            required
            disabled={loading || submitting} // Disable input while loading or submitting
          />
          {facultyDetails && (
            <div>
              <p><strong>Faculty Name:</strong> {facultyDetails.faculty_name}</p>
              <p><strong>Remaining Amount:</strong> {facultyDetails.remaining_amount}</p>
            </div>
          )}
          {nameError && <p className="error-message">{nameError}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="paid_amount">Paid Amount:</label>
          <input
            type="number"
            id="paid_amount"
            name="paid_amount"
            value={formData.paid_amount}
            onChange={handleChange}
            required
            disabled={submitting} // Disable input while submitting
          />
        </div>

        <div className="form-group">
          <label htmlFor="remaining_amount">Remaining Amount:</label>
          <input
            type="number"
            id="remaining_amount"
            name="remaining_amount"
            value={formData.remaining_amount}
            readOnly
          />
        </div>

        <div className="form-group">
          <label htmlFor="payment_date">Payment Date:</label>
          <input
            type="date"
            id="payment_date"
            name="payment_date"
            value={formData.payment_date}
            onChange={handleChange}
            required
            disabled={submitting} // Disable input while submitting
          />
        </div>

        <div className="form-group">
          <label htmlFor="payment_type">Payment Type:</label>
          <select
            id="payment_type"
            name="payment_type"
            value={formData.payment_type}
            onChange={handleChange}
            required
            disabled={submitting} // Disable input while submitting
          >
            <option value="">Select Payment Type</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="UPI">UPI</option>
          </select>
        </div>

        {formData.payment_type === "Cheque" && (
          <div>
            <div className="form-group">
              <label htmlFor="bank_name">Bank Name:</label>
              <input
                type="text"
                id="bank_name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                required
                disabled={submitting} // Disable input while submitting
              />
            </div>
            <div className="form-group">
              <label htmlFor="cheque_no">Cheque Number:</label>
              <input
                type="text"
                id="cheque_no"
                name="cheque_no"
                value={formData.cheque_no || ""} // Ensure cheque_no is handled in formData
                onChange={handleChange}
                required
                disabled={submitting} // Disable input while submitting
              />
            </div>
          </div>
        )}

        {formData.payment_type === "UPI" && (
          <div className="form-group">
            <label htmlFor="upi_id">UPI ID:</label>
            <input
              type="text"
              id="upi_id"
              name="upi_id"
              value={formData.upi_id}
              onChange={handleChange}
              required
              disabled={submitting} // Disable input while submitting
            />
          </div>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={submitting} // Disable button while submitting
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default FacultyPaymentForm;
