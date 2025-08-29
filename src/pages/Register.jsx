import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/authService';
import { showSuccess, showError, showLoading, closeLoading } from '../utils/sweetAlert';

const Register = () => {
  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated() && user) {
      console.log('User already authenticated, redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match', 'Please make sure both passwords are identical.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      showError('Password too short', 'Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      console.log('Sending register request with payload:', payload);
      
      showLoading('Creating your account...');
      
      const data = await authAPI.register(payload);
      console.log('Register API Response:', data);

      closeLoading();

      // Check if the response indicates success
      if (data && data.status === 'success') {
        // Registration successful
        await showSuccess('Account Created Successfully!', 'Please login with your new credentials.');
        
        // Redirect to login with pre-filled email
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please login with your credentials.',
            email: formData.email 
          }
        });
      } else {
        // Backend returned error response or invalid format
        console.error('Registration failed - invalid response:', data);
        showError('Registration Failed', data?.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      closeLoading();
      
      // Handle different types of errors
      let errorMessage = '';
      
      if (err.response?.status === 400) {
        // Bad request - likely validation error
        errorMessage = err.response.data?.message || 'Invalid registration data';
      } else if (err.response?.status === 409) {
        // Conflict - email already exists
        errorMessage = 'Email already exists. Please use a different email.';
      } else if (err.response?.data?.message) {
        // Other backend errors
        errorMessage = err.response.data.message;
      } else if (err.message) {
        // Network or other errors
        errorMessage = err.message === 'Network error' ? 'Network error. Please check your connection.' : err.message;
      } else {
        errorMessage = 'An unexpected error occurred. Please try again.';
      }

      showError('Registration Failed', errorMessage);
    }

    setLoading(false);
  };

  const shimmerStyles = `
    .register-card {
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .register-btn {
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .register-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0.2),
        rgba(255, 255, 255, 0.1),
        transparent
      );
      transition: left 0.6s ease;
      z-index: 1;
    }
    
    .register-btn:hover::before {
      left: 100%;
    }
    
    .register-btn:hover {
      transform: translateY(-1px);
    }
    
    .register-btn:active,
    .register-btn:focus {
      transform: translateY(0px);
      box-shadow: none;
    }
    
    .register-btn-content {
      position: relative;
      z-index: 2;
    }
    
    .form-input {
      transition: all 0.3s ease;
    }
    
    .form-input:focus {
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
    }
  `;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}}>
      <style dangerouslySetInnerHTML={{__html: shimmerStyles}} />
      
      {/* Back to Home */}
      <button 
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-50 bg-white/10 backdrop-blur-md text-white p-3 rounded-xl hover:bg-white/20 transition-all duration-300"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <div className="w-full max-w-md">
        <div className="register-card bg-black/20 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-600 p-1" 
                 style={{width: '80px', height: '80px'}}>
              <div className="flex items-center justify-center rounded-full bg-white/10 w-full h-full">
                <span className="text-3xl">🏃‍♂️</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Join SportHub
            </h1>
            <p className="text-white/70">
              Create your account to start discovering sports events
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 rounded-xl text-sm bg-red-500/20 text-red-400 border border-red-500/30">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15"
                placeholder="Enter your password (min 6 characters)"
                required
                minLength={6}
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15"
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="register-btn w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-xl font-bold hover:from-green-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="register-btn-content">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </span>
            </button>
          </form>

          {/* Toggle to Login */}
          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <p className="text-white/70 mb-4">
              Already have an account?
            </p>
            <button
              onClick={() => navigate('/login')}
              className="register-btn bg-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
            >
              <span className="register-btn-content">
                Login Instead
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-green-600/10 to-transparent rounded-full"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-600/10 to-transparent rounded-full"></div>
      </div>
    </div>
  );
}

export default Register;
