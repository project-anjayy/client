import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket) {
      return this.socket;
    }

    const token = localStorage.getItem('token');
    
    this.socket = io('http://localhost:3001', {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      // Connected
    });

    this.socket.on('disconnect', () => {
      // Disconnected
    });

    this.socket.on('connect_error', (error) => {
      // Connection error
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listener reference for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from stored listeners
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  // Event-specific methods
  joinEvent(eventId, userId) {
    this.emit('joinEvent', { eventId, userId });
  }

  leaveEvent(eventId, userId) {
    this.emit('leaveEvent', { eventId, userId });
  }

  updateEvent(eventId, payload) {
    this.emit('updateEvent', { eventId, payload });
  }

  // Subscribe to event countdown
  subscribeToEvent(eventId) {
    this.emit('subscribeToEvent', { eventId });
  }

  // Unsubscribe from event countdown
  unsubscribeFromEvent(eventId) {
    this.emit('unsubscribeFromEvent', { eventId });
  }

  // Listen for server events
  onSlotsUpdated(callback) {
    this.on('slotsUpdated', callback);
  }

  onEventUpdated(callback) {
    this.on('eventUpdated', callback);
  }

  onEventDeleted(callback) {
    this.on('eventDeleted', callback);
  }

  onEventCreated(callback) {
    this.on('eventCreated', callback);
  }

  onCountdownUpdate(callback) {
    this.on('countdownUpdate', callback);
  }

  // Remove listeners
  offSlotsUpdated(callback) {
    this.off('slotsUpdated', callback);
  }

  offEventUpdated(callback) {
    this.off('eventUpdated', callback);
  }

  offEventDeleted(callback) {
    this.off('eventDeleted', callback);
  }

  offEventCreated(callback) {
    this.off('eventCreated', callback);
  }

  offCountdownUpdate(callback) {
    this.off('countdownUpdate', callback);
  }
}

export const socketService = new SocketService();
