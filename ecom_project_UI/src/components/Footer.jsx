import React from 'react';
import { FaCar, FaGithub, FaEnvelope, FaRegCopyright } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container glass-panel">
      <div className="footer-content">
        <div className="footer-logo">
          <FaCar className="footer-logo-icon" />
          <span className="footer-logo-text">AutoVibe</span>
        </div>
        <p className="footer-tagline">
          Experience premium luxury and reliability in our elite vehicle catalog. Powered by Spring Boot and React.
        </p>
        <div className="footer-divider"></div>
        <div className="footer-bottom">
          <div className="footer-copy">
            <FaRegCopyright className="copy-icon" />
            <span>{new Date().getFullYear()} AutoVibe Inc. All rights reserved.</span>
          </div>
          <div className="footer-socials">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
              <FaGithub />
            </a>
            <a href="mailto:support@autovibe.com" className="social-link" aria-label="Email support">
              <FaEnvelope />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
