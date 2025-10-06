/**
 * Vercel API Route: /api/auth/login.js
 * Handles user authentication
 */

import { createHash } from 'crypto'
import { getUserByUsername, updateUserLastLogin } from '../../../src/utils/database.js'
import { corsHeaders, ensureDatabase, handleCORS, errorResponse, successResponse } from '../../_utils.js'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods'])
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers'])
  
  // Handle CORS preflight
  if (handleCORS(req, res)) return
  
  // Only allow POST method
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405)
  }
  
  // Initialize database
  ensureDatabase()
  
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return errorResponse(res, 'Username and password are required', 400)
    }
    
    // Get user from database
    const user = getUserByUsername(username)
    
    if (!user || !user.active) {
      return errorResponse(res, 'Invalid username or password', 401)
    }
    
    // Verify password
    const testHash = createHash('sha256').update(password + user.password_salt).digest('hex')
    
    if (testHash !== user.password_hash) {
      return errorResponse(res, 'Invalid username or password', 401)
    }
    
    // Update last login
    updateUserLastLogin(username)
    
    // Return user info (without password data)
    const authData = {
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
      loginTime: new Date().toISOString()
    }
    
    return successResponse(res, { success: true, user: authData })
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse(res, 'Login failed')
  }
}