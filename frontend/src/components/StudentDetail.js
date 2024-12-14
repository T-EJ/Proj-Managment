import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const StudentDetail = () => {
    const { id } = useParams();
    const [student, setStudent] = useState(null);

    useEffect(() => {
        axios.get(`/api/students/${id}/`)
            .then(response => {
                setStudent(response.data);
            })
            .catch(error => {
                console.error('Error fetching student detail:', error);
            });
    }, [id]);

    if (!student) return <div>Loading...</div>;

    return (
        <div>
            <h1>{student.name}</h1>
            <p>Phone: {student.phone_no}</p>
            <p>Email: {student.email}</p>
            <p>School: {student.school_name}</p>
            <p>Board: {student.board}</p>
            <p>Standard: {student.standard_name}</p>
            <p>Medium: {student.medium}</p>
            <p>Fees Paid: {student.paid_amount}</p>
            <p>Remaining Fees: {student.remaining_amount}</p>
        </div>
    );
};

export default StudentDetail;
