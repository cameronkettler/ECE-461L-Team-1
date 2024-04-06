import './projectPage.css';
import React, {useState, useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import Button from '@mui/material/Button';
import NewProjectModal from './newProjectModal';



function ProjectRow({project, currUser}){
  const { name, listAuthorizedUsers, HWSet1, HWSet2, alreadyJoined } = project;
  const [joined, setJoined] = useState(alreadyJoined);
  const [pushHWSet] = useState();


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

  function handleCheckIn(hwSet) {
    return (event) => {
      const parent = event.target.parentElement;
      const input = parent.querySelector("input[type='text']");
      const value = parseInt(input.value);
      if (!isNaN(value)) {
        fetch('http://127.0.0.1:80/check_in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            { HWSet: hwSet, 
              amtCheckIn: value,
              projName: name 
            }),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to check in hardware set');
            }
            return response.json();
          })
          .then(data => {
            const availabilityElement = parent.querySelector(".amtHardware");
            availabilityElement.textContent = `${data.newAvailability}/${1000}`; 
          })
          .catch(error => {
            console.error('Error checking in hardware set:', error);
          });
      }
    };
  }


  function handleCheckOut(hwSet) {
    return (event) => {
      const parent = event.target.parentElement;
      const input = parent.querySelector("input[type='text']");
      const value = parseInt(input.value);
      if (!isNaN(value)) {
        fetch('http://127.0.0.1:80/check_out', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            HWSet: hwSet,
            amtCheckOut: value,
            projName: name
          }),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to check out hardware set');
            }
            return response.json();
          })
          .then(data => {
            const availabilityElement = parent.querySelector(".amtHardware");
            availabilityElement.textContent = `${data.newAvailability}/${1000}`; 
          })
          .catch(error => {
            console.error('Error checking out hardware set:', error);
          });
      }
    };
  }

  function handleJoinLeave() {
    fetch('http://127.0.0.1:80/join_leave_project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
         action: !joined,
         projName: name,
         user: currUser 
        }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to join or leave project');
        }
        // Handle successful response if needed
      })
      .catch(error => {
        console.error('Error joining or leaving project:', error);
      });
    setJoined(!joined); 
    project.alreadyJoined = !joined;
  }


  return (
    <tr>
      <td className={`project-container ${alreadyJoined ? "joined-project" : ""}`}>
        <h3 className="align-middle">{project.name}</h3>
        <div className="project-info">
          <span>Authorized Users: {listAuthorizedUsers}</span>
          <div>
            <div>
              <span>HWSet1: <span className="amtHardware">{HWSet1}</span></span>
              <input type="text" defaultValue="Enter Quantity" onClick={handleInputClick} onRevert={handleInputRevert} />
              <Button variant="contained" onClick={handleCheckIn("HWSet1")} disabled={!alreadyJoined}>Check In </Button>
              <Button variant="contained" onClick={handleCheckOut("HWSet1")} disabled={!alreadyJoined}>Check Out </Button>
            </div>
            <div>
              <span>HWSet2: <span className="amtHardware">{HWSet2}</span></span>
              <input type="text" defaultValue="Enter Quantity" onClick={handleInputClick} onRevert={handleInputRevert} />
              <Button variant="contained" onClick={handleCheckIn("HWSet2")} disabled={!alreadyJoined}>Check In </Button>
              <Button variant="contained" onClick={handleCheckOut("HWSet2")} disabled={!alreadyJoined}>Check Out </Button>
            </div>
          </div>
        </div>
        <Button variant="contained" onClick={() => handleJoinLeave()}>{joined ? "Leave" : "Join"}</Button>
      </td>
    </tr>
  );
}

// Following "React Component Heirarchy" example structure
function ProjectTable({projectInfo, user}){
  const rows = [];
  let lastCategory = null;

  console.log(projectInfo)

  if (!Array.isArray(projectInfo)) {
    return <div>Error: Project information is not available</div>;
  }

  projectInfo.forEach((project) => {
    if(project.name !== lastCategory){
      rows.push(
        <ProjectRow
          key={project.name}
          project={project}
          currUser = {user} 
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
    fetch(`http://127.0.0.1:80/get_projects?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.projects) {
          // Update the projects state with the fetched data
          setProjects(data.projects);
        } else {
          console.error('Error fetching projects:', data.error);
        }
      })
      .catch(error => {
        console.error('Error fetching projects:', error);
      });
  }, [username]);

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
      <h4>Current service capacity is 1000 Hardware Components for HWSet1 and HWSet2</h4>
      <h5>To get the most accurate availability data, be sure to REFRESH THE PAGE</h5>
      <ProjectTable  projectInfo={projects} user = {username} />
      <Button variant="contained" onClick={handleSignOut} className="button-gap">Sign Out</Button>
      <Button variant="contained" onClick={handleNewProject} className="button-gap">Create new project</Button>
      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreateProject={handleCloseModalAndAddProject} />
    </tr>
  );
}

export default Projects;
