import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import './projectPage.css';


function NewProjectModal({ isOpen, onClose, onCreateProject }) {
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [projectID, setProjectID] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault(); 
        onCreateProject({ projectName, description, projectID });
        setProjectName('');
        setDescription('');
        setProjectID('');
        console.log("Submitting form and closing modal...");
        onClose();

    };

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            className="modal-root"
        >
            <div className="modal-content"> 
                <h2 id="modal-modal-title">Create New Project</h2>

                <form onSubmit={handleSubmit}>
                <p>Project name: </p>
                    <input
                        type="text"
                        placeholder="Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="input-field" 
                    />
                    <p>Project description: </p>
                    <input
                        type="text"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input-field"
                    />
                    <p>Project ID: </p>
                    <input
                        type="text"
                        placeholder="Project ID"
                        value={projectID}
                        onChange={(e) => setProjectID(e.target.value)}
                        className="input-field" 
                    />
                    <p></p>
                    <button type="submit">Create Project</button>
                </form>
            </div>
        </Modal>
    );
}

export default NewProjectModal;
