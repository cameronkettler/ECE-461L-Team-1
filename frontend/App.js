import React, { useState } from 'react';
import './App.css';
import Signup from './signup'

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Login with Username:', username);
    console.log('Login with Password:', password);
  };

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
        <p className="sign-up-text">Don't have an account? <a href="/signup">Sign Up</a></p>
        <Signup />
      </header>
    </div>
  );
}

export default App;