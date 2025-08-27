import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import Header from '../components/Header';
import http from '../libraries/http';
import { socketService } from '../services/socket';

function BrowseEvents() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [joinedEvents, setJoinedEvents] = useState(new Set());

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
      
      // Fetch events and user's joined events
      fetchEvents();
      fetchUserEvents();

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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await http.get('/api/events');
      
      if (response.data.status === 'success') {
        setEvents(response.data.data);
      } else {
        setError('Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEvents = async () => {
    try {
      // Try to get user's joined events from server
      try {
        const response = await http.get('/api/events/my-events');
        if (response.data.status === 'success') {
          const userEventIds = new Set(response.data.data.map(event => event.id));
          setJoinedEvents(userEventIds);
          
          // Also update localStorage for consistency
          localStorage.setItem('joinedEvents', JSON.stringify([...userEventIds]));
          return;
        }
      } catch (err) {
        console.log('Using localStorage fallback for joined events tracking');
      }

      // Fallback: get from localStorage
      const localJoinedEvents = JSON.parse(localStorage.getItem('joinedEvents') || '[]');
      setJoinedEvents(new Set(localJoinedEvents));
    } catch (err) {
      console.error('Error fetching user events:', err);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      const response = await http.post(`/api/events/${eventId}/rsvp`);
      
      if (response.data.status === 'success') {
        setJoinedEvents(prev => new Set([...prev, eventId]));
        
        // Update localStorage
        const currentJoined = JSON.parse(localStorage.getItem('joinedEvents') || '[]');
        if (!currentJoined.includes(eventId)) {
          currentJoined.push(eventId);
          localStorage.setItem('joinedEvents', JSON.stringify(currentJoined));
        }
        
        // Emit socket event for real-time updates
        socketService.joinEvent(eventId, user.id);
        
        // Update local event state optimistically
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, available_slots: event.available_slots - 1 }
            : event
        ));
      }
    } catch (err) {
      console.error('Error joining event:', err);
      setError('Failed to join event');
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      const response = await http.delete(`/api/events/${eventId}/rsvp`);
      
      if (response.data.status === 'success') {
        setJoinedEvents(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
        
        // Update localStorage
        const currentJoined = JSON.parse(localStorage.getItem('joinedEvents') || '[]');
        const updatedJoined = currentJoined.filter(id => id !== eventId);
        localStorage.setItem('joinedEvents', JSON.stringify(updatedJoined));
        
        // Emit socket event for real-time updates
        socketService.leaveEvent(eventId, user.id);
        
        // Update local event state optimistically
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, available_slots: event.available_slots + 1 }
            : event
        ));
      }
    } catch (err) {
      console.error('Error leaving event:', err);
      setError('Failed to leave event');
    }
  };

  // Socket event handlers
  const handleSlotsUpdate = (data) => {
    const { eventId, availableSlots } = data;
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, available_slots: availableSlots }
        : event
    ));
  };

  const handleEventUpdate = (data) => {
    const { eventId, updatedFields } = data;
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, ...updatedFields }
        : event
    ));
  };

  const handleEventDeleted = (data) => {
    const { eventId } = data;
    setEvents(prev => prev.filter(event => event.id !== eventId));
    setJoinedEvents(prev => {
      const newSet = new Set(prev);
      newSet.delete(eventId);
      return newSet;
    });
  };

  // Filter events based on search and category
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           event.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}}>
        <Header />
        <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 80px)', paddingTop: '80px'}}>
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}}>
      <Header />
      
      <div className="container mx-auto px-4" style={{paddingTop: '100px'}}>
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Events</span>
            </h1>
            <p className="text-white/80 text-lg">
              Discover exciting sports events and connect with fellow athletes
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute right-3 top-3 h-5 w-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all" className="bg-slate-800">All Categories</option>
                <option value="soccer" className="bg-slate-800">Soccer ⚽</option>
                <option value="basketball" className="bg-slate-800">Basketball 🏀</option>
                <option value="running" className="bg-slate-800">Running 🏃</option>
              </select>
            </div>
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
          {filteredEvents.length === 0 ? (
            <div className="text-center text-white/60 py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p>Try adjusting your search criteria or check back later for new events.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isJoined={joinedEvents.has(event.id)}
                  onJoin={() => handleJoinEvent(event.id)}
                  onLeave={() => handleLeaveEvent(event.id)}
                  user={user}
                />
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-white">
              <div>
                <div className="text-2xl font-bold text-blue-400">{events.length}</div>
                <div className="text-white/70 text-sm">Total Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{joinedEvents.size}</div>
                <div className="text-white/70 text-sm">Your Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">{filteredEvents.length}</div>
                <div className="text-white/70 text-sm">Filtered Results</div>
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

export default BrowseEvents;
