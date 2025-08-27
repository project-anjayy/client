import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import http from '../libraries/http';
import { showSuccess, showError, showLoading, closeLoading, showConfirm } from '../utils/sweetAlert';

const ManageEvents = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [myCreatedEvents, setMyCreatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchMyCreatedEvents();
    }
  }, [isAuthenticated]);

  const fetchMyCreatedEvents = async () => {
    try {
      setLoading(true);
      const response = await http.get('/api/events');
      
      if (response.data.status === 'success') {
        // Filter events created by current user
        const myEvents = response.data.data.filter(event => event.created_by === user.id);
        setMyCreatedEvents(myEvents);
      } else {
        setError('Failed to fetch your events');
      }
    } catch (err) {
      console.error('Error fetching created events:', err);
      setError('Failed to fetch your events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    const confirmed = await showConfirm(
      'Delete Event',
      `Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`,
      'Delete',
      'Cancel',
      'error'
    );

    if (confirmed) {
      try {
        showLoading('Deleting event...');
        
        const response = await http.delete(`/api/events/${eventId}`);
        
        closeLoading();
        
        if (response.data.status === 'success') {
          setMyCreatedEvents(prev => prev.filter(event => event.id !== eventId));
          await showSuccess('Event Deleted', 'Event has been deleted successfully.');
        } else {
          showError('Delete Failed', response.data.message || 'Failed to delete event');
        }
      } catch (err) {
        console.error('Error deleting event:', err);
        closeLoading();
        
        let errorMessage = 'Failed to delete event';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        
        showError('Delete Failed', errorMessage);
      }
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const eventTime = new Date(event.time);
    const eventEnd = new Date(eventTime.getTime() + (event.duration || 90) * 60000);
    
    if (now < eventTime) {
      return { status: 'upcoming', color: 'text-green-400', text: 'Upcoming' };
    } else if (now >= eventTime && now < eventEnd) {
      return { status: 'ongoing', color: 'text-yellow-400', text: 'Ongoing' };
    } else {
      return { status: 'completed', color: 'text-gray-400', text: 'Completed' };
    }
  };

  const getParticipantsCount = (event) => {
    return event.total_slots - event.available_slots;
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
              Manage Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Events</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg mb-6">
              Edit, monitor, and manage the events you've created
            </p>
            
            <button
              onClick={() => navigate('/create-event')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              + Create New Event
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

          {/* Events List */}
          {myCreatedEvents.length === 0 ? (
            <div className="text-center text-white/60 py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">No events created yet</h3>
              <p className="mb-6">Start by creating your first sports event!</p>
              <button
                onClick={() => navigate('/create-event')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Create Your First Event
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myCreatedEvents.map((event) => {
                const status = getEventStatus(event);
                const participantsCount = getParticipantsCount(event);
                
                return (
                  <div
                    key={event.id}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Event Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                            <span className="text-2xl">
                              {event.category === 'Football' ? '⚽' :
                               event.category === 'Basketball' ? '🏀' :
                               event.category === 'Tennis' ? '🎾' :
                               event.category === 'Swimming' ? '🏊' :
                               event.category === 'Running' ? '🏃' :
                               '🏃'}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-white">{event.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} bg-white/10`}>
                                {status.text}
                              </span>
                            </div>
                            
                            <div className="space-y-1 text-white/70">
                              <p className="flex items-center gap-2">
                                <span>📍</span> {event.location}
                              </p>
                              <p className="flex items-center gap-2">
                                <span>📅</span> {formatDateTime(event.time)}
                              </p>
                              <p className="flex items-center gap-2">
                                <span>👥</span> {participantsCount}/{event.total_slots} participants
                              </p>
                              <p className="flex items-center gap-2">
                                <span>🏷️</span> {event.category}
                              </p>
                              {event.description && (
                                <p className="text-white/60 mt-2">{event.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => navigate(`/event/${event.id}`)}
                          className="bg-blue-600/80 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300"
                        >
                          View Details
                        </button>
                        
                        {status.status === 'upcoming' && (
                          <button
                            onClick={() => navigate(`/edit-event/${event.id}`)}
                            className="bg-green-600/80 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300"
                          >
                            Edit Event
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                          className="bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats */}
          {myCreatedEvents.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center text-white">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{myCreatedEvents.length}</div>
                  <div className="text-white/70 text-sm">Total Events</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {myCreatedEvents.filter(event => getEventStatus(event).status === 'upcoming').length}
                  </div>
                  <div className="text-white/70 text-sm">Upcoming</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {myCreatedEvents.filter(event => getEventStatus(event).status === 'ongoing').length}
                  </div>
                  <div className="text-white/70 text-sm">Ongoing</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {myCreatedEvents.reduce((total, event) => total + getParticipantsCount(event), 0)}
                  </div>
                  <div className="text-white/70 text-sm">Total Participants</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-blue-600/10 to-transparent rounded-full"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-600/10 to-transparent rounded-full"></div>
      </div>
    </div>
  );
};

export default ManageEvents;
