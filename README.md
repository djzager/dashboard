# Firehouse Dashboard

Internal dashboard for fire department operations with Google OAuth authentication restricted to reva16.org domain.

## Features

- **Authentication**: Google OAuth with domain restriction to reva16.org using @react-oauth/google
- **TypeScript**: Full TypeScript support for type safety and better development experience
- **Dark Mode**: Toggle between light and dark themes with system preference detection and persistence
- **Dashboard**: Full-screen grid layout with sections for:
  - Upcoming events
  - Current staffing
  - Real-time weather for Culpeper, VA (temperature, conditions, wind, humidity, pressure, visibility, sunrise/sunset)
  - Apparatus status
  - Active dispatches (real-time updates)
- **Responsive Design**: Clean, simple interface using Tailwind CSS

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Create a Google Cloud Project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Get your FirstDue SizeUp API token
   - Copy `.env.example` to `.env` and configure:
     ```
     VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
     VITE_PROXY_URL=http://localhost:3001
     
     # Server-side environment variables (for proxy server)
     FD_TOKEN=your_firstdue_bearer_token_here
     PROXY_PORT=3001
     ```

3. **Run the development servers**:
   ```bash
   # Run both frontend and proxy server
   npm run dev:full
   
   # Or run separately:
   npm run proxy    # Start proxy server on port 3001
   npm run dev      # Start frontend on port 5173
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Security

- OAuth is restricted to @reva16.org email addresses only
- Protected routes require authentication
- User sessions are stored securely with cookies
- FirstDue API integration via secure proxy server
- Bearer token authentication handled server-side (not exposed to frontend)
- CORS protection via Express.js proxy
- API fallback to mock data when token is not configured

## Pages

- `/` - Main dashboard with grid layout

## Tech Stack

- React 18 with TypeScript
- Vite
- Tailwind CSS
- React Router
- @react-oauth/google for authentication
- js-cookie for session management