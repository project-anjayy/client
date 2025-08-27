import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import Header from '../components/Header';
import http from '../libraries/http';
import { socketService } from '../services/socket';

function MyEvents() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinedEventIds, setJoinedEventIds] = useState(new Set());

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Initialize socket connection and fetch data
  useEffect(() => {
    if (isAuthenticated()) {
      // Connect to socket
      socketService.connect();
      
      // Fetch user's events
      fetchMyEvents();

      // Socket event listeners
      socketService.onSlotsUpdated(handleSlotsUpdate);
      socketService.onEventUpdated(handleEventUpdate);
      socketService.onEventDeleted(handleEventDeleted);

      return () => {
        // Cleanup socket listeners
        socketService.offSlotsUpdated(handleSlotsUpdate);
        socketService.offEventUpdated(handleEventUpdate);
        socketService.offEventDeleted(handleEventDeleted);
      };
    }
  }, [isAuthenticated]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      
      // Get user's joined events from the server
      const response = await http.get('/api/events/my-events');
      
      if (response.data.status === 'success') {
        setMyEvents(response.data.data);
        
        // Create a set of joined event IDs for tracking
        const joinedIds = response.data.data.map(event => event.id);
        setJoinedEventIds(new Set(joinedIds));
      } else {
        setError('Failed to fetch your events');
      }
    } catch (err) {
      console.error('Error fetching my events:', err);
      
      if (err.response?.status === 401) {
        setError('Please log in again to view your events');
        navigate('/login');
      } else {
        setError('Failed to fetch your events. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      const response = await http.delete(`/api/events/${eventId}/rsvp`);
      
      if (response.data.status === 'success') {
        // Remove event from local state
        setMyEvents(prev => prev.filter(event => event.id !== eventId));
        
        // Update joined events tracking
        setJoinedEventIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
        
        // Emit socket event for real-time updates
        socketService.leaveEvent(eventId, user.id);
      }
    } catch (err) {
      console.error('Error leaving event:', err);
      setError('Failed to leave event');
    }
  };

  // Socket event handlers
  const handleSlotsUpdate = (data) => {
    const { eventId, availableSlots } = data;
    setMyEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, available_slots: availableSlots }
        : event
    ));
  };

  const handleEventUpdate = (data) => {
    const { eventId, updatedFields } = data;
    setMyEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, ...updatedFields }
        : event
    ));
  };

  const handleEventDeleted = (data) => {
    const { eventId } = data;
    setMyEvents(prev => prev.filter(event => event.id !== eventId));
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}}>
        <Header />
        <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 80px)', paddingTop: '80px'}}>
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading your events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}}>
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{paddingTop: '100px'}}>
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">Events</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg">
              Manage your joined events and stay updated
            </p>
            
            {/* Refresh Button */}
            <button
              onClick={fetchMyEvents}
              disabled={loading}
              className="mt-4 bg-blue-600/80 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : '🔄 Refresh Events'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 text-red-300">
              {error}
              <button 
                onClick={() => setError(null)} 
                className="float-right text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          )}

          {/* Events Grid */}
          {myEvents.length === 0 ? (
            <div className="text-center text-white/60 py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">No events joined yet</h3>
              <p className="mb-6">Start by browsing and joining some exciting sports events!</p>
              <button
                onClick={() => navigate('/browse-events')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {myEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isJoined={true}
                  onLeave={() => handleLeaveEvent(event.id)}
                  user={user}
                  showCountdown={true}
                />
              ))}
            </div>
          )}

          {/* Stats */}
          {myEvents.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-white">
                <div>
                  <div className="text-2xl font-bold text-green-400">{myEvents.length}</div>
                  <div className="text-white/70 text-sm">Joined Events</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {myEvents.filter(event => new Date(event.time) > new Date()).length}
                  </div>
                  <div className="text-white/70 text-sm">Upcoming</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {myEvents.filter(event => new Date(event.time) <= new Date()).length}
                  </div>
                  <div className="text-white/70 text-sm">Past Events</div>
                </div>
              </div>
            </div>
          )}
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

export default MyEvents;
