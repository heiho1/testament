# Testament Vercel Deployment Guide

This guide explains how to deploy the Testament application on Vercel with automatic database and admin user bootstrapping.

## Prerequisites

1. A Vercel account
2. The Testament repository connected to Vercel
3. Environment variables configured in Vercel dashboard

## Environment Variables

Configure these environment variables in your Vercel project dashboard:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ADMIN_PASSWORD` | Admin user password (min 6 chars) | `SecurePassword123!` |

### Optional Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `ADMIN_USERNAME` | Admin username | `admin` |
| `ADMIN_NAME` | Admin full name | `Administrator` |
| `ADMIN_EMAIL` | Admin email address | _(empty)_ |
| `ADMIN_ROLE` | Admin role | `admin` |
| `NODE_ENV` | Environment mode | `production` |
| `DB_PATH` | Database file path | `/tmp/testament.db` |

## Deployment Process

### 1. Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Testament repository
4. Vercel will auto-detect the framework settings

### 2. Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the required environment variables:

```
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_USERNAME=admin
ADMIN_NAME=Site Administrator
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_ROLE=admin
```

### 3. Deploy

Vercel will automatically:

1. Install dependencies with `npm install`
2. Run `npm run build:vercel` which:
   - Executes `npm run bootstrap:vercel` (initializes database and creates admin user)
   - Runs `vite build` (builds the frontend)
3. Deploy the application with serverless functions

## Project Structure

The Vercel deployment uses the following structure:

```
testament/
├── api/                    # Vercel serverless functions
│   ├── _utils.js          # Common utilities and CORS handling
│   ├── auth/
│   │   └── login.js       # POST /api/auth/login
│   ├── settings/
│   │   └── index.js       # GET/POST /api/settings
│   └── testaments/
│       ├── index.js       # GET/POST /api/testaments
│       └── [id].js        # GET/PUT/DELETE /api/testaments/[id]
├── dist/                   # Built frontend files (generated)
├── src/                    # Vue.js application source
├── vercel.json            # Vercel configuration
├── vercel-bootstrap.js    # Database initialization script
└── package.json           # Build scripts and dependencies
```

## API Endpoints

All API endpoints are automatically available as serverless functions:

- `GET /api/testaments` - Get all testaments
- `GET /api/testaments/:id` - Get specific testament
- `POST /api/testaments` - Create new testament
- `PUT /api/testaments/:id` - Update testament
- `DELETE /api/testaments/:id` - Delete testament
- `POST /api/auth/login` - User login
- `GET /api/settings` - Get site settings
- `POST /api/settings` - Update site settings

## Database Considerations

### SQLite on Vercel

- Database is stored in `/tmp/testament.db` (ephemeral storage)
- Database is recreated on each cold start
- Admin user is automatically recreated if missing
- Consider using a persistent database service for production (PostgreSQL, MySQL)

### Persistent Storage Alternative

For persistent data, consider:

1. **Vercel Postgres** (recommended for production)
2. **PlanetScale** (MySQL-compatible)
3. **Supabase** (PostgreSQL with real-time features)
4. **Railway** (PostgreSQL/MySQL hosting)

## Monitoring and Logs

1. **Vercel Functions** tab shows serverless function logs
2. **Deployments** tab shows build and bootstrap logs
3. Check **Build Logs** for database initialization messages

## Troubleshooting

### Build Fails

Check environment variables:
- `ADMIN_PASSWORD` must be at least 6 characters
- All required variables are set in Vercel dashboard

### Database Issues

- Database recreates on cold starts (normal behavior)
- Admin user is automatically recreated
- Check function logs for initialization errors

### API Errors

- CORS is handled automatically
- Check function logs in Vercel dashboard
- Verify API routes are accessible

## Security Notes

1. **Environment Variables**: Never commit `.env` files with real credentials
2. **Admin Password**: Use a strong password (12+ characters recommended)
3. **CORS**: Configured to allow all origins (modify for production if needed)
4. **Database**: SQLite is ephemeral on Vercel, consider persistent storage for production

## Local Development vs Production

| Feature | Local Development | Vercel Production |
|---------|------------------|-------------------|
| Database | Persistent SQLite file | Ephemeral `/tmp/testament.db` |
| Environment | Loads from `.env` file | Uses Vercel environment variables |
| API Server | Express.js on port 3001 | Serverless functions |
| Admin Creation | Manual via CLI | Automatic during build |

## Next Steps

After successful deployment:

1. Visit your Vercel deployment URL
2. Log in with your admin credentials
3. Configure site settings
4. Create your first testament
5. Consider setting up a custom domain
6. For production, migrate to persistent database storage

## Support

For issues specific to Vercel deployment:
1. Check Vercel function logs
2. Verify environment variables
3. Review build logs for bootstrap errors
4. Ensure all API routes return proper CORS headers