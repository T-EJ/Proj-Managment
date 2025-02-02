// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import './App.css'
// import Dashboard from './components/Dashboard';
// import StudentList from './components/StudentList';
// import StudentDetail from './components/StudentDetail';
// import FacultyManagement from './components/FacultyManagement';
// import FeePayment from './components/FeePayment';
// import PaymentScheduleDetails from './components/PaymentScheduleDetails'; 
// import Studentinfo from './components/studentinfo';
// import Externalfac from './components/externalfac';
// import AddSubject from './components/AddSubject';
// import AddStandard from './components/AddStandard';  // Import AddStandard component
// import StudentFacultyView from "./components/studentfacultyview";
// import StudentListPage from "./components/StudentListPage";
// import PaymentForm from "./components/paymentform";
// import FetchStudentDetails from "./components/studentdetails";
// import Feestucture from "./components/FeeStructure";
// import Sidebar from './components/Navbar';


// const App = () => (
//     <Router>
//         <div>
//             {/* <h1>Subject and Standard Management</h1> */}

//             {/* Add Subject and Standard Management Components */}
//             {/* <div>
//                 <AddSubject />s
//                 <AddStandard />
//             </div> */}
// <Sidebar>
// <Routes>
    
//                 <Route path="/" element={<Dashboard />} />
//                 <Route path="/students" element={<StudentList />} />
//                 <Route path="/students/:id" element={<StudentDetail />} />
//                 <Route path="/faculties" element={<FacultyManagement />} />
//                 <Route path="/pay-fees" element={<FeePayment />} />
//                 <Route path="/externalfac" element={<Externalfac />} />
//                 <Route path="/payment-details" element={<PaymentScheduleDetails />} />
//                 <Route path="/studentinfo" element={<Studentinfo />} />
//                 <Route path="/AddSubject" element={<AddSubject />} />
//                 <Route path="/AddStandard" element={<AddStandard />} />
//                 <Route path="/student-faculty-view" element={<StudentFacultyView />} />
//                 <Route path="/fetch-students/:facultyId/:facultySubject" element={<StudentListPage />} />
//                 <Route path="/paymentinfo" element={<PaymentForm />} />
//                 <Route path="/student-details" element={<FetchStudentDetails />} />
//                 <Route path="/feestructure" element={<Feestucture />} />
               
//             </Routes>
//             </Sidebar>
//         </div>
//     </Router>
// );

// export default App;

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
import Feestucture from "./components/FeeStructure";

const App = () => {
  return (
    <BrowserRouter>
      <Sidebar>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/addstudent" element={<Student />} />
          <Route path="/addfaculty" element={<Addfaculty />} />
          <Route path="/addfaculty" element={<Addfaculty />} />
          <Route path="/AddStandard" element={<AddStandard />} />
          <Route path="/AddSubject" element={<AddSubject />} />
          <Route path="/student-faculty-view" element={<StudentFacultyView />} />
          <Route path="/student-details" element={<FetchStudentDetails />} />
          <Route path="/payment-details" element={<PaymentScheduleDetails />} />
          <Route path="/paymentinfo" element={<PaymentForm />} />
          <Route path="/feestructure" element={<Feestucture />} />
        </Routes>
      </Sidebar>
    </BrowserRouter>
  );
};

export default App;