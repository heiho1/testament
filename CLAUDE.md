# Testament - Technical Documentation for Claude AI

This document provides detailed technical information about the Testament application for AI assistants to understand the codebase architecture, dependencies, and behavior patterns.

## Core Dependencies

### Frontend Dependencies
- **Vue 3.5.22**: Primary frontend framework using Composition API
- **Vue Router 4.5.1**: Client-side routing for SPA navigation
- **Quasar 2.18.5**: UI component library providing Material Design components
- **@quasar/extras 1.17.0**: Icon sets and fonts for Quasar components
- **@quasar/vite-plugin 1.10.0**: Vite integration for Quasar framework
- **Vite 6.3.6**: Build tool and development server with HMR
- **@vitejs/plugin-vue 5.2.4**: Vue 3 support for Vite
- **sass-embedded 1.93.2**: Sass/SCSS stylesheet preprocessing

### Backend Dependencies
- **Express 5.1.0**: Node.js web application framework for REST API
- **better-sqlite3 12.4.1**: SQLite database driver with synchronous API
- **cors 2.8.5**: Cross-Origin Resource Sharing middleware
- **crypto (built-in)**: SHA-256 password hashing and security functions

### Development Dependencies
- **concurrently 9.2.1**: Run multiple npm scripts simultaneously

## Application Architecture

### Frontend Structure
```
src/
├── main.js              # Vue app initialization with Quasar
├── App.vue              # Root component with navigation
├── router.js            # Vue Router configuration
├── components/          # Reusable Vue components
├── layouts/             # Page layout components
├── pages/               # Route-specific page components
│   ├── HomePage.vue     # Testament listing and default display
│   ├── CreateTestament.vue  # Testament creation form
│   ├── ViewTestament.vue    # Individual testament viewing
│   ├── LoginPage.vue    # User authentication
│   └── SettingsPage.vue # Site configuration
└── utils/               # Utility modules
    ├── api.js           # Frontend API client
    ├── auth.js          # Authentication state management
    ├── authState.js     # Reactive authentication store
    ├── colors.js        # Color manipulation utilities
    ├── settings.js      # Settings management
    └── storage.js       # Local storage abstraction
```

### Backend Structure
```
server.js                # Express server with REST API endpoints
database.js              # SQLite database operations and schema
create-admin-cli.js      # Command-line admin user creation
```

## Site Behavior Patterns

### Authentication Flow
1. **Login Process**: POST `/api/login` with username/password
2. **Password Security**: SHA-256 hashing with salt
3. **Session Management**: Server validates credentials, returns success/failure
4. **State Persistence**: Frontend stores auth state in localStorage
5. **Route Protection**: Router guards redirect unauthenticated users

### Testament Management
1. **Creation**: Rich text editor saves to SQLite via POST `/api/testaments`
2. **Storage**: Database stores testament content, metadata, and user association
3. **Retrieval**: GET endpoints for individual and bulk testament access
4. **Default Testament**: System supports setting one testament as default/featured

### Settings System
1. **Global Settings**: Site title, colors, phone display stored in database
2. **User Preferences**: Per-user settings for personalization
3. **Reactive Updates**: Settings changes immediately reflect in UI
4. **Async Loading**: Settings loaded asynchronously with defensive defaults

### Database Schema
```sql
-- Users table for authentication
users (id, username, password_hash, is_admin, created_at, last_login)

-- Testaments for content storage  
testaments (id, title, content, author, created_at, updated_at, user_id, is_default)

-- Settings for configuration
settings (key, value, user_id, created_at, updated_at)
```

## API Endpoints

### Authentication
- `POST /api/login` - User authentication
- `GET /api/users` - List all users (admin)

### Testament Operations
- `GET /api/testaments` - Get all testaments
- `GET /api/testaments/:id` - Get specific testament
- `POST /api/testaments` - Create new testament
- `PUT /api/testaments/:id` - Update testament
- `DELETE /api/testaments/:id` - Delete testament
- `POST /api/testaments/:id/set-default` - Set as default
- `DELETE /api/default-testament` - Clear default

### Settings Management
- `GET /api/settings/:key` - Get setting value
- `POST /api/settings` - Save setting value

## Development Workflow

### Local Development
1. `npm install` - Install dependencies
2. `npm run create-admin` - Create admin user
3. `npm run server` - Start Express backend (port 3001)
4. `npm run dev` - Start Vite frontend (port 5173)
5. `npm run dev:full` - Start both servers concurrently

### Build Process
- `npm run build` - Production build with Vite
- `npm run preview` - Preview production build

## Common Patterns

### Async Operations
- All database operations are async/await
- Frontend uses defensive programming for undefined properties
- Settings loading includes fallback defaults
- Error handling with try/catch blocks

### State Management
- Reactive Vue 3 Composition API
- Centralized auth state in `authState.js`
- Settings loaded into reactive objects
- Event-driven UI updates

### Component Communication
- Props for parent-to-child data flow
- Emit events for child-to-parent communication
- Shared state via utility modules
- Router for navigation state

## Security Considerations
- Password hashing with SHA-256
- CORS configuration for cross-origin requests
- Input validation on API endpoints
- SQL injection prevention with prepared statements
- Authentication required for protected routes

## Deployment Notes
- SQLite database file created automatically
- Environment-agnostic configuration
- Static file serving via Vite build
- Process management for production (PM2 recommended)
- Git repository: https://github.com/heiho1/testament.git