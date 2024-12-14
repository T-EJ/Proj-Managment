import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import StudentDetail from './components/StudentDetail';
import FacultyManagement from './components/FacultyManagement';
import FeePayment from './components/FeePayment';
import PaymentScheduleDetails from './components/PaymentScheduleDetails'; 
import Studentinfo from './components/studentinfo';
import Externalfac from './components/externalfac';
import AddSubject from './components/AddSubject';
import AddStandard from './components/AddStandard';  // Import AddStandard component

const App = () => (
    <Router>
        <div>
            {/* <h1>Subject and Standard Management</h1> */}

            {/* Add Subject and Standard Management Components */}
            {/* <div>
                <AddSubject />s
                <AddStandard />
            </div> */}

            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/students" element={<StudentList />} />
                <Route path="/students/:id" element={<StudentDetail />} />
                <Route path="/faculties" element={<FacultyManagement />} />
                <Route path="/pay-fees" element={<FeePayment />} />
                <Route path="/externalfac" element={<Externalfac />} />
                <Route path="/payment-details" element={<PaymentScheduleDetails />} />
                <Route path="/studentinfo" element={<Studentinfo />} />
                <Route path="/AddSubject" element={<AddSubject />} />
                <Route path="/AddStandard" element={<AddStandard />} />
            </Routes>
        </div>
    </Router>
);

export default App;
