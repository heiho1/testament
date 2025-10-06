/**
 * Vercel API Route: /api/testaments/index.js
 * Handles getting all testaments and creating new ones
 */

import { 
  saveTestament as dbSaveTestament,
  getAllTestaments
} from '../../src/utils/database.js'
import { corsHeaders, ensureDatabase, handleCORS, errorResponse, successResponse } from '../_utils.js'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods'])
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers'])
  
  // Handle CORS preflight
  if (handleCORS(req, res)) return
  
  // Initialize database
  ensureDatabase()
  
  try {
    switch (req.method) {
      case 'GET':
        // Get all testaments
        const testaments = getAllTestaments()
        return successResponse(res, testaments)
        
      case 'POST':
        // Create new testament
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
        const result = dbSaveTestament(body)
        return successResponse(res, { success: true, id: body.id }, 201)
        
      default:
        return errorResponse(res, 'Method not allowed', 405)
    }
  } catch (error) {
    console.error('Testaments API error:', error)
    return errorResponse(res, 'Internal server error')
  }
}