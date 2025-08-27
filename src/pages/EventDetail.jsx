import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import http from '../libraries/http';
import { socketService } from '../services/socket';

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Initialize socket and fetch data
  useEffect(() => {
    if (isAuthenticated()) {
      socketService.connect();
      fetchEvent();
      fetchFeedback();
      checkIfJoined();

      // Socket event listeners
      socketService.onSlotsUpdated(handleSlotsUpdate);
      socketService.onEventUpdated(handleEventUpdate);
      socketService.onEventDeleted(handleEventDeleted);

      return () => {
        socketService.offSlotsUpdated(handleSlotsUpdate);
        socketService.offEventUpdated(handleEventUpdate);
        socketService.offEventDeleted(handleEventDeleted);
      };
    }
  }, [isAuthenticated, id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/api/events/${id}`);
      
      if (response.data.status === 'success') {
        setEvent(response.data.data);
      } else {
        setError('Event not found');
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await http.get(`/api/events/${id}/feedback`);
      
      if (response.data.status === 'success') {
        setFeedback(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
    }
  };

  const checkIfJoined = async () => {
    try {
      // Try to get from server first
      try {
        const response = await http.get('/api/events/my-events');
        if (response.data.status === 'success') {
          const joinedEventIds = response.data.data.map(event => event.id);
          setIsJoined(joinedEventIds.includes(parseInt(id)));
          return;
        }
      } catch (err) {
        console.log('Using localStorage fallback for joined status check');
      }

      // Fallback: check localStorage
      const localJoinedEvents = JSON.parse(localStorage.getItem('joinedEvents') || '[]');
      setIsJoined(localJoinedEvents.includes(parseInt(id)));
    } catch (err) {
      console.error('Error checking joined status:', err);
    }
  };

  const handleJoinEvent = async () => {
    try {
      const response = await http.post(`/api/events/${id}/rsvp`);
      
      if (response.data.status === 'success') {
        setIsJoined(true);
        
        // Update localStorage
        const currentJoined = JSON.parse(localStorage.getItem('joinedEvents') || '[]');
        if (!currentJoined.includes(parseInt(id))) {
          currentJoined.push(parseInt(id));
          localStorage.setItem('joinedEvents', JSON.stringify(currentJoined));
        }
        
        socketService.joinEvent(parseInt(id), user.id);
        setEvent(prev => ({ ...prev, available_slots: prev.available_slots - 1 }));
      }
    } catch (err) {
      console.error('Error joining event:', err);
      setError('Failed to join event');
    }
  };

  const handleLeaveEvent = async () => {
    try {
      const response = await http.delete(`/api/events/${id}/rsvp`);
      
      if (response.data.status === 'success') {
        setIsJoined(false);
        
        // Update localStorage
        const currentJoined = JSON.parse(localStorage.getItem('joinedEvents') || '[]');
        const updatedJoined = currentJoined.filter(eventId => eventId !== parseInt(id));
        localStorage.setItem('joinedEvents', JSON.stringify(updatedJoined));
        
        socketService.leaveEvent(parseInt(id), user.id);
        setEvent(prev => ({ ...prev, available_slots: prev.available_slots + 1 }));
      }
    } catch (err) {
      console.error('Error leaving event:', err);
      setError('Failed to leave event');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    try {
      setSubmittingFeedback(true);
      const response = await http.post(`/api/events/${id}/feedback`, {
        rating: newRating,
        comment: newComment
      });
      
      if (response.data.status === 'success') {
        setNewRating(5);
        setNewComment('');
        fetchFeedback(); // Refresh feedback list
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Socket event handlers
  const handleSlotsUpdate = (data) => {
    if (data.eventId === parseInt(id)) {
      setEvent(prev => ({ ...prev, available_slots: data.availableSlots }));
    }
  };

  const handleEventUpdate = (data) => {
    if (data.eventId === parseInt(id)) {
      setEvent(prev => ({ ...prev, ...data.updatedFields }));
    }
  };

  const handleEventDeleted = (data) => {
    if (data.eventId === parseInt(id)) {
      navigate('/browse-events');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}}>
        <Header />
        <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 80px)', paddingTop: '80px'}}>
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}}>
        <Header />
        <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 80px)', paddingTop: '80px'}}>
          <div className="text-center text-white">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold mb-2">{error}</h3>
            <button
              onClick={() => navigate('/browse-events')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'soccer': return '⚽';
      case 'basketball': return '🏀';
      case 'running': return '🏃';
      default: return '🏆';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const averageRating = feedback.length > 0 
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : 0;

  const isCreator = user?.id === event?.created_by;
  const isPastEvent = new Date(event?.time) < new Date();

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}}>
      <Header />
      
      <div className="container mx-auto px-4" style={{paddingTop: '100px'}}>
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white/70 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Event Details Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl mr-4">
                  {getCategoryIcon(event.category)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
                  <div className="flex items-center space-x-4">
                    <span className="bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-lg text-blue-300 text-sm capitalize">
                      {event.category}
                    </span>
                    {isCreator && (
                      <span className="bg-yellow-500/20 border border-yellow-500/30 px-3 py-1 rounded-lg text-yellow-300 text-sm">
                        Your Event
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">
                  {event.available_slots}/{event.total_slots}
                </div>
                <div className="text-white/70 text-sm">Available Slots</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Event Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-white/80">
                    <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <svg className="w-5 h-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(event.time)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Rating</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-yellow-400">{averageRating}</div>
                  <div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className={`text-xl ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-400'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="text-white/60 text-sm">({feedback.length} reviews)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
              <p className="text-white/80 leading-relaxed">{event.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {isJoined ? (
                <button
                  onClick={handleLeaveEvent}
                  disabled={isCreator}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isCreator 
                      ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' 
                      : 'bg-red-600/80 text-white hover:bg-red-700 border border-red-500/50'
                  }`}
                >
                  {isCreator ? 'You Created This Event' : 'Leave Event'}
                </button>
              ) : (
                <button
                  onClick={handleJoinEvent}
                  disabled={event.available_slots === 0 || isCreator}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    event.available_slots === 0 || isCreator
                      ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                  }`}
                >
                  {event.available_slots === 0 ? 'Event Full' : isCreator ? 'Your Event' : 'Join Event'}
                </button>
              )}
            </div>
          </div>

          {/* Feedback Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-semibold text-white mb-6">Reviews & Feedback</h3>

            {/* Submit Feedback (only for joined users and past events) */}
            {isJoined && isPastEvent && (
              <form onSubmit={handleSubmitFeedback} className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">Leave Your Review</h4>
                
                <div className="mb-4">
                  <label className="block text-white/80 text-sm font-medium mb-2">Rating</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className={`text-2xl ${star <= newRating ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-300`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-white/60 ml-4">{newRating}/5</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-white/80 text-sm font-medium mb-2">Comment</label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}

            {/* Feedback List */}
            {feedback.length > 0 ? (
              <div className="space-y-4">
                {feedback.map((item) => (
                  <div key={item.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold text-sm">
                            {item.user_name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <span className="text-white font-medium">{item.user_name}</span>
                      </div>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className={`text-sm ${star <= item.rating ? 'text-yellow-400' : 'text-gray-400'}`}>
                            ★
                          </span>
                        ))}
                        <span className="text-white/60 text-sm ml-2">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-white/80">{item.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white/60 py-8">
                <div className="text-4xl mb-4">💬</div>
                <p>No reviews yet. Be the first to leave feedback!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
