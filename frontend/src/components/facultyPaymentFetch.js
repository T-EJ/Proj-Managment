import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const FacultyPaymentDetail = () => {
    const { id } = useParams(); // Assuming `id` is the faculty ID
    const [faculty, setFaculty] = useState(null);
    const [facultyDetails, setFacultyDetails] = useState(null); // Added state for faculty details
    const [nameError, setNameError] = useState(""); // Added state for name error
    const [formData, setFormData] = useState({}); // Added state for form data

    useEffect(() => {
        axios.get(`/api/externalfaculty/${id}/`) // Adjust the endpoint as per your backend API
            .then(response => {
                setFaculty(response.data);
            })
            .catch(error => {
                console.error('Error fetching faculty payment details:', error);
            });
    }, [id]);

    const fetchFacultyDetails = async (facultyName) => {
        if (!facultyName) {
            setFacultyDetails(null);
            setNameError("Please enter a valid Faculty Name.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/faculty-details?faculty_name=${facultyName}`);
            if (response.ok) {
                const data = await response.json();
                console.log("Fetched Faculty Details:", data); // Debug log
                setFacultyDetails({
                    id: data.id,
                    faculty_name: data.faculty_name,
                    remaining_amount: data.remaining_amount,
                });
                setFormData((prev) => ({
                    ...prev,
                    id: data.id, // Set the ID in formData
                    remaining_amount: data.remaining_amount,
                }));
                setNameError("");
            } else if (response.status === 404) {
                setFacultyDetails(null);
                setNameError("Faculty not found. Please check the Faculty Name.");
            } else {
                setFacultyDetails(null);
                setNameError("Failed to fetch faculty details.");
            }
        } catch (error) {
            console.error("Error fetching faculty details:", error);
            setFacultyDetails(null);
            setNameError("An error occurred while fetching faculty details.");
        }
    };

    if (!faculty) return <div>Loading...</div>;

    return (
        <div>
            <h1>{faculty.faculty_name}</h1>
            <p>Subject: {faculty.faculty_subject}</p>
            <p>Student Count: {faculty.student_count}</p>
            <p>Total Fees: {faculty.total_fees}</p>
            <p>Payable Fees: {faculty.payable_fees}</p>
            <p>Paid Amount: {faculty.paid_amount}</p>
            <p>Remaining Amount: {faculty.remaining_amount}</p>
            {nameError && <p className="error-message">{nameError}</p>}
        </div>
    );
};

export default FacultyPaymentDetail;
