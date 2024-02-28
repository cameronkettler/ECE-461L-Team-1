import React from 'react';
import { Route } from 'react-router-dom';

function Signup() {
  return (
      <div className="container">
        <h1>Sign Up</h1>
        <form action="#" method="post">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          <div className="form-group">
            <label htmlFor="confirm_password">Confirm Password</label>
            <input type="password" id="confirm_password" name="confirm_password" required />
          </div>
          <button type="submit" className="btn">Sign Up</button>
          <div className="login-link">
            <a href="login.html">Not a new user? Login</a>
          </div>
        </form>
      </div>
  );
}

export default Signup;