import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./StudentAllView.css";

const StudentAllView = () => {
  const [studentData, setStudentData] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [importMessage, setImportMessage] = useState("");

  useEffect(() => {
    fetchStudentData(selectedStandard);
  }, [selectedStandard]);

  const fetchStudentData = async (standard) => {
    setLoading(true);
    setError("");
    setStudentData([]);

    try {
      const url =
        standard === "All"
          ? "http://localhost:3001/studentAllView"
          : `http://localhost:3001/studentAllView?standard=${Number(standard)}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`);

      const data = await response.json();
      setStudentData(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (studentData.length === 0) {
      alert("No data available to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(studentData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "StudentData.xlsx");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) {
      setImportMessage("Please select a file to import.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3001/import-excel", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImportMessage("File imported successfully!");
        fetchStudentData(selectedStandard);
      } else {
        setImportMessage(`Error: ${data.error || "Failed to import file."}`);
      }
    } catch (error) {
      console.error("Error importing file:", error);
      setImportMessage("An error occurred while importing.");
    }
  };

  return (
    <div className="student-view-container">
      <h2>Student Details</h2>
      <label>Select Standard:</label>
      <select value={selectedStandard} onChange={(e) => setSelectedStandard(e.target.value)}>
        {["All", 0, 1, 2, 3, 4, 5, 6, 7].map((std, index) => (
          <option key={index} value={std}>
            {std}
          </option>
        ))}
      </select>

      <button onClick={exportToExcel}>📥 Export to Excel</button>

      <h2>Import Student Data</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <button onClick={handleImport}>Import Excel</button>
      {importMessage && <p>{importMessage}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {studentData.map((student) => (
              <tr key={student.student_id}>
                <td>{student.student_id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentAllView;