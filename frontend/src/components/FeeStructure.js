import React, { useState, useEffect } from "react";
import "./FeeStructure.css";

const FeeStructure = () => {
  const [feeData, setFeeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFeeStructure();
  }, []);

  const fetchFeeStructure = async () => {
    try {
      const response = await fetch("http://localhost:3001/feestructure");
      if (response.ok) {
        const data = await response.json();
        setFeeData(data);
        setLoading(false);
      } else {
        setError("Failed to fetch fee structure data.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching fee structure:", error);
      setError("An error occurred while fetching data.");
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="loading">Loading...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="fee-structure-container">
      <h2 className="fee-structure-title">Fee Structure</h2>
      <table className="fee-structure-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Standard</th>
            <th>Maths & Science</th>
            <th>Eng & SS</th>
            <th>Hindi</th>
            <th>Gujarati</th>
            <th>Sanskrit</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {feeData.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.Standard}</td>
              <td>{row.Maths_Science}</td>
              <td>{row.Eng_SS}</td>
              <td>{row.Hindi}</td>
              <td>{row.Gujrati}</td>
              <td>{row.Sanskrit}</td>
              <td>{row.Total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeeStructure;
