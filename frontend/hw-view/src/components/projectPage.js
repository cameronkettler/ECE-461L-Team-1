import './projectPage.css';
import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Button from '@mui/material/Button';

function ProjectRow({project}){
  const { name, listAuthorizedUsers, HWSet1, HWSet2, alreadyJoined } = project;
  const [joined, setJoined] = useState(alreadyJoined);
  const [HWSet, pushHWSet] = useState();

  useEffect(() => {
    fetch('http://127.0.0.1:80/get')
      .then(res => res.json())
      .then(data => {
        console.log(data);
      })
  }, []);

  const f_pushHWSet = (input) => {
    pushHWSet(input);
    fetch('http://127.0.0.1:80/input', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    })
      .then(resp => resp.json())
      .then(data => console.log(data));
  }

  function handleInputClick(event) {
    event.target.value = "";
  }

  function handleInputRevert(event) {
    if (event.target.value === "") {
      event.target.value = "Enter Quantity";
    }
  }

  function handleCheckIn(event) {

    const parent = event.target.parentElement;
    const input = parent.querySelector("input[type='text']");
    const value = parseInt(input.value);
    const value_dic = {
      'HWSet': value
    }
    if (!isNaN(value)) {
      f_pushHWSet(value_dic);
      const hardwareElement = parent.querySelector(".amtHardware");
      if (hardwareElement) {
        const currCount = parseInt(hardwareElement.textContent.split('/')[0]);
        const minCount = 0;
        const newCount = currCount - value;
        if (newCount >= minCount) { 
          hardwareElement.textContent = `${newCount}/${100}`;
          input.value = ""; 
        } else {
          console.error("Attempted to check in more than the amount in your personal inventory");
        }
      }
    }
  }

  function handleCheckOut(event) {
    const parent = event.target.parentElement;
    const input = parent.querySelector("input[type='text']");
    const value = parseInt(input.value);
    if (!isNaN(value)) {
      const hardwareElement = parent.querySelector(".amtHardware");
      if (hardwareElement) {
        const currentCount = parseInt(hardwareElement.textContent.split('/')[0]);
        const newCount = currentCount + value;
        if (newCount <= 100) {
          hardwareElement.textContent = `${newCount}/${100}`;
          input.value = "";
        } else {
          console.error("Attempted to check out more than the maximum amount allowed to a user (100)");
        }
      }
    }
  }

  function handleJoin() {
    // Used to update Join/Leave button
    setJoined(!joined); 
    project.alreadyJoined = !joined; 
  }

  return (
    // We will use <tr> because we are displaying these projects in a table-row format
    // <td> denotes table-data, in this case the table data is the entire row we are displaying
    // <span> is used to display elements in-line
  <tr>
    <td className={`project-container ${alreadyJoined ? "joined-project" : ""}`}>
      <h3 className = "align-middle">{name}</h3>
      <div className="project-info">
        <span>Authorized Users: {listAuthorizedUsers}</span>
        <div>
          <div>
          <span>HWSet1: <span className="amtHardware">{HWSet1}</span></span>
            <input type="text" defaultValue="Enter Quantity" onClick={handleInputClick} onRevert={handleInputRevert}/>
            <Button variant="contained" onClick ={handleCheckIn} disabled = {!alreadyJoined}>Check In </Button>
            <Button variant="contained" onClick ={handleCheckOut} disabled = {!alreadyJoined}>Check Out </Button>
          </div>
          <div>
          <span>HWSet2: <span className="amtHardware">{HWSet2}</span></span>
            <input type="text" defaultValue="Enter Quantity" onClick={handleInputClick} onRevert={handleInputRevert}/>
            <Button variant="contained" onClick ={handleCheckIn} disabled = {!alreadyJoined}>Check In </Button>
            <Button variant="contained" onClick ={handleCheckOut} disabled = {!alreadyJoined}>Check Out </Button>
          </div>
        </div>
      </div>
      <Button variant="contained" onClick={handleJoin}>{joined ? "Leave" : "Join"}</Button>
    </td>
  </tr>
  );
}

// Following "React Component Heirarchy" example structure
function ProjectTable({projectInfo}){
  const rows = [];
  let lastCategory = null;

  // We want, in this case, 3 rows. We can use forEach because projectInfo knows there are 3 project entries in the STATE array
  projectInfo.forEach((project) => {
    if(project.name !== lastCategory){
      rows.push(
        <ProjectRow
          key={project.name}
          // Pass the entire project into <ProjectRow> to access data as a prop in ProjectRow function
          project={project} 
        />
      );
    }
    // We do not want to repeat rows
    lastCategory = project.name;
    
  });
  return(
    /* To extenuate the component structure, we will use the project-container from out css file in order to 
       create a box around all of our projects
    */
    <div className="project-container">
      {rows}
    </div>
  );
}

function Projects( {currState} ){
    const navigate = useNavigate();
    function handleSignOut() {
        // Handle sign-out logic here
        navigate('/');
      }
  // Projects will create an instance of Project Table which will do most of the heavy lifting for displaying our projects page
  return (
    <div>
      <h2>
        Projects
      </h2>
      <h4>Already Joined Projects will appear in light green</h4>
      <h4>Each user will be able to check out a maximum of 100 hardware components of each HW set at a time</h4>
      <h4>Current personal inventory and projects are displayed below</h4>
      <ProjectTable projectInfo = {currState}/>
      <Button variant="contained" onClick={handleSignOut}>Sign Out</Button>
    </div>
  );
}

export default Projects;
