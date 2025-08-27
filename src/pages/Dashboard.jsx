import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Debug: Log user data
  console.log('Dashboard - Current user data:', user);
  console.log('Dashboard - User name:', user?.name);
  console.log('Dashboard - User full_name:', user?.full_name);
  console.log('Dashboard - LocalStorage user:', localStorage.getItem('user'));
  
  // Parse localStorage data to see raw data
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Dashboard - Parsed localStorage user:', storedUser);
  } catch (e) {
    console.log('Dashboard - Error parsing localStorage user:', e);
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const shimmerStyles = `
    .dashboard-card {
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .dashboard-card::before {
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
    
    .dashboard-card:hover::before {
      left: 100%;
    }
    
    .dashboard-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.4) !important;
    }
    
    .dashboard-btn {
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .dashboard-btn::before {
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
    
    .dashboard-btn:hover::before {
      left: 100%;
    }
    
    .dashboard-btn:hover {
      transform: translateY(-1px);
    }
    
    .dashboard-btn-content {
      position: relative;
      z-index: 2;
    }
  `;

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}}>
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
                <span className="text-white/80 text-sm">Hi, {user?.name || user?.full_name || 'User'}</span>
                <button 
                  onClick={handleLogout}
                  className="dashboard-btn bg-red-600/80 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-all duration-300"
                >
                  <span className="dashboard-btn-content">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center text-white px-4" style={{minHeight: '100vh', paddingTop: '80px'}}>
        <div className="text-center w-full max-w-4xl mx-auto">
          <div className="dashboard-card bg-black/20 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-600 p-1" 
                   style={{width: '100px', height: '100px'}}>
                <div className="flex items-center justify-center rounded-full bg-white/10 w-full h-full">
                  <span className="text-4xl">🎉</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Welcome to your Dashboard!
              </h1>
              <p className="text-white/80 text-lg mb-2">
                Hello, <span className="text-blue-400 font-semibold">{user?.name || 'User'}</span>!
              </p>
              <p className="text-white/60 text-base mb-8">
                You're successfully logged in to SportHub. Start exploring sports events in your area.
              </p>
            </div>
            
            {/* User Info */}
            <div className="dashboard-card bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Your Profile</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div>
                  <label className="text-white/70 text-sm font-medium">Name</label>
                  <p className="text-white text-lg">{user?.name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium">Email</label>
                  <p className="text-white text-lg">{user?.email || 'Not provided'}</p>
                </div>
                {user?.phone_number && (
                  <div>
                    <label className="text-white/70 text-sm font-medium">Phone</label>
                    <p className="text-white text-lg">{user.phone_number}</p>
                  </div>
                )}
                {user?.birth_date && (
                  <div>
                    <label className="text-white/70 text-sm font-medium">Birth Date</label>
                    <p className="text-white text-lg">{new Date(user.birth_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <button 
                onClick={() => navigate('/browse-events')}
                className="dashboard-btn dashboard-card bg-blue-600/20 border border-blue-500/30 rounded-2xl p-6 text-center hover:bg-blue-600/30 transition-all duration-300"
              >
                <div className="dashboard-btn-content">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-2xl">⚽</span>
                  </div>
                  <h3 className="font-bold text-white mb-2">Browse Events</h3>
                  <p className="text-white/70 text-sm">Find sports events near you</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/my-events')}
                className="dashboard-btn dashboard-card bg-green-600/20 border border-green-500/30 rounded-2xl p-6 text-center hover:bg-green-600/30 transition-all duration-300"
              >
                <div className="dashboard-btn-content">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                  <h3 className="font-bold text-white mb-2">My Events</h3>
                  <p className="text-white/70 text-sm">View your joined events</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/ai-chat')}
                className="dashboard-btn dashboard-card bg-purple-600/20 border border-purple-500/30 rounded-2xl p-6 text-center hover:bg-purple-600/30 transition-all duration-300"
              >
                <div className="dashboard-btn-content">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="font-bold text-white mb-2">AI Recommendations</h3>
                  <p className="text-white/70 text-sm">Get personalized suggestions</p>
                </div>
              </button>
            </div>

            {/* Status */}
            <div className="pt-6 border-t border-white/20">
              <p className="text-white/60 text-sm">
                🟢 Connected to SportHub • Last login: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-blue-600/10 to-transparent rounded-full"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-green-600/10 to-transparent rounded-full"></div>
      </div>
    </div>
  );
}

export default Dashboard;
