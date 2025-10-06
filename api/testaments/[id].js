/**
 * Vercel API Route: /api/testaments/[id].js
 * Handles CRUD operations for testaments
 */

import { 
  saveTestament as dbSaveTestament,
  getTestament as dbGetTestament,
  getAllTestaments,
  deleteTestament as dbDeleteTestament
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
  
  const { id } = req.query
  
  try {
    switch (req.method) {
      case 'GET':
        if (id) {
          // Get specific testament
          const testament = dbGetTestament(id)
          if (testament) {
            return successResponse(res, testament)
          } else {
            return errorResponse(res, 'Testament not found', 404)
          }
        } else {
          // Get all testaments
          const testaments = getAllTestaments()
          return successResponse(res, testaments)
        }
        
      case 'POST':
        if (id) {
          return errorResponse(res, 'Method not allowed for specific testament', 405)
        }
        // Create new testament
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
        const createResult = dbSaveTestament(body)
        return successResponse(res, { success: true, id: body.id }, 201)
        
      case 'PUT':
        if (!id) {
          return errorResponse(res, 'Testament ID required for update', 400)
        }
        // Update testament
        const updateBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
        const updateResult = dbSaveTestament(updateBody)
        return successResponse(res, { success: true, id: id })
        
      case 'DELETE':
        if (!id) {
          return errorResponse(res, 'Testament ID required for delete', 400)
        }
        // Delete testament
        const deleteResult = dbDeleteTestament(id)
        return successResponse(res, { success: true })
        
      default:
        return errorResponse(res, 'Method not allowed', 405)
    }
  } catch (error) {
    console.error('Testament API error:', error)
    return errorResponse(res, 'Internal server error')
  }
}