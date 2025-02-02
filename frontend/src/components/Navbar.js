import React, { useState } from 'react';
import {
    FaTh,
    FaBars,
    FaUserAlt,
    FaRegChartBar,
    FaCommentAlt,
    FaShoppingBag,
    FaThList
}from "react-icons/fa";
import { NavLink } from 'react-router-dom';


const Sidebar = ({children}) => {
    const[isOpen ,setIsOpen] = useState(false);
    const toggle = () => setIsOpen (!isOpen);
    const menuItem=[
        {
            path:"/",
            name:"Dashboard",
            icon:<FaTh/>
            
        },
        {
            path:"/addstudent",
            name:"Add student",
            icon:<FaUserAlt/>
        },
        {
            path:"/addfaculty",
            name:"Add faculty",
            icon:<FaRegChartBar/>
        },
        {
            path:"/AddStandard",
            name:"Add Standard",
            icon:<FaCommentAlt/>
        },
        {
            path:"/AddSubject",
            name:"Add subject",
            icon:<FaShoppingBag/>
        },
        {
            path:"/student-faculty-view",
            name:"Lecturer's Dashboard",
            icon:<FaThList/>
        }
    ]
    return (
        <div className="container">
           <div style={{width: isOpen ? "200px" : "50px"}} className="sidebar">
           
               <div className="top_section">
                   <h1 style={{display: isOpen ? "block" : "none"}} className="logo">JG Tution </h1>
                   <div style={{marginLeft: isOpen ? "50px" : "0px"}} className="bars">
                       <FaBars onClick={toggle}/>
                   </div>
                   
               </div>
               {
                   menuItem.map((item, index)=>(
                       <NavLink to={item.path} key={index} className="link" activeclassName="active">
                           <div className="icon">{item.icon}</div>
                           <div style={{display: isOpen ? "block" : "none"}} className="link_text">{item.name}</div>
                           <div style={{display: isOpen ? "block" : "none"}} className="link_text"></div>
                       </NavLink>
                       
                   ))
                   
               }
               
           </div>
           <main>{children}</main>
        </div>
    );
};

export default Sidebar;