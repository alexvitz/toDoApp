import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import WelcomePage from './components/welcomePage/WelcomePage';
import RegisterPage from './components/registerPage/RegisterPage';
import LoginPage from './components/loginPage/LoginPage';
import HomePage from './components/homePage/HomePage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
