import express from 'express'
import cors from 'cors'
import { createHash } from 'crypto'
import { 
  initDatabase,
  saveTestament as dbSaveTestament,
  getTestament as dbGetTestament,
  getAllTestaments,
  deleteTestament as dbDeleteTestament,
  setDefaultTestament as dbSetDefaultTestament,
  getDefaultTestamentId as dbGetDefaultTestamentId,
  clearDefaultTestament as dbClearDefaultTestament,
  saveSetting,
  getSetting,
  getUserByUsername,
  updateUserLastLogin,
  getAllUsers
} from './src/utils/database.js'

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' })) // Increase limit for images

// Initialize database
initDatabase()

// Testament API endpoints
app.get('/api/testaments', (req, res) => {
  try {
    const testaments = getAllTestaments()
    res.json(testaments)
  } catch (error) {
    console.error('Error fetching testaments:', error)
    res.status(500).json({ error: 'Failed to fetch testaments' })
  }
})

app.get('/api/testaments/:id', (req, res) => {
  try {
    const testament = dbGetTestament(req.params.id)
    if (testament) {
      res.json(testament)
    } else {
      res.status(404).json({ error: 'Testament not found' })
    }
  } catch (error) {
    console.error('Error fetching testament:', error)
    res.status(500).json({ error: 'Failed to fetch testament' })
  }
})

app.post('/api/testaments', (req, res) => {
  try {
    const result = dbSaveTestament(req.body)
    res.json({ success: true, id: req.body.id })
  } catch (error) {
    console.error('Error saving testament:', error)
    res.status(500).json({ error: 'Failed to save testament' })
  }
})

app.put('/api/testaments/:id', (req, res) => {
  try {
    const result = dbSaveTestament(req.body)
    res.json({ success: true, id: req.params.id })
  } catch (error) {
    console.error('Error updating testament:', error)
    res.status(500).json({ error: 'Failed to update testament' })
  }
})

app.delete('/api/testaments/:id', (req, res) => {
  try {
    // Clear default if this was the default testament
    if (dbGetDefaultTestamentId() === req.params.id) {
      dbClearDefaultTestament()
    }
    
    const result = dbDeleteTestament(req.params.id)
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting testament:', error)
    res.status(500).json({ error: 'Failed to delete testament' })
  }
})

// Default testament endpoints
app.get('/api/default-testament', (req, res) => {
  try {
    const defaultId = dbGetDefaultTestamentId()
    if (defaultId) {
      const testament = dbGetTestament(defaultId)
      res.json({ id: defaultId, testament })
    } else {
      res.json({ id: null, testament: null })
    }
  } catch (error) {
    console.error('Error fetching default testament:', error)
    res.status(500).json({ error: 'Failed to fetch default testament' })
  }
})

app.post('/api/default-testament', (req, res) => {
  try {
    const { testamentId } = req.body
    dbSetDefaultTestament(testamentId)
    res.json({ success: true })
  } catch (error) {
    console.error('Error setting default testament:', error)
    res.status(500).json({ error: 'Failed to set default testament' })
  }
})

app.delete('/api/default-testament', (req, res) => {
  try {
    dbClearDefaultTestament()
    res.json({ success: true })
  } catch (error) {
    console.error('Error clearing default testament:', error)
    res.status(500).json({ error: 'Failed to clear default testament' })
  }
})

// Settings endpoints
app.get('/api/settings', (req, res) => {
  try {
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
    res.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

app.post('/api/settings', (req, res) => {
  try {
    saveSetting('site_settings', req.body)
    res.json({ success: true })
  } catch (error) {
    console.error('Error saving settings:', error)
    res.status(500).json({ error: 'Failed to save settings' })
  }
})

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' })
    }
    
    // Get user from database
    const user = getUserByUsername(username)
    
    if (!user || !user.active) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' })
    }
    
    // Verify password
    const testHash = createHash('sha256').update(password + user.password_salt).digest('hex')
    
    if (testHash !== user.password_hash) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' })
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
    
    res.json({ success: true, user: authData })
  } catch (error) {
    console.error('Error during login:', error)
    res.status(500).json({ success: false, error: 'Login failed' })
  }
})

// Get current user info (for session validation)
app.get('/api/auth/user/:username', (req, res) => {
  try {
    const user = getUserByUsername(req.params.username)
    
    if (!user || !user.active) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Return user info (without password data)
    const userData = {
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email
    }
    
    res.json(userData)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// List all users (admin only endpoint - we'll add auth middleware later)
app.get('/api/users', (req, res) => {
  try {
    const users = getAllUsers()
    // Remove password data from response
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
      active: user.active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login
    }))
    
    res.json(safeUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Testament backend server running on http://localhost:${PORT}`)
  console.log('Database initialized and ready!')
})