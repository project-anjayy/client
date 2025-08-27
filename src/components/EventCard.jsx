import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event, isJoined, onJoin, onLeave, user, showCountdown = false }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [eventStatus, setEventStatus] = useState('upcoming'); // upcoming, ongoing, completed

  // Calculate event status and time
  useEffect(() => {
    const updateEventStatus = () => {
      const eventTime = new Date(event.time);
      const now = new Date();
      const eventDuration = (event.duration || 90) * 60 * 1000; // Convert minutes to milliseconds
      const eventEndTime = new Date(eventTime.getTime() + eventDuration);
      
      const timeDifference = eventTime.getTime() - now.getTime();
      const timeToEnd = eventEndTime.getTime() - now.getTime();

      // Determine event status
      if (now < eventTime) {
        setEventStatus('upcoming');
        setIsExpired(false);
      } else if (now >= eventTime && now < eventEndTime) {
        setEventStatus('ongoing');
        setIsExpired(true);
      } else {
        setEventStatus('completed');
        setIsExpired(true);
      }

      // Calculate time display
      if (showCountdown && event.time) {
        if (timeDifference > 0) {
          const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

          if (days > 0) {
            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
          } else if (hours > 0) {
            setTimeLeft(`${hours}h ${minutes}m`);
          } else {
            setTimeLeft(`${minutes}m`);
          }
        } else if (timeToEnd > 0) {
          const hoursLeft = Math.floor(timeToEnd / (1000 * 60 * 60));
          const minutesLeft = Math.floor((timeToEnd % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hoursLeft}h ${minutesLeft}m remaining`);
        } else {
          setTimeLeft('Event Completed');
        }
      }
    };

    updateEventStatus();
    const interval = setInterval(updateEventStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [event.time, event.duration, showCountdown]);

  const getStatusBadge = () => {
    switch (eventStatus) {
      case 'upcoming':
        return (
          <div className="bg-blue-500/20 border border-blue-500/30 px-2 py-1 rounded-lg">
            <span className="text-blue-300 text-xs font-medium">Upcoming</span>
          </div>
        );
      case 'ongoing':
        return (
          <div className="bg-green-500/20 border border-green-500/30 px-2 py-1 rounded-lg">
            <span className="text-green-300 text-xs font-medium">Ongoing</span>
          </div>
        );
      case 'completed':
        return (
          <div className="bg-gray-500/20 border border-gray-500/30 px-2 py-1 rounded-lg">
            <span className="text-gray-300 text-xs font-medium">Completed</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'soccer':
        return '⚽';
      case 'basketball':
        return '🏀';
      case 'running':
        return '🏃';
      default:
        return '🏆';
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'soccer':
        return 'from-green-500 to-blue-500';
      case 'basketball':
        return 'from-orange-500 to-red-500';
      case 'running':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-blue-500 to-purple-500';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isFull = event.available_slots === 0;
  const isCreator = user?.id === event.created_by;
  const isCompleted = eventStatus === 'completed';
  const cannotJoin = isFull || isCreator || isCompleted;
  const cannotLeave = isCreator || isCompleted;
  const slotsPercentage = (event.available_slots / event.total_slots) * 100;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center min-w-0 flex-1">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${getCategoryColor(event.category)} flex items-center justify-center text-xl sm:text-2xl mr-3 flex-shrink-0`}>
            {getCategoryIcon(event.category)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-bold text-base sm:text-lg truncate">{event.title}</h3>
            <p className="text-white/60 text-xs sm:text-sm capitalize">{event.category}</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 ml-2">
          {isCreator && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 px-2 py-1 rounded-lg">
              <span className="text-yellow-300 text-xs font-medium">Creator</span>
            </div>
          )}
          {getStatusBadge()}
        </div>
      </div>

      {/* Countdown (if enabled) */}
      {showCountdown && (
        <div className={`mb-4 p-3 rounded-xl ${
          eventStatus === 'completed' ? 'bg-gray-500/20 border border-gray-500/30' :
          eventStatus === 'ongoing' ? 'bg-green-500/20 border border-green-500/30' :
          'bg-blue-500/20 border border-blue-500/30'
        }`}>
          <div className="flex items-center justify-center">
            <span className={`text-sm font-medium ${
              eventStatus === 'completed' ? 'text-gray-300' :
              eventStatus === 'ongoing' ? 'text-green-300' :
              'text-blue-300'
            }`}>
              {eventStatus === 'completed' ? '🏁 Event Completed' :
               eventStatus === 'ongoing' ? `🔴 Live: ${timeLeft}` :
               `⏱️ ${timeLeft} to start`}
            </span>
          </div>
        </div>
      )}

      {/* Description */}
      <p className="text-white/70 text-sm mb-4 line-clamp-2">{event.description}</p>

      {/* Event Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-white/80 text-sm">
          <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{event.location}</span>
        </div>
        
        <div className="flex items-center text-white/80 text-sm">
          <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(event.time)}</span>
        </div>
      </div>

      {/* Slots Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/70 text-sm">Available Slots</span>
          <span className="text-white font-medium text-sm">
            {event.available_slots}/{event.total_slots}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              slotsPercentage > 50 ? 'bg-green-500' : 
              slotsPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${slotsPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex flex-col sm:flex-row gap-2">
        {isJoined ? (
          <button
            onClick={onLeave}
            disabled={cannotLeave}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
              cannotLeave
                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' 
                : 'bg-red-600/80 text-white hover:bg-red-700 border border-red-500/50 hover:border-red-400'
            }`}
          >
            {isCompleted ? 'Event Completed' : 
             isCreator ? 'Your Event' : 'Leave Event'}
          </button>
        ) : (
          <button
            onClick={onJoin}
            disabled={cannotJoin}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
              cannotJoin
                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 border border-blue-500/50 hover:border-blue-400'
            }`}
          >
            {isCompleted ? 'Event Completed' :
             isFull ? 'Event Full' : 
             isCreator ? 'Your Event' : 'Join Event'}
          </button>
        )}
        
        {/* Details Button */}
        <button 
          onClick={() => navigate(`/event/${event.id}`)}
          className="bg-white/10 border border-white/20 hover:border-white/40 text-white px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center justify-center mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center text-green-400 text-xs">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Real-time updates
        </div>
      </div>
    </div>
  );
};

export default EventCard;
