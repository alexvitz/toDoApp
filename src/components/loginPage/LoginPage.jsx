import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/styles.scss';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem('user');
    if (auth) {
      navigate('/home');
    }
  }, [navigate]);

  const handleLogin = async () => {
    let result = await fetch('http://localhost:5000/login', {
      method: 'post',
      body: JSON.stringify({ email, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    result = await result.json();
    if (result.auth) {
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('token', JSON.stringify(result.auth));
      navigate('/home');
    } else {
      alert('Invalid email or password');
    }
  };

  return (
    <div className="registerContainer">
      <h3 className="text-center">Login</h3>
      <input
        type="text"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="inputBox"
      />
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="inputBox"
      />
      <button
        type="button"
        onClick={handleLogin}
        className="getStartedBtn mt-5"
      >
        Login
      </button>
    </div>
  );
};

export default LoginPage;
