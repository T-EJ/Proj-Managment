import React, { useState, useEffect } from "react";
import "./studentinfo.css"; // Ensure this CSS file is in the same directory

const StudentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone_no: "",
    email: "",
    school_name: "",
    board: "",
    standard_id: "",
    subject_id: "",
    medium: "",
    discount: 0.0,
    total_fees: "",
    shift: "Morning",
    reference: "",
    paid_amount: 0.0,
    remaining_amount: "",
    fees_date: "",
    due_date: "",
    payment_mode: "Cash",
    academic_year: "",
  });

  const [standards, setStandards] = useState([]); // State to store standards
  const [subjects, setSubjects] = useState([]);   // State to store subjects
  const [message, setMessage] = useState("");      // State for success or error message

  // Fetch standards and subjects data when the component mounts
  useEffect(() => {
    const fetchStandards = async () => {
      const response = await fetch("http://localhost:3001/standards");
      const data = await response.json();
      setStandards(data);  // Update state with fetched standards
    };

    const fetchSubjects = async () => {
      const response = await fetch("http://localhost:3001/subjects");
      const data = await response.json();
      setSubjects(data);  // Update state with fetched subjects
    };

    fetchStandards();
    fetchSubjects();
  }, []);

  // Calculate remaining amount whenever discount or total fees change
  useEffect(() => {
    const calculateRemainingAmount = () => {
      const discount = parseFloat(formData.discount) || 0;
      const totalFees = parseFloat(formData.total_fees) || 0;
      const remaining = totalFees - (totalFees * (discount / 100));
      setFormData((prevState) => ({
        ...prevState,
        remaining_amount: remaining.toFixed(2),
      }));
    };

    calculateRemainingAmount();
  }, [formData.discount, formData.total_fees]);

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/studentinfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.text();
      if (response.ok) {
        setMessage("Student data submitted successfully!");
        setFormData({
          name: "",
          phone_no: "",
          email: "",
          school_name: "",
          board: "",
          standard_id: "",
          subject_id: "",
          medium: "",
          discount: 0.0,
          total_fees: "",
          shift: "Morning",
          reference: "",
          paid_amount: 0.0,
          remaining_amount: "",
          fees_date: "",
          due_date: "",
          payment_mode: "Cash",
          academic_year: "",
        });
      } else {
        setMessage(`Error: ${data}`);
      }
    } catch (error) {
      setMessage("Failed to submit data. Please try again.");
    }
  };

  return (
    
    <div className="form-container">
      <h2>Student Information Form</h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit} className="student-form">
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label htmlFor="phone_no">Phone Number:</label>
          <input
            type="text"
            id="phone_no"
            name="phone_no"
            value={formData.phone_no}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* School Name */}
        <div className="form-group">
          <label htmlFor="school_name">School Name:</label>
          <input
            type="text"
            id="school_name"
            name="school_name"
            value={formData.school_name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Board */}
        <div className="form-group">
          <label htmlFor="board">Board:</label>
          <input
            type="text"
            id="board"
            name="board"
            value={formData.board}
            onChange={handleChange}
            required
          />
        </div>

        {/* Standard ID (Dropdown) */}
        <div className="form-group">
          <label htmlFor="standard_id">Standard:</label>
          <select
            id="standard_id"
            name="standard_id"
            value={formData.standard_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Standard</option>
            {standards.map((standard) => (
              <option key={standard.id} value={standard.id}>
                {standard.standard_name}
              </option>
            ))}
          </select>
        </div>

        {/* Subject ID (Dropdown) */}
        <div className="form-group">
          <label htmlFor="subject_id">Subject:</label>
          <select
            id="subject_id"
            name="subject_id"
            value={formData.subject_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.subject_name}
              </option>
            ))}
          </select>
        </div>

        {/* Medium */}
        <div className="form-group">
          <label htmlFor="medium">Medium:</label>
          <input
            type="text"
            id="medium"
            name="medium"
            value={formData.medium}
            onChange={handleChange}
            required
          />
        </div>

        {/* Discount */}
        <div className="form-group">
          <label htmlFor="discount">Discount:</label>
          <input
            type="number"
            id="discount"
            name="discount"
            value={formData.discount}
            onChange={handleChange}
            step="0.01"
          />
        </div>

        {/* Total Fees */}
        <div className="form-group">
          <label htmlFor="total_fees">Total Fees:</label>
          <input
            type="number"
            id="total_fees"
            name="total_fees"
            value={formData.total_fees}
            onChange={handleChange}
            required
          />
        </div>

        {/* Remaining Amount */}
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

        {/* Fees Date */}
{/* Fees Date */}
<div className="form-group">
          <label htmlFor="fees_date">Fees Date:</label>
          <input
            type="date"
            id="fees_date"
            name="fees_date"
            value={formData.fees_date}
            onChange={handleChange}
            required
          />
        </div>

        {/* Due Date */}
        <div className="form-group">
          <label htmlFor="due_date">Due Date:</label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            required
          />
        </div>

        {/* Payment Mode */}
        <div className="form-group">
          <label htmlFor="payment_mode">Payment Mode:</label>
          <select
            id="payment_mode"
            name="payment_mode"
            value={formData.payment_mode}
            onChange={handleChange}
          >
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
          </select>
        </div>

        {/* Academic Year */}
        <div className="form-group">
          <label htmlFor="academic_year">Academic Year:</label>
          <input
            type="text"
            id="academic_year"
            name="academic_year"
            value={formData.academic_year}
            onChange={handleChange}
            required
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default StudentForm;