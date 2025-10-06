/**
 * Vercel API utilities
 * Common functions and middleware for Vercel serverless functions
 */

import { initDatabase, createUser, getUserByUsername } from '../src/utils/database.js'
import { createHash, randomBytes } from 'crypto'

// CORS headers for all API responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

// Initialize database once and reuse connection
let dbInitialized = false

// Hash password function
function hashPassword(password) {
  const salt = randomBytes(32).toString('hex')
  const hash = createHash('sha256').update(password + salt).digest('hex')
  return { hash, salt }
}

export function ensureDatabase() {
  if (!dbInitialized) {
    // Initialize database schema
    initDatabase()
    
    // Ensure admin user exists (critical for Vercel where database is ephemeral)
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD
    
    if (adminPassword) {
      const existingUser = getUserByUsername(adminUsername)
      
      if (!existingUser) {
        const { hash, salt } = hashPassword(adminPassword)
        const result = createUser(
          adminUsername,
          hash,
          salt,
          process.env.ADMIN_ROLE || 'admin',
          process.env.ADMIN_NAME || 'Administrator',
          process.env.ADMIN_EMAIL || null
        )
        
        if (result.success) {
          console.log(`✅ Auto-created admin user '${adminUsername}' for serverless function`)
        } else {
          console.error(`❌ Failed to auto-create admin user: ${result.error}`)
        }
      }
    }
    
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