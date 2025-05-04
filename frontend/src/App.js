import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Navbar.js';
import Dashboard from './components/Dashboard.js';
import Student from './components/studentinfo.js';
import Addfaculty from './components/externalfac.js';
import AddStandard from './components/AddStandard'; 
import AddSubject from './components/AddSubject';
import StudentFacultyView from "./components/studentfacultyview";
import FetchStudentDetails from "./components/studentdetails";
import PaymentScheduleDetails from './components/PaymentScheduleDetails'; 
import PaymentForm from "./components/paymentform";
import FeeStructure from "./components/FeeStructure";
import StudentAllView from './components/StudentAllView.js';
import FacultyPayment from './components/facultyPayment.js';
import FacultyPaymentFetch from './components/facultyPaymentFetch.js';
import LoginPage from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar is only rendered if not on the login page */}
      {!isLoginPage && <Sidebar />}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addstudent"
            element={
              <ProtectedRoute>
                <Student />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addfaculty"
            element={
              <ProtectedRoute>
                <Addfaculty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AddStandard"
            element={
              <ProtectedRoute>
                <AddStandard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AddSubject"
            element={
              <ProtectedRoute>
                <AddSubject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-faculty-view"
            element={
              <ProtectedRoute>
                <StudentFacultyView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-details"
            element={
              <ProtectedRoute>
                <FetchStudentDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-details"
            element={
              <ProtectedRoute>
                <PaymentScheduleDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/studentAllview"
            element={
              <ProtectedRoute>
                <StudentAllView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paymentinfo"
            element={
              <ProtectedRoute>
                <PaymentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feestructure"
            element={
              <ProtectedRoute>
                <FeeStructure />
              </ProtectedRoute>
            }
          />
          <Route
            path="/facultyPayment"
            element={
              <ProtectedRoute>
                <FacultyPayment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/facultyPaymentFetch"
            element={
              <ProtectedRoute>
                <FacultyPaymentFetch />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;