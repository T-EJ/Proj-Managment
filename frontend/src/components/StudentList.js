import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const StudentList = () => {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        axios.get('/api/students/')
            .then(response => {
                setStudents(response.data);
            })
            .catch(error => {
                console.error('Error fetching student list:', error);
            });
    }, []);

    return (
        <div>
            <h1>Students</h1>
            <ul>
                {students.map(student => (
                    <li key={student.id}>
                        <Link to={`/students/${student.id}`}>{student.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StudentList;
