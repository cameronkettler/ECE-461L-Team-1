import './projectPage.css';
import React, {useState, useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import Button from '@mui/material/Button';
import NewProjectModal from './newProjectModal';



function ProjectRow({project}){
  const { name, listAuthorizedUsers, HWSet1, HWSet2, alreadyJoined } = project;
  const [joined, setJoined] = useState(alreadyJoined);
  const [HWSet, pushHWSet] = useState();


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
  <tr>
    <td className={`project-container ${alreadyJoined ? "joined-project" : ""}`}>
      <h3 className = "align-middle">{project.name}</h3>
      <tr className="project-info">
        <span>Authorized Users: {listAuthorizedUsers}</span>
        <tr>
          <tr>
          <span>HWSet1: <span className="amtHardware">{HWSet1}</span></span>
            <input type="text" defaultValue="Enter Quantity" onClick={handleInputClick} onRevert={handleInputRevert}/>
            <Button variant="contained" onClick ={handleCheckIn} disabled = {!alreadyJoined}>Check In </Button>
            <Button variant="contained" onClick ={handleCheckOut} disabled = {!alreadyJoined}>Check Out </Button>
          </tr>
          <tr>
          <span>HWSet2: <span className="amtHardware">{HWSet2}</span></span>
            <input type="text" defaultValue="Enter Quantity" onClick={handleInputClick} onRevert={handleInputRevert}/>
            <Button variant="contained" onClick ={handleCheckIn} disabled = {!alreadyJoined}>Check In </Button>
            <Button variant="contained" onClick ={handleCheckOut} disabled = {!alreadyJoined}>Check Out </Button>
          </tr>
        </tr>
      </tr>
      <Button variant="contained" onClick={handleJoin}>{joined ? "Leave" : "Join"}</Button>
    </td>
  </tr>
  );
}

// Following "React Component Heirarchy" example structure
function ProjectTable({projectInfo}){
  const rows = [];
  let lastCategory = null;

  if (!Array.isArray(projectInfo)) {
    return <div>Error: Project information is not available</div>;
  }

  projectInfo.forEach((project) => {
    if(project.name !== lastCategory){
      rows.push(
        <ProjectRow
          key={project.name}
          project={project} 
        />
      );
    }
    // We do not want to repeat rows
    lastCategory = project.name;
    
  });
  return(
    <div className="project-container">
      {rows}
    </div>
  );
}

function Projects({ currState, onCreateProject }) {
  const location = useLocation();
  const username = location.state.username;
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]); // State to store the projects data

  useEffect(() => {
    // Fetch projects data from the backend when the component mounts
    fetch('http://127.0.0.1:80/get_projects?username=${username}')
      .then(res => res.json())
      .then(data => {
        setProjects(data); // Update the projects state with the fetched data
      })
      .catch(error => {
        console.error('Error fetching projects:', error);
      });
  }, [username]); // Empty dependency array ensures the effect runs only once when the component mounts

  function handleSignOut() {
    navigate('/');
  }

  function handleNewProject() {
    setIsModalOpen(true);
  }

  function handleCloseModalAndAddProject(projectData) {
    setIsModalOpen(false); // Close the modal

    if (!projectData) {
      console.error('projectData is null or undefined');
      return;
    }

    fetch('http://127.0.0.1:80/create_project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'project_name': projectData.name,
        'quantity': 0,
        'users': [username], // Corrected syntax here
        'username' : username
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to create project');
        }
        return response.json();
      })
      .then(data => {
        console.log('Project created successfully:', data);
        // Update projects state with the newly added project
        setProjects(prevProjects => {
          if (!Array.isArray(prevProjects)) {
            return [projectData];
          }
          return [...prevProjects, projectData];
        });

        // Call onCreateProject here to ensure it's executed after the state update
        onCreateProject(projectData);
      })
      .catch(error => {
        console.error('Error creating project:', error);
        // Optionally, provide feedback to the user that the project creation failed
      });
  }

  return (
    <tr>
      <h2>Projects</h2>
      <h4>Already Joined Projects will appear in light green</h4>
      <h4>Current personal inventory and projects are displayed below</h4>
      <ProjectTable projectInfo={projects} />
      <Button variant="contained" onClick={handleSignOut} className="button-gap">Sign Out</Button>
      <Button variant="contained" onClick={handleNewProject} className="button-gap">Create new project</Button>
      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreateProject={handleCloseModalAndAddProject} />
    </tr>
  );
}

export default Projects;
