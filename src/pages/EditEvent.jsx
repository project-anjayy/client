import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import http from '../libraries/http';
import { showSuccess, showError, showLoading, closeLoading } from '../utils/sweetAlert';

const EditEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    time: '',
    total_slots: '',
    duration: '90'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [originalEvent, setOriginalEvent] = useState(null);

  // Predefined categories - must match database ENUM values
  const categories = [
    'Soccer', 'Basketball', 'Tennis', 'Volleyball', 'Badminton',
    'Swimming', 'Running', 'Cycling', 'Boxing', 'Martial Arts',
    'Gym/Fitness', 'Yoga', 'Dance', 'Other'
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated() && id) {
      fetchEvent();
    }
  }, [isAuthenticated, id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/api/events/${id}`);
      
      if (response.data.status === 'success') {
        const event = response.data.data;
        
        // Check if current user is the creator
        if (event.created_by !== user.id) {
          setError('You are not authorized to edit this event');
          return;
        }

        // Check if event is still upcoming (can only edit upcoming events)
        const eventTime = new Date(event.time);
        const now = new Date();
        if (eventTime <= now) {
          setError('Cannot edit past or ongoing events');
          return;
        }

        setOriginalEvent(event);

        // Format datetime for input (avoid timezone conversion)
        console.log('Original event time from server:', event.time);
        const eventDateTime = new Date(event.time);
        console.log('Parsed event time:', eventDateTime);
        // Get local timezone offset and adjust
        const timezoneOffset = eventDateTime.getTimezoneOffset() * 60000;
        const localDateTime = new Date(eventDateTime.getTime() - timezoneOffset);
        const formattedDateTime = localDateTime.toISOString().slice(0, 16);
        console.log('Formatted datetime for input:', formattedDateTime);

        setFormData({
          title: event.title || '',
          description: event.description || '',
          category: event.category || '',
          location: event.location || '',
          time: formattedDateTime,
          total_slots: event.total_slots?.toString() || '',
          duration: event.duration?.toString() || '90'
        });
      } else {
        setError('Event not found');
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      if (err.response?.status === 404) {
        setError('Event not found');
      } else {
        setError('Failed to load event details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Validation
    if (!formData.title.trim()) {
      showError('Validation Error', 'Event title is required');
      setSaving(false);
      return;
    }

    if (!formData.category) {
      showError('Validation Error', 'Please select a category');
      setSaving(false);
      return;
    }

    if (!formData.location.trim()) {
      showError('Validation Error', 'Location is required');
      setSaving(false);
      return;
    }

    if (!formData.time) {
      showError('Validation Error', 'Event date and time is required');
      setSaving(false);
      return;
    }

    // Check if event time is in the future
    const eventTime = new Date(formData.time);
    const now = new Date();
    if (eventTime <= now) {
      showError('Validation Error', 'Event time must be in the future');
      setSaving(false);
      return;
    }

    const newTotalSlots = parseInt(formData.total_slots);
    if (!newTotalSlots || newTotalSlots < 1) {
      showError('Validation Error', 'Total slots must be at least 1');
      setSaving(false);
      return;
    }

    // Check if new total slots is not less than current participants
    const currentParticipants = originalEvent.total_slots - originalEvent.available_slots;
    if (newTotalSlots < currentParticipants) {
      showError('Validation Error', `Total slots cannot be less than current participants (${currentParticipants})`);
      setSaving(false);
      return;
    }

    const newDuration = parseInt(formData.duration);
    if (!newDuration || newDuration < 1) {
      showError('Validation Error', 'Duration must be at least 1 minute');
      setSaving(false);
      return;
    }

    try {
      showLoading('Updating your event...');

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        location: formData.location.trim(),
        time: new Date(formData.time).toISOString(),
        total_slots: newTotalSlots,
        duration: newDuration
      };

      console.log('Updating event with payload:', payload);

      const response = await http.put(`/api/events/${id}`, payload);

      closeLoading();

      if (response.data.status === 'success') {
        await showSuccess('Event Updated!', 'Your event has been updated successfully.');
        navigate('/manage-events');
      } else {
        showError('Update Failed', response.data.message || 'Failed to update event');
      }
    } catch (err) {
      console.error('Error updating event:', err);
      closeLoading();

      let errorMessage = 'An unexpected error occurred';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      showError('Update Failed', errorMessage);
    }

    setSaving(false);
  };

  // Helper to get minimum datetime (current time)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
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
          <div className="text-center">
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 text-red-300 max-w-md">
              <h3 className="text-xl font-bold mb-2">Error</h3>
              <p className="mb-4">{error}</p>
              <button
                onClick={() => navigate('/manage-events')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-all duration-300"
              >
                Back to Manage Events
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}}>
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{paddingTop: '100px', paddingBottom: '50px'}}>
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Edit <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Event</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg">
              Update your event details
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Title */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
                  placeholder="e.g., Sunday Morning Football Match"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-300 resize-none"
                  placeholder="Tell people what this event is about..."
                />
              </div>

              {/* Category and Location Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-slate-800 text-white">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
                    placeholder="e.g., Central Park, Court 1"
                    required
                  />
                </div>
              </div>

              {/* Date & Time and Duration Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    min={getMinDateTime()}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
                    placeholder="90"
                    required
                  />
                </div>
              </div>

              {/* Total Slots */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Total Slots *
                </label>
                <input
                  type="number"
                  name="total_slots"
                  value={formData.total_slots}
                  onChange={handleInputChange}
                  min={originalEvent ? originalEvent.total_slots - originalEvent.available_slots : 1}
                  max="100"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
                  required
                />
                {originalEvent && (
                  <p className="text-white/60 text-sm mt-1">
                    Current participants: {originalEvent.total_slots - originalEvent.available_slots}
                    {' '}(minimum slots required)
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/manage-events')}
                  className="flex-1 bg-white/10 text-white py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Update Event'
                  )}
                </button>
              </div>
            </form>
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
};

export default EditEvent;
