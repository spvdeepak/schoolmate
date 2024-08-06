import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './container/Login/Login';
import Classes from './container/Classes/Classes';
import Performance from './container/Performance/Performance';
import PerformView from './container/Performance/View';
import Notify from './container/Notifications/Notify';
import Exam from './container/Exam Cell/Exam';
import Contact from './container/Contact/Contact';
import Fees from './container/Fees/Fees';
import FeeStruct from './container/Fees/FeeStructure';
import Subject from './container/Subject/Subject';
import SubDetail from './container/Subject/Sub/Details';
import SubView from './container/Subject/Sub/View';
import Educator from './container/Educator/Educator';
import Student from './container/Students/Student';
import Sections from './container/Classes/Sub/Section';
import Details from './container/Classes/Sub/Details';
import ExamDetails from './container/Exam Cell/Sub/ExamDetails';
import TimeTable from './container/TimeTable/Timetable';
import Stock from './container/Stocks/Stock';
import Calendar from './container/Calendar/Calendar';
import Promote from './container/Promote/Promote';
import Group from './container/Group/Group';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />               
                {/*Classes */}
                <Route path="/classes" element={<Classes />} />
                <Route path="/classes/sections" element={<Sections />} />
                <Route path="/classes/sections/details" element={<Details />} />

                <Route path="/performance" element={<Performance />} />
                <Route path="/performance/perform-view" element={<PerformView />} />

                <Route path="/notify" element={<Notify />} />

                {/* Exam */}
                <Route path="/exam" element={<Exam />} />
                <Route path="/exam/details" element={<ExamDetails />} />

                <Route path="/contact" element={<Contact />} />

                {/* Fees */}
                <Route path="/fees" element={<Fees />} />
                <Route path="/fee-structure" element={<FeeStruct />} />

                {/* Subjects */}
                <Route path="/subject" element={<Subject />} />
                <Route path="/subject/substand" element={<SubDetail />} />
                <Route path="/subject/substand/view" element={<SubView />} />

                <Route path="/educator" element={<Educator />} />
                <Route path="/student" element={<Student />} />

                <Route path="/timetable" element={<TimeTable />} />

                <Route path="/stock" element={<Stock />} />

                <Route path="/promote" element={<Promote />} />

                <Route path="/calendar" element={<Calendar />} />

                <Route path="/group" element={<Group />} />
            </Routes>
        </Router>
    )
}

export default App;
