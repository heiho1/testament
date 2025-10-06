/**
 * Vercel API Route: /api/default-testament.js
 * Handles default testament operations
 */

import { getDefaultTestamentId, setDefaultTestament, clearDefaultTestament, getTestament } from '../src/utils/database.js'
import { corsHeaders, ensureDatabase, handleCORS, errorResponse, successResponse } from './_utils.js'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods'])
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers'])
  
  // Handle CORS preflight
  if (handleCORS(req, res)) return
  
  // Ensure database is initialized
  ensureDatabase()
  
  try {
    if (req.method === 'GET') {
      // Get default testament
      const defaultId = getDefaultTestamentId()
      if (defaultId) {
        const testament = getTestament(defaultId)
        return successResponse(res, { id: defaultId, testament })
      } else {
        return successResponse(res, { id: null, testament: null })
      }
    }
    
    else if (req.method === 'POST') {
      // Set default testament
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const { testamentId } = body
      
      if (!testamentId) {
        return errorResponse(res, 'Testament ID is required', 400)
      }
      
      // Verify testament exists
      const testament = getTestament(testamentId)
      if (!testament) {
        return errorResponse(res, 'Testament not found', 404)
      }
      
      setDefaultTestament(testamentId)
      return successResponse(res, { message: 'Default testament set successfully' })
    }
    
    else if (req.method === 'DELETE') {
      // Clear default testament
      clearDefaultTestament()
      return successResponse(res, { message: 'Default testament cleared successfully' })
    }
    
    else {
      return errorResponse(res, 'Method not allowed', 405)
    }
    
  } catch (error) {
    console.error('Default testament API error:', error)
    return errorResponse(res, 'Internal server error', 500)
  }
}