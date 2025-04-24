import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
import FeeStructure from "./components/FeeStructure"; // Fixed typo
import StudentAllView from './components/StudentAllView.js';
import FacultyPayment from './components/facultyPayment.js';
import FacultyPaymentFetch from './components/facultyPaymentFetch.js';

const App = () => {
  return (
    <BrowserRouter>
      <Sidebar>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/addstudent" element={<Student />} />
          <Route path="/addfaculty" element={<Addfaculty />} />
          <Route path="/AddStandard" element={<AddStandard />} />
          <Route path="/AddSubject" element={<AddSubject />} />
          <Route path="/student-faculty-view" element={<StudentFacultyView />} />
          <Route path="/student-details" element={<FetchStudentDetails />} />
          <Route path="/payment-details" element={<PaymentScheduleDetails />} />
          <Route path="/studentAllview" element={<StudentAllView />} /> {/* Fixed typo */}  
          <Route path="/paymentinfo" element={<PaymentForm />} />
          <Route path="/feestructure" element={<FeeStructure />} /> {/* Fixed typo */}
          <Route path="/facultyPayment" element={<FacultyPayment />} />
          <Route path="/facultyPaymentFetch" element={<FacultyPaymentFetch />} /> {/* Added new route */}
        </Routes>
      </Sidebar>
    </BrowserRouter>
  );
};

export default App;