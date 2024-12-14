import React from "react";
import "./PaymentScheduleDetails.css";

const PaymentScheduleDetails = () => {
  return (
    <div className="bg-gray-100">
      <header className="header">
        <i className="fas fa-arrow-left mr-4"></i>
        <h1 className="header-title">Payment Schedule Details</h1>
      </header>
      <div className="content-container">
        {/* Card 1 */}
        <div className="card">
          <div className="flex justify-between mb-2">
            <div>
              <p className="label">Installment Date</p>
              <p className="text-lg">
                <i className="far fa-calendar-alt"></i> 03/04/2024
              </p>
            </div>
            <div>
              <p className="label">Amount</p>
              <p className="text-lg text-blue-700">₹ 6500.00</p>
            </div>
          </div>
          <div className="mb-2">
            <p className="label">Mode</p>
            <p className="text-lg">Cash</p>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="label">Tax Amount</p>
              <p className="text-lg">₹ 0.00</p>
            </div>
            <div>
              <p className="label">Tax %</p>
              <p className="text-lg">0.00 %</p>
            </div>
          </div>
          </div>

        {/* Card 2 */}
        <div className="card">
          <div className="flex justify-between mb-2">
            <div>
              <p className="label">Receipt No</p>
              <p className="text-lg">PRE9082</p>
            </div>
            <div>
              <p className="label">Status</p>
              <p className="text-lg">Paid</p>
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <div>
              <p className="label">Installment Date</p>
              <p className="text-lg">
                <i className="far fa-calendar-alt"></i> 09/11/2024
              </p>
            </div>
            <div>
              <p className="label">Amount</p>
              <p className="text-lg text-blue-700">₹ 6000.00</p>
            </div>
          </div>
          <div className="mb-2">
            <p className="label">Mode</p>
            <p className="text-lg">Online Gateway</p>
          </div>
          <div className="mb-2">
            <p className="label">Detail</p>
            <p className="text-lg">468017978253 dated 09/11/2024</p>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="label">Tax Amount</p>
              <p className="text-lg">₹ 0.00</p>
            </div>
            <div>
              <p className="label">Tax %</p>
              <p className="text-lg">0.00 %</p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card">
          <div className="flex justify-between mb-2">
            <div>
              <p className="label">Receipt No</p>
              <p className="text-lg">N/A</p>
            </div>
            <div>
              <p className="label">Status</p>
              <p className="text-lg text-red-600">Unpaid (EMI)</p>
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <div>
              <p className="label">Installment Date</p>
              <p className="text-lg">
                <i className="far fa-calendar-alt"></i> 15/12/2024
              </p>
            </div>
            <div>
              <p className="label">Amount</p>
              <p className="text-lg text-blue-700">₹ 6000.00</p>
            </div>
          </div>
          <div className="mb-2">
          <p className="label">Mode</p>
            <p className="text-lg">-</p>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="label">Tax Amount</p>
              <p className="text-lg">₹ 0.00</p>
            </div>
            <div>
              <p className="label">Tax %</p>
              <p className="text-lg">0 %</p>
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="card">
          <p className="text-lg font-semibold mb-2">Course Subscription</p>
          <div className="course-section">
            <div className="flex justify-between">
              <p className="label">Course</p>
              <p className="label">Fees</p>
            </div>
            <div className="flex justify-between">
              <p className="text-lg">11(24_25)</p>
              <p className="text-lg">18500.00 ₹</p>
            </div>
          </div>
          <div className="total-section">
            <div className="flex justify-between">
              <p className="text-lg">Total</p>
              <p className="text-lg">18500.00 ₹</p>
            </div>
          </div>
          <div className="committed-section">

          <div className="flex justify-between">
              <p className="text-lg">Committed</p>
              <p className="text-lg">18500.0 ₹</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScheduleDetails;