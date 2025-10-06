/**
 * Vercel API Route: /api/users.js
 * Handles user management operations
 */

import { getAllUsers } from '../src/utils/database.js'
import { corsHeaders, ensureDatabase, handleCORS, errorResponse, successResponse } from './_utils.js'

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
    const users = getAllUsers()
    return successResponse(res, users)
  } catch (error) {
    console.error('Users API error:', error)
    return errorResponse(res, 'Internal server error', 500)
  }
}