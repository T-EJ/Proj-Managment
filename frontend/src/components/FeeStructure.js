import React, { useState, useEffect } from "react";
import "./FeeStructure.css"; // Import your custom CSS file

const FeeStructure = () => {
  const [feeData, setFeeData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [newStandard, setNewStandard] = useState("");
  const [editingCell, setEditingCell] = useState(null); // Track which cell is being edited
  const [editValue, setEditValue] = useState(""); // Track the value being edited

  // Fetch the fee structure from the backend
  const fetchFeeStructure = async () => {
    try {
      const response = await fetch("http://localhost:3001/feestructure");
      const data = await response.json();
      setFeeData(data);

      // Extract subjects (column names) dynamically
      if (data.length > 0) {
        const columns = Object.keys(data[0]);
        const subjectColumns = columns.filter(
          (col) => col !== "id" && col !== "Standard" && col !== "Total"
        );
        setSubjects(subjectColumns);
      }
    } catch (error) {
      console.error("Error fetching fee structure:", error);
    }
  };

  // Fetch data when the component is mounted
  useEffect(() => {
    fetchFeeStructure();
  }, []);

  // Add a new subject
  const handleAddSubject = async () => {
    console.log("Current newSubject value:", newSubject); // Debug log

    if (!newSubject.trim()) {
      alert("Please enter a subject name.");
      return;
    }

    try {
      console.log("Adding subject:", newSubject); // Debug log
      const response = await fetch("http://localhost:3001/feestructure/add-subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject_name: newSubject }),
      });

      if (response.ok) {
        alert("Subject added successfully!");
        setNewSubject(""); // Clear the input field
        fetchFeeStructure(); // Fetch the updated fee structure
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to add subject.");
      }
    } catch (error) {
      console.error("Error adding subject:", error);
      alert("An error occurred while adding the subject.");
    }
  };

  // Add a new standard
  const handleAddStandard = async () => {
    if (!newStandard.trim()) {
      alert("Please enter a standard name.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/feestructure/add-standard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ standard_name: newStandard }),
      });

      if (response.ok) {
        alert("Standard added successfully!");
        setNewStandard(""); // Clear the input field
        fetchFeeStructure(); // Fetch the updated fee structure
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to add standard.");
      }
    } catch (error) {
      console.error("Error adding standard:", error);
    }
  };

  // Edit a cell
  const handleEditCell = (rowId, columnName, value) => {
    console.log("Editing cell:", { rowId, columnName, value }); // Debug log
    setEditingCell({ rowId, columnName });
    setEditValue(value);
  };

  // Save the edited cell
  const handleSaveEdit = async () => {
    const { rowId, columnName } = editingCell;

    console.log("Attempting to save cell:", { rowId, columnName, value: editValue }); // Debug log

    try {
      await updateCell(rowId, columnName, editValue);
      setEditingCell(null); // Exit edit mode
      setEditValue(""); // Clear the edit value
    } catch (error) {
      console.error("Error updating cell:", error); // Debug log
      alert("An error occurred while updating the cell.");
    }
  };

  const updateCell = async (id, column, value) => {
    try {
      const response = await fetch("http://localhost:3001/feestructure/update-cell", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, column, value }),
      });

      if (response.ok) {
        alert("Cell updated successfully!");
        fetchFeeStructure(); // Refresh the table
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update cell.");
      }
    } catch (error) {
      console.error("Error updating cell:", error);
      alert("An error occurred while updating the cell.");
    }
  };

  const deleteSubject = async (subject_name) => {
    try {
      const response = await fetch("http://localhost:3001/feestructure/delete-subject", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject_name }),
      });

      if (response.ok) {
        alert("Subject deleted successfully!");
        fetchFeeStructure(); // Refresh the table
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete subject.");
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert("An error occurred while deleting the subject.");
    }
  };

  const deleteStandard = async (id) => {
    try {
      const response = await fetch("http://localhost:3001/feestructure/delete-standard", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        alert("Standard deleted successfully!");
        fetchFeeStructure(); // Refresh the table
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete standard.");
      }
    } catch (error) {
      console.error("Error deleting standard:", error);
      alert("An error occurred while deleting the standard.");
    }
  };

  return (
    <div className="fee-structure-container">
      <h1 className="fee-structure-title">Fee Structure</h1>

      {/* Add New Subject */}
      <div className="form-group">
        <input
          type="text"
          placeholder="New Subject"
          value={newSubject}
          onChange={(e) => {
            console.log("Updating newSubject:", e.target.value); // Debug log
            setNewSubject(e.target.value);
          }}
          className="input-field"
        />
        <button onClick={handleAddSubject} className="btn btn-add">
          Add Subject
        </button>
      </div>

      {/* Add New Standard */}
      <div className="form-group">
        <input
          type="text"
          placeholder="New Standard"
          value={newStandard}
          onChange={(e) => setNewStandard(e.target.value)}
          className="input-field"
        />
        <button onClick={handleAddStandard} className="btn btn-add">
          Add Standard
        </button>
      </div>

      {/* Fee Structure Table */}
      <table className="fee-structure-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Standard</th>
            {subjects.map((subject) => (
              <th key={subject}>
                {subject}
                <button onClick={() => deleteSubject(subject)} className="btn btn-delete">
                  Delete
                </button>
              </th>
            ))}
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {feeData.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>
                {editingCell?.rowId === row.id && editingCell?.columnName === "Standard" ? (
                  <>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="input-field"
                    />
                    <button onClick={handleSaveEdit} className="btn btn-save">
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <span>{row.Standard}</span>
                    <button
                      onClick={() => handleEditCell(row.id, "Standard", row.Standard)}
                      className="btn btn-edit"
                    >
                      Edit
                    </button>
                  </>
                )}
              </td>
              {subjects.map((subject) => (
                <td key={subject}>
                  {editingCell?.rowId === row.id && editingCell?.columnName === subject ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="input-field"
                      />
                      <button onClick={handleSaveEdit} className="btn btn-save">
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{row[subject] || 0}</span>
                      <button
                        onClick={() => handleEditCell(row.id, subject, row[subject] || 0)}
                        className="btn btn-edit"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </td>
              ))}
              <td>{row.Total || 0}</td>
              <td>
                <button onClick={() => updateCell(row.id, "Maths", 100)} className="btn btn-save">
                  Update Cell
                </button>
                <button onClick={() => deleteSubject("Maths")} className="btn btn-delete">
                  Delete Subject
                </button>
                <button onClick={() => deleteStandard(row.id)} className="btn btn-delete">
                  Delete Standard
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeeStructure;
