import React, { useState } from 'react';
import axios from 'axios';

const FeePayment = () => {
    const [paymentData, setPaymentData] = useState({
        studentId: '',
        amount: '',
        paymentMode: 'Cash',
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post('/api/pay-fees/', paymentData)
            .then(response => {
                alert('Payment successful!');
            })
            .catch(error => {
                console.error('Error processing payment:', error);
            });
    };

    return (
        <div>
            <h1>Fee Payment</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Student ID:
                    <input
                        type="text"
                        value={paymentData.studentId}
                        onChange={(e) => setPaymentData({ ...paymentData, studentId: e.target.value })}
                    />
                </label>
                <label>
                    Amount:
                    <input
                        type="number"
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    />
                </label>
                <label>
                    Payment Mode:
                    <select
                        value={paymentData.paymentMode}
                        onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
                    >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                    </select>
                </label>
                <button type="submit">Pay</button>
            </form>
        </div>
    );
};

export default FeePayment;
