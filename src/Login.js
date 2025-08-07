import React, { useState } from 'react';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({
    emailOrMobile: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateEmailOrMobile = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    
    if (!value.trim()) {
      return 'Email or mobile number is required';
    }
    
    if (!emailRegex.test(value) && !mobileRegex.test(value)) {
      return 'Please enter a valid email address or mobile number';
    }
    
    return '';
  };

  const validatePassword = (value) => {
    if (!value) {
      return 'Password is required';
    }
    
    if (value.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    return '';
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));


    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all fields
    const newErrors = {};
    newErrors.emailOrMobile = validateEmailOrMobile(formData.emailOrMobile);
    newErrors.password = validatePassword(formData.password);

    // Remove empty error messages
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) {
        delete newErrors[key];
      }
    });

    setErrors(newErrors);

    // If no errors, proceed with login
    if (Object.keys(newErrors).length === 0) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Login successful:', formData);
        alert('Login successful!');
        
        // Reset form
        setFormData({
          emailOrMobile: '',
          password: ''
        });
      } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed. Please try again.');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Please sign in to your account</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="emailOrMobile" className="form-label">
              Email or Mobile Number
            </label>
            <input
              type="text"
              id="emailOrMobile"
              name="emailOrMobile"
              value={formData.emailOrMobile}
              onChange={handleInputChange}
              className={`form-input ${errors.emailOrMobile ? 'error' : ''}`}
              placeholder="Enter your email or mobile number"
              disabled={isSubmitting}
            />
            {errors.emailOrMobile && (
              <span className="error-message">{errors.emailOrMobile}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              disabled={isSubmitting}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className={`login-button ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <a href="#forgot" className="forgot-link">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;