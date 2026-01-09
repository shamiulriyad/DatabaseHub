import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero">
        <h1>Welcome to E-Learning Platform</h1>
        <p>Learn from anywhere, anytime</p>
        <button className="btn btn-primary btn-lg">Explore Courses</button>
      </div>

      <div className="features">
        <div className="feature-card">
          <h3>📚 Comprehensive Courses</h3>
          <p>High-quality courses across multiple subjects</p>
        </div>
        <div className="feature-card">
          <h3>👥 Community Learning</h3>
          <p>Learn and collaborate with other students</p>
        </div>
        <div className="feature-card">
          <h3>🏆 Gamification</h3>
          <p>Earn points, badges, and compete on leaderboards</p>
        </div>
        <div className="feature-card">
          <h3>📊 Track Progress</h3>
          <p>Monitor your learning progress in real-time</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
