import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const StudentListPage = () => {
  const { subjectId } = useParams(); // Extract subjectId from URL
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!subjectId) {
        setError('Subject ID is missing.');
        setLoading(false);
        return;
      }

      console.log(`Fetching students for Subject ID: ${subjectId}`);
      try {
        const response = await fetch(`http://localhost:3001/fetch-students/${subjectId}`);
        console.log('Response Status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched Data:', data);

          if (data.length === 0) {
            setError('No students found for this subject.');
          } else {
            setStudents(data);
          }
        } else {
          setError('Failed to fetch students.');
        }
      } catch (error) {
        setError('An error occurred while fetching students.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [subjectId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Student List</h2>
      {students.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Student Fees</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.fee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No students found for this subject.</p>
      )}
    </div>
  );
};

export default StudentListPage;
