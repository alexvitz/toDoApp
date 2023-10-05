import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/styles.scss';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem('user');
    if (auth) {
      navigate('/home');
    }
  }, [navigate]);

  const handleRegister = async () => {
    let result = await fetch('http://localhost:5000/register', {
      method: 'post',
      body: JSON.stringify({ name, email, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    result = await result.json();
    console.warn(result);
    localStorage.setItem('user', JSON.stringify(result.result));
    localStorage.setItem('token', JSON.stringify(result.auth));
    navigate('/home');
  };

  return (
    <div className="appBackground">
      <div className="registerContainer">
        <h3 className="mb-4 text-center">Register</h3>
        <input
          type="text"
          value={name}
          placeholder="Enter your name"
          onChange={(e) => setName(e.target.value)}
          className="inputBox"
        />
        <input
          type="text"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          className="inputBox"
        />
        <input
          type="password"
          value={password}
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
          className="inputBox"
        />
        <button
          type="button"
          onClick={handleRegister}
          className="getStartedBtn mt-5"
        >
          Create account
        </button>
        <div className="mt-3 text-center">
          <span>Already have an account?</span>
          <Link className="m-2" to="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
