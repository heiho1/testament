# Testament

Testament was created as a simple application to allow people to publish personal testaments. 

Regarding terminology, testament and testimony are commonly used terms.  Testimony is most commonly associated 
with legal proceedings and being under oath.  A testament does not require one to be testifying within a legal context.
A testament can be considered a personal Truth published for the general knowledge of others.

Testimony is intended to be lightweight and extensible.  The code is licensed under GPLv3 and, 
as such, it is "free" to duplicate and modify so long as the licensing is not altered.

This site was developed using Quasar as a modern application framework.  It currently support sqlite as a portable 
database for storing the configuration of a site.  Future enhancement may add support 
for other databases, such as supabase.

## Features

Testament provides a comprehensive platform for creating, managing, and sharing personal testaments with the following key features:

### User Authentication & Security
- **Secure Login System**: Password-protected access with SHA-256 encryption
- **User Management**: Admin tools for creating and managing user accounts
- **Session Management**: Persistent login sessions with secure authentication

### Testament Management
- **Create Testaments**: Rich text editor for composing personal testaments
- **View Testaments**: Clean, readable display of published testaments
- **Testament Storage**: Secure database storage with SQLite backend
- **Testament History**: Track and manage multiple testaments per user

### Customization & Branding
- **Site Configuration**: Customizable site title and branding
- **Color Themes**: Configurable background and foreground colors
- **Personal Settings**: User-specific preferences and display options
- **Responsive Design**: Mobile-friendly interface with Quasar UI components

### Technical Features
- **Full-Stack Architecture**: Vue.js frontend with Express.js backend
- **Database Integration**: SQLite database for reliable data persistence
- **RESTful API**: Clean API endpoints for all application functions
- **Modern Development**: Built with Vue 3, Vite, and modern JavaScript

### Administration Tools
- **CLI Admin Interface**: Command-line tools for user and system management
- **Settings Management**: Global site settings configuration
- **User Administration**: Create admin accounts and manage user permissions
- **Database Management**: Built-in database schema and migration tools

### Developer Experience
- **Hot Reload Development**: Vite-powered development server
- **Modular Architecture**: Clean separation of concerns and reusable components
- **Extensible Design**: Plugin architecture for future feature additions
- **Open Source**: GPL v3 licensed for community contribution and modification

## Getting Started

1. Install dependencies: `npm install`
2. Create an admin user: `npm run create-admin`
3. Start the backend server: `npm run server`
4. Start the development server: `npm run dev`
5. Access the application at `http://localhost:5173`
