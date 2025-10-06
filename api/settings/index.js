/**
 * Vercel API Route: /api/settings/index.js
 * Handles site settings
 */

import { saveSetting, getSetting } from '../../src/utils/database-json.js'
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
        const defaultSettings = {
          siteTitle: '',
          showCopyright: false,
          copyright: '',
          showPrivacyPolicy: false,
          privacyPolicy: '',
          contact: {
            showPhone: false,
            phone: '',
            showEmail: false,
            email: '',
            showAddress: false,
            address: ''
          },
          colorScheme: {
            backgroundColor: '#ffffff',
            foregroundColor: '#000000'
          }
        }
        
        const settings = getSetting('site_settings', defaultSettings)
        return successResponse(res, settings)
        
      case 'POST':
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
        saveSetting('site_settings', body)
        return successResponse(res, { success: true })
        
      default:
        return errorResponse(res, 'Method not allowed', 405)
    }
  } catch (error) {
    console.error('Settings API error:', error)
    return errorResponse(res, 'Internal server error')
  }
}