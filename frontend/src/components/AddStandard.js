import React, { useState } from 'react';
import axios from 'axios';

const AddStandard = () => {
    const [standardName, setStandardName] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/add-standard', {
                standard_name: standardName,
            });
            console.log(response.data); // Log the response for debugging
            setMessage(response.data.message);
            setStandardName('');
        } catch (error) {
            console.error('Error submitting the form:', error); // Log the error for debugging
            setMessage('Error adding standard');
        }
    };

    const styles = {
        container: {
            maxWidth: '400px',
            margin: '50px auto',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f9f9f9',
        },
        header: {
            textAlign: 'center',
            marginBottom: '20px',
            color: '#333',
        },
        formGroup: {
            marginBottom: '15px',
        },
        label: {
            display: 'block',
            marginBottom: '5px',
            fontWeight: 'bold',
        },
        input: {
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
        },
        button: {
            width: '100%',
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
        },
        buttonHover: {
            backgroundColor: '#45a049',
        },
        message: {
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#333',
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Add Standard</h2>
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Standard Name:</label>
                    <input
                        type="text"
                        value={standardName}
                        onChange={(e) => setStandardName(e.target.value)}
                        style={styles.input}
                        placeholder="Enter standard name"
                    />
                </div>
                <button 
                    type="submit" 
                    style={styles.button}
                    onMouseOver={(e) => e.target.style.backgroundColor = styles.buttonHover.backgroundColor}
                    onMouseOut={(e) => e.target.style.backgroundColor = styles.button.backgroundColor}
                >
                    Add Standard
                </button>
            </form>
            {message && <p style={styles.message}>{message}</p>}
        </div>
    );
};

export default AddStandard;
