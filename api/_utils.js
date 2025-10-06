/**
 * Vercel API utilities
 * Common functions and middleware for Vercel serverless functions
 */

import { initDatabase } from '../src/utils/database.js'

// CORS headers for all API responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

// Initialize database once and reuse connection
let dbInitialized = false

export function ensureDatabase() {
  if (!dbInitialized) {
    initDatabase()
    dbInitialized = true
  }
}

// Handle OPTIONS requests for CORS preflight
export function handleCORS(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({})
    return true
  }
  return false
}

// Error response helper
export function errorResponse(res, message, status = 500) {
  return res.status(status).json({ 
    error: message,
    timestamp: new Date().toISOString()
  })
}

// Success response helper
export function successResponse(res, data, status = 200) {
  return res.status(status).json(data)
}