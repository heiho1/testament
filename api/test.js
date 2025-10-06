/**
 * Simple test API to check if basic serverless functions work
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).json({})
    return
  }
  
  try {
    res.status(200).json({ 
      message: 'Test API working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      query: req.query
    })
  } catch (error) {
    console.error('Test API error:', error)
    res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}