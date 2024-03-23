import React, { useState,useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Login with Username:', username);
    console.log('Login with Password:', password);
    try {
      const response = await fetch('http://127.0.0.1:80/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        navigate('/project');
      } else {
        console.error('Login failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    // Perform any asynchronous actions here, such as fetching data
    // Example:
    fetch('https://api.example.com/data')
      .then(response => response.json())
      .then(data => {
        // Process the fetched data
        console.log(data);
      })
      .catch(error => {
        // Handle errors
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <form onSubmit={handleSubmit}>
          <label>
            <h1>Login</h1>
            Username:
            <input type="text" value={username} onChange={handleUsernameChange} />
          </label>
          <br />
          <label>
            Password:
            <input type="password" value={password} onChange={handlePasswordChange} />
          </label>
          <br />
          <button type="submit">Login</button>
        </form>
        <p className="sign-up-text">Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </header>
    </div>
  );
}

export default Login;