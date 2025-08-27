import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Homepage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    navigate('/login');
  };

  // Custom styles for shimmer animation
  const shimmerStyles = `
    .hero-card {
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .hero-card::before {
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
    
    .hero-card:hover::before {
      left: 100%;
    }
    
    .hero-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.4) !important;
    }
    
    .login-btn {
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .login-btn::before {
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
    
    .login-btn:hover::before {
      left: 100%;
    }
    
    .login-btn:hover {
      transform: translateY(-2px);
      background: rgba(59, 130, 246, 0.8);
    }
    
    .login-btn:active,
    .login-btn:focus {
      transform: translateY(-1px);
      box-shadow: none;
    }
    
    .login-btn-content {
      position: relative;
      z-index: 2;
    }
    
    .sport-icon {
      transition: transform 0.3s ease;
    }
    
    .hero-card:hover .sport-icon {
      transform: scale(1.1);
    }
    
    /* Mobile responsiveness */
    @media (max-width: 640px) {
      .hero-card {
        margin: 0 1rem;
      }
    }
  `;

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}}>
      {/* Add custom styles */}
      <style dangerouslySetInnerHTML={{__html: shimmerStyles}} />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md" style={{padding: '8px 0'}}>
        <div style={{margin: '0 12px'}}>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-2xl mr-2">⚽</span>
                <span className="font-bold text-lg text-white">SportHub</span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleLogin}
                  className="login-btn bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all duration-300"
                >
                  <span className="login-btn-content">Login</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex items-center justify-content-center text-white px-4" style={{minHeight: '100vh', paddingTop: '80px'}}>
        <div className="text-center w-full max-w-2xl mx-auto">
          <div className="hero-card bg-black/20 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-1" 
                   style={{width: '100px', height: '100px'}}>
                <div className="flex items-center justify-center rounded-full bg-white/10 w-full h-full">
                  <span className="text-4xl sport-icon">🏃‍♂️</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">SportHub</span>
              </h1>
              <p className="text-white/80 text-lg mb-8 leading-relaxed">
                Discover amazing sports events, connect with fellow athletes, and never miss out on the action. 
                Join our community of sports enthusiasts today!
              </p>
            </div>
            
            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-2xl">⚽</span>
                </div>
                <h3 className="font-bold text-white mb-2">Soccer</h3>
                <p className="text-white/70 text-sm">Join football matches and tournaments</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <span className="text-2xl">🏀</span>
                </div>
                <h3 className="font-bold text-white mb-2">Basketball</h3>
                <p className="text-white/70 text-sm">Find pickup games and leagues</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <span className="text-2xl">🏃</span>
                </div>
                <h3 className="font-bold text-white mb-2">Running</h3>
                <p className="text-white/70 text-sm">Discover running events and marathons</p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-4">
              <button 
                onClick={handleLogin}
                className="login-btn w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl text-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl"
              >
                <span className="login-btn-content flex items-center justify-center">
                  Get Started
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <p className="text-white/60 text-sm">
                Join thousands of athletes already using SportHub
              </p>
            </div>

            {/* Stats */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">1,200+</div>
                  <div className="text-white/70 text-sm">Active Events</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">5,000+</div>
                  <div className="text-white/70 text-sm">Athletes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">50+</div>
                  <div className="text-white/70 text-sm">Cities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-blue-600/10 to-transparent rounded-full"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-600/10 to-transparent rounded-full"></div>
      </div>
    </div>
  );
}

export default Homepage;
