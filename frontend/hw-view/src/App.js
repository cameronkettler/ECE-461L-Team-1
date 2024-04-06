import React, {useState, useEffect} from 'react';
import './App.css';
import Login from './components/Login';
import Signup from './components/signUp';
import Projects from './components/projectPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/project" element={<Projects />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
