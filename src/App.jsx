import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AiChatPage from './pages/AiChatPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai-chat" element={<AiChatPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
