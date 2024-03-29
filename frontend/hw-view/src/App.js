import React, {useState, useEffect} from 'react';
import './App.css';
import Login from './components/Login';
import Signup from './components/signUp';
import Projects from './components/projectPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [projects, setProjects] = useState([
    { name: "Project 1", listAuthorizedUsers: "List of authorized users", HWSet1: "50/100", HWSet2: "20/100", alreadyJoined: false },
    { name: "Project 2", listAuthorizedUsers: "List of authorized users", HWSet1: "50/100", HWSet2: "30/100", alreadyJoined: true },
    { name: "Project 3", listAuthorizedUsers: "List of authorized users", HWSet1: "0/100", HWSet2: "50/100", alreadyJoined: false }
  ]);

function handleCreateProject(projectData) {
    const newProject = {
        name: projectData.projectName,
        listAuthorizedUsers: "Current User", //replace with current user maybe
        HWSet1: "50/100", //replace capacity with the global one
        HWSet2: "20/100", //replace capacity with global one
        alreadyJoined: false
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/project" element={<Projects currState={projects} onCreateProject={handleCreateProject} />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
