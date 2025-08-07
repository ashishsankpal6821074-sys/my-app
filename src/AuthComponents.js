import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './AuthComponents.css';

const AuthComponents = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    organizationCode: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, signup } = useAuth();

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return '';
  };

  const validateName = (name) => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters long';
    return '';
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const validateOrganizationCode = (code) => {
    if (!code.trim()) return 'Organization code is required';
    if (code.trim().length < 2) return 'Organization code must be at least 2 characters long';
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

    // Validate fields
    const newErrors = {};
    
    if (isLogin) {
      newErrors.email = validateEmail(formData.email);
      newErrors.password = validatePassword(formData.password);
    } else {
      newErrors.name = validateName(formData.name);
      newErrors.email = validateEmail(formData.email);
      newErrors.password = validatePassword(formData.password);
      newErrors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
      newErrors.organizationCode = validateOrganizationCode(formData.organizationCode);
    }

    // Remove empty error messages
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);

    // If no errors, proceed with authentication
    if (Object.keys(newErrors).length === 0) {
      try {
        let result;
        
        if (isLogin) {
          result = await login(formData.email, formData.password);
        } else {
          result = await signup({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            department: formData.department,
            organizationCode: formData.organizationCode
          });
        }

        if (!result.success) {
          setErrors({ general: result.error });
        }
        // If successful, the auth context will handle the redirect
      } catch (error) {
        console.error('Authentication failed:', error);
        setErrors({ general: 'Authentication failed. Please try again.' });
      }
    }

    setIsSubmitting(false);
  };

  // Switch between login and signup
  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      department: '',
      organizationCode: ''
    });
    setErrors({});
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-pattern"></div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="company-logo-auth">
            <span className="logo-icon-auth">🚀</span>
            <span className="company-name-auth">Aexonic Technologies</span>
          </div>
          <h2 className="auth-title">
            {isLogin ? 'Welcome Back' : 'Join Your Team'}
          </h2>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Sign in to access your AI Prompt Manager' 
              : 'Create your account to start managing AI prompts'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              {errors.general}
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email address"
              disabled={isSubmitting}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
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
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your password"
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="department" className="form-label">Department (Optional)</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Engineering, Marketing, HR"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="organizationCode" className="form-label">Organization Code</label>
                <input
                  type="text"
                  id="organizationCode"
                  name="organizationCode"
                  value={formData.organizationCode}
                  onChange={handleInputChange}
                  className={`form-input ${errors.organizationCode ? 'error' : ''}`}
                  placeholder="Enter 'aexonic-tech' for Aexonic or your org code"
                  disabled={isSubmitting}
                />
                {errors.organizationCode && <span className="error-message">{errors.organizationCode}</span>}
                <small className="form-hint">
                  Use "aexonic-tech" to join Aexonic Technologies or ask your admin for your organization code.
                </small>
              </div>
            </>
          )}

          <button
            type="submit"
            className={`auth-button ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (isLogin ? 'Signing In...' : 'Creating Account...') 
              : (isLogin ? 'Sign In' : 'Create Account')
            }
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-switch">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="switch-button"
              onClick={switchMode}
              disabled={isSubmitting}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

          {isLogin && (
            <div className="demo-credentials">
              <p className="demo-title">Demo Credentials:</p>
              <p className="demo-info">
                Create a new account with organization code "aexonic-tech" 
                or use any email/password combination to test the system.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthComponents;