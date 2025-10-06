/**
 * Vercel API Route: /api/auth/login.js
 * Handles user authentication
 */

import { createHash } from 'crypto'
import { getUserByUsername, updateUserLastLogin } from '../../src/utils/database.js'
import { corsHeaders, ensureDatabase, handleCORS, errorResponse, successResponse } from '../_utils.js'

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
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { username, password } = body
    
    if (!username || !password) {
      return errorResponse(res, 'Username and password are required', 400)
    }
    
    // Get user from database
    const user = getUserByUsername(username)
    
    console.log(`🔍 Login attempt for username: ${username}`)
    console.log(`🔍 User found: ${user ? 'YES' : 'NO'}`)
    
    if (!user || !user.active) {
      console.log(`❌ User not found or inactive for username: ${username}`)
      return errorResponse(res, 'Invalid username or password', 401)
    }
    
    console.log(`🔍 User active: ${user.active}`)
    console.log(`🔍 Stored hash: ${user.password_hash.substring(0, 8)}...`)
    console.log(`🔍 Stored salt: ${user.password_salt.substring(0, 8)}...`)
    
    // Verify password
    const testHash = createHash('sha256').update(password + user.password_salt).digest('hex')
    console.log(`🔍 Computed hash: ${testHash.substring(0, 8)}...`)
    console.log(`🔍 Hashes match: ${testHash === user.password_hash}`)
    
    if (testHash !== user.password_hash) {
      console.log(`❌ Password verification failed for username: ${username}`)
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