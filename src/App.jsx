import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BrowseEvents from './pages/BrowseEvents';
import MyEvents from './pages/MyEvents';
import EventDetail from './pages/EventDetail';
import AiChatPage from './pages/AiChatPage';
import CreateEvent from './pages/CreateEvent';
import ManageEvents from './pages/ManageEvents';
import EditEvent from './pages/EditEvent';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Homepage />} />
            
            {/* Public routes - redirect to dashboard if already logged in */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Register />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected routes - require authentication */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/browse-events" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <BrowseEvents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-events" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <MyEvents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-event" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <CreateEvent />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage-events" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <ManageEvents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit-event/:id" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <EditEvent />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/event/:id" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <EventDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-chat" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <AiChatPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
