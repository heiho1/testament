/**
 * Vercel API Route: /api/auth/user/[username].js
 * Handles user information retrieval
 */

import { getUserByUsername } from '../../../src/utils/database-json.js'
import { corsHeaders, ensureDatabase, handleCORS, errorResponse, successResponse } from '../../_utils.js'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods'])
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers'])
  
  // Handle CORS preflight
  if (handleCORS(req, res)) return
  
  // Only allow GET method
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405)
  }
  
  // Ensure database is initialized
  ensureDatabase()
  
  try {
    const { username } = req.query
    
    if (!username) {
      return errorResponse(res, 'Username is required', 400)
    }
    
    const user = getUserByUsername(username)
    
    if (!user) {
      return errorResponse(res, 'User not found', 404)
    }
    
    // Return user info without sensitive data
    const userInfo = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
      active: user.active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login
    }
    
    return successResponse(res, userInfo)
    
  } catch (error) {
    console.error('User info API error:', error)
    return errorResponse(res, 'Internal server error', 500)
  }
}