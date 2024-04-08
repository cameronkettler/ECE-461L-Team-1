import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import './projectPage.css';

function JoinExistingProject({ isOpen, onClose, onJoinProject }) {
    const [projectID, setProjectID] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault(); 
        onJoinProject({ projectID });
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
                <h2 id="modal-modal-title">Join Existing Project</h2>

                <form onSubmit={handleSubmit}>
                    <p>Project ID to Join: </p>
                    <input
                        type="text"
                        placeholder="Project ID"
                        value={projectID}
                        onChange={(e) => setProjectID(e.target.value)}
                        className="input-field" 
                    />
                    <p></p>
                    <button type="submit">Join Project</button>
                </form>
            </div>
        </Modal>
    );
}

export default JoinExistingProject;
