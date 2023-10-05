import React from 'react';
import '../../styles/styles.scss';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="appBackground">
      <div className="welcomeGetStarted">
        <p className="welcomeText">Welcome to Uno To Do</p>
        <p className="welcomeSubtitle">
          Start using the best to-do app, you can create and manage your To Do
          lists to improve your organization.
        </p>
        <button className="getStartedBtn" onClick={() => navigate('/register')}>
          Get Started
        </button>
      </div>
      <div className="welcomeImgContainer">
        <img
          className="welcomeImg"
          alt="welcomeImg"
          src="https://s3-alpha-sig.figma.com/img/a302/626c/620813bbe883be09421c198e10a0633a?Expires=1696809600&Signature=IwY556UJQDBeOSOZeh4T4SuTlgTeflTbYOecwXvz7hkNX7TyKhEGMGj8p361yKZKZ07rzJZZjgpSm2kGdkaulhPy-R8qmjWJfWQcmzr3NgkTxHqb7bUSq2lbEhoUiKw2oQqIDMPFl1e0kEL0aN40-jB~T98Z3IIr4Ps5P2q5Xu5RfuxkMgUapByOdl7wgkPfoddNHX1sEt~Qc4qVsnpnCfh3BYSiXfJEY7zGsvI4ZVZ6awodUopdXkHL-A1I8FCyyMu7vxKi3LN3EKEWGw~fcIEf7O0jaLLD7HcMeYDTD8z~HrxRKjziOEoxNCfVf4mMkdI0h4v6OSyLSPVJcJ3W8w__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4"
        />
      </div>
    </div>
  );
};

export default WelcomePage;
