src/
# SportHub - Complete Sports Events Platform

A modern, full-featured sports events platform built with React, featuring real-time updates, AI recommendations, and comprehensive event management.

## 🚀 Features

### 🔐 Authentication System
- **User Registration & Login**: Secure authentication with JWT tokens
- **Password Hashing**: bcryptjs for secure password storage
- **Protected Routes**: Automatic redirection for unauthorized users
- **Persistent Sessions**: Auto-login with stored tokens

### 🏆 Event Discovery & Management
- **Browse Events**: View all available sports events with filtering
- **Search & Filter**: Search by location, title, or category
- **Category Filtering**: Filter by Soccer ⚽, Basketball 🏀, Running 🏃
- **Real-time Slots**: Live updates of available slots using Socket.IO
- **Event Details**: Comprehensive event information and reviews

### 📱 Real-time Features (Socket.IO)
- **Live Slot Updates**: Real-time available slots when users join/leave
- **Event Updates**: Instant notifications for event changes
- **Event Deletion**: Real-time removal of deleted events
- **Countdown Timer**: Live countdown to event start time

### 🎯 RSVP System
- **Join Events**: One-click RSVP with real-time slot updates
- **Leave Events**: Cancel participation with instant UI feedback
- **My Events**: Dedicated page for managing joined events
- **Status Tracking**: Visual indicators for joined vs available events
- **Creator Protection**: Event creators cannot leave their own events

### ⭐ Feedback & Rating System
- **5-Star Rating**: Rate events after completion
- **Written Reviews**: Leave detailed feedback comments
- **Average Rating**: Calculated ratings display on event cards
- **Review History**: View all reviews for any event

### 🤖 AI Integration
- **Chat Recommendations**: AI-powered event suggestions
- **Smart Filtering**: AI helps clarify sport and location preferences
- **Personalized Suggestions**: Tailored event recommendations

### 📊 User Dashboard
- **Profile Management**: View and manage user information
- **Quick Actions**: Fast navigation to key features
- **Statistics**: Real-time stats on joined events
- **Activity Overview**: Dashboard with user activity summary

## 🛠 Tech Stack

### Frontend
- **React 19.1.1**: Modern React with hooks and context
- **React Router DOM 7.8.2**: Client-side routing
- **TailwindCSS 4.1.12**: Utility-first CSS framework with inline classes
- **Vite 7.1.2**: Fast build tool and dev server
- **Socket.IO Client 4.8.1**: Real-time communication
- **Axios 1.11.0**: HTTP client with interceptors

### Backend APIs Expected
- **Node.js + Express**: RESTful API server
- **PostgreSQL**: Relational database
- **Socket.IO**: Real-time event handling
- **OpenAI API**: AI chat recommendations
- **JWT + bcryptjs**: Authentication and security

## 📁 Project Structure

```

├── components/
│   ├── EventCard.jsx          # Event display card with join/leave
│   └── Header.jsx             # Navigation header with user menu
├── context/
│   └── AuthContext.jsx        # Global authentication state
├── libraries/
│   └── http.js                # Axios configuration with interceptors
├── pages/
│   ├── Homepage.jsx           # Landing page for unauthenticated users
│   ├── LoginPage.jsx          # Authentication page
│   ├── Dashboard.jsx          # Main user dashboard
│   ├── BrowseEvents.jsx       # Event discovery and filtering
│   ├── MyEvents.jsx           # User's joined events management
│   ├── EventDetail.jsx        # Detailed event view with reviews
│   └── AiChatPage.jsx         # AI recommendation chat interface
├── services/
│   ├── socket.js              # Socket.IO service layer
│   ├── api.js                 # API service layer
│   └── authService.js         # Authentication services
└── App.jsx                    # Main app with routing
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/my-events` - Get user's joined events

### RSVP
- `POST /api/events/:id/rsvp` - Join event
- `DELETE /api/events/:id/rsvp` - Leave event

### Feedback
- `GET /api/events/:id/feedback` - Get event reviews
- `POST /api/events/:id/feedback` - Submit review

### AI Recommendations
- `POST /api/events/recommend/chat` - Get AI recommendations

## 🔄 Socket.IO Events

### Client → Server
- `joinEvent` - User joins an event
- `leaveEvent` - User leaves an event
- `updateEvent` - Event details updated

### Server → Client
- `slotsUpdated` - Available slots changed
- `eventUpdated` - Event details changed
- `eventDeleted` - Event was deleted
- `countdownUpdate` - Event countdown update

## 🎨 UI/UX Features

### Design System
- **Glass Morphism**: Modern glassmorphism design with backdrop blur
- **Gradient Backgrounds**: Dynamic gradient overlays and backgrounds
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Dark Theme**: Elegant dark theme throughout the application
- **Smooth Animations**: Hover effects and transitions
- **Interactive Elements**: Button hover states and loading indicators

### User Experience
- **Real-time Updates**: Instant feedback on all user actions
- **Loading States**: Smooth loading indicators and skeletons
- **Error Handling**: User-friendly error messages and recovery
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Mobile Responsive**: Optimized for all device sizes
- **Progressive Enhancement**: Works offline with cached data

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Backend API server running

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd client
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure API endpoint**
Update `src/libraries/http.js` with your backend URL:
```javascript
const http = axios.create({
  baseURL: 'your-backend-url-here',
  // ... other config
});
```

4. **Start development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file:
```env
VITE_API_BASE_URL=your-backend-url
VITE_SOCKET_URL=your-socket-server-url
```

### Socket.IO Configuration
The Socket.IO client automatically connects when users are authenticated and handles:
- Connection management
- Event listeners cleanup
- Automatic reconnection
- Error handling

## 🧪 Key Features Implemented

### ✅ Browse Events Page
- [x] Event cards with all event information
- [x] Search and filtering functionality
- [x] Real-time slot availability updates
- [x] Join/leave event functionality
- [x] Category-based filtering (Soccer, Basketball, Running)
- [x] Location-based search

### ✅ Event Cards
- [x] Beautiful card design with sport icons
- [x] Real-time slot progress bars
- [x] Join/Leave button states
- [x] Creator identification
- [x] Countdown timers for My Events
- [x] Navigation to event details

### ✅ My Events Page
- [x] Display user's joined events
- [x] Leave event functionality
- [x] Real-time updates
- [x] Event statistics
- [x] Empty state with call-to-action

### ✅ Real-time Socket.IO Integration
- [x] Live slot updates across all connected clients
- [x] Event update broadcasts
- [x] Automatic UI state synchronization
- [x] Connection management
- [x] Error handling and reconnection

### ✅ Event Detail Page
- [x] Comprehensive event information
- [x] Join/leave functionality
- [x] Reviews and ratings system
- [x] Average rating calculation
- [x] Feedback submission for past events
- [x] Real-time updates integration

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first design**: Optimized for mobile devices
- **Tablet support**: Proper layout for medium screens
- **Desktop enhancement**: Full-featured desktop experience
- **Touch-friendly**: Large touch targets for mobile users
- **Adaptive navigation**: Mobile hamburger menu

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Automatic token refresh**: Handles expired tokens
- **Protected routes**: Prevents unauthorized access
- **Input validation**: Client-side form validation
- **CORS handling**: Proper cross-origin request handling

## 🎯 User Journey

1. **Landing**: Users land on Homepage with sports-themed design
2. **Authentication**: Login/register with secure JWT authentication
3. **Dashboard**: Central hub with quick access to all features
4. **Browse Events**: Discover events with search, filter, and real-time updates
5. **Join Events**: One-click join with instant UI feedback
6. **My Events**: Manage joined events with countdown timers
7. **Event Details**: View comprehensive event info and submit reviews
8. **AI Chat**: Get personalized event recommendations

## 🔄 Real-time Features in Action

When a user joins an event:
1. **Client**: Sends HTTP POST to `/api/events/:id/rsvp`
2. **Socket**: Emits `joinEvent` with event and user ID
3. **Server**: Updates database and broadcasts `slotsUpdated`
4. **All Clients**: Receive update and refresh UI in real-time
5. **UI Update**: Available slots decrease by 1, button becomes gray

This ensures all users see live updates without page refreshes!

## 🎨 Design Philosophy

- **User-Centric**: Every feature designed with user experience first
- **Performance-First**: Optimized for speed and responsiveness  
- **Accessibility**: Inclusive design for all users
- **Modern Aesthetics**: Contemporary UI with smooth interactions
- **Data-Driven**: Real-time data updates across all components

## 🚀 Future Enhancements

- [ ] Push notifications for event reminders
- [ ] Calendar integration
- [ ] Social sharing features
- [ ] Event creation by users
- [ ] Advanced filtering options
- [ ] Geolocation-based recommendations
- [ ] Offline support with service workers
- [ ] Event photos and media
- [ ] Team formation features
- [ ] Payment integration for paid events

---

**Built with ❤️ using React, Socket.IO, and modern web technologies**

