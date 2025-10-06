/**
 * Simple file-based database implementation for Vercel serverless functions
 * Uses JSON files in /tmp directory since better-sqlite3 doesn't work in serverless
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { createHash, randomBytes } from 'crypto'

// Use /tmp directory in serverless environments
const DB_DIR = process.env.VERCEL ? '/tmp/testament-db' : './data'
const USERS_FILE = join(DB_DIR, 'users.json')
const TESTAMENTS_FILE = join(DB_DIR, 'testaments.json')
const SETTINGS_FILE = join(DB_DIR, 'settings.json')
const DEFAULT_TESTAMENT_FILE = join(DB_DIR, 'default.json')

// Ensure database directory exists
function ensureDbDir() {
  if (!existsSync(DB_DIR)) {
    mkdirSync(DB_DIR, { recursive: true })
  }
}

// Read JSON file with error handling
function readJsonFile(filePath, defaultValue = []) {
  try {
    if (existsSync(filePath)) {
      const data = readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
  }
  return defaultValue
}

// Write JSON file with error handling
function writeJsonFile(filePath, data) {
  try {
    ensureDbDir()
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error)
    return false
  }
}

// Initialize database
export function initDatabase() {
  try {
    console.log(`🔍 Initializing file-based database at: ${DB_DIR}`)
    ensureDbDir()
    
    // Initialize empty files if they don't exist
    if (!existsSync(USERS_FILE)) {
      writeJsonFile(USERS_FILE, [])
    }
    if (!existsSync(TESTAMENTS_FILE)) {
      writeJsonFile(TESTAMENTS_FILE, [])
    }
    if (!existsSync(SETTINGS_FILE)) {
      writeJsonFile(SETTINGS_FILE, {})
    }
    if (!existsSync(DEFAULT_TESTAMENT_FILE)) {
      writeJsonFile(DEFAULT_TESTAMENT_FILE, { testament_id: null })
    }
    
    console.log('✅ File-based database initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to initialize file-based database:', error)
    throw error
  }
}

export function getDatabase() {
  initDatabase()
  return true
}

// User operations
export function createUser(username, passwordHash, passwordSalt, role, name, email = null) {
  try {
    const users = readJsonFile(USERS_FILE, [])
    
    // Check if user already exists
    if (users.find(u => u.username === username)) {
      return { success: false, error: 'Username already exists' }
    }
    
    const newUser = {
      id: users.length + 1,
      username,
      password_hash: passwordHash,
      password_salt: passwordSalt,
      role,
      name,
      email,
      active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: null
    }
    
    users.push(newUser)
    
    if (writeJsonFile(USERS_FILE, users)) {
      return { success: true, id: newUser.id }
    } else {
      return { success: false, error: 'Failed to save user' }
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: error.message }
  }
}

export function getUserByUsername(username) {
  try {
    const users = readJsonFile(USERS_FILE, [])
    return users.find(u => u.username === username && u.active === 1) || null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export function getAllUsers() {
  try {
    return readJsonFile(USERS_FILE, [])
      .filter(u => u.active === 1)
      .map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        name: u.name,
        email: u.email,
        active: u.active,
        created_at: u.created_at,
        updated_at: u.updated_at,
        last_login: u.last_login
      }))
  } catch (error) {
    console.error('Error getting all users:', error)
    return []
  }
}

export function updateUserLastLogin(username) {
  try {
    const users = readJsonFile(USERS_FILE, [])
    const userIndex = users.findIndex(u => u.username === username)
    
    if (userIndex >= 0) {
      users[userIndex].last_login = new Date().toISOString()
      users[userIndex].updated_at = new Date().toISOString()
      writeJsonFile(USERS_FILE, users)
      return true
    }
    return false
  } catch (error) {
    console.error('Error updating user last login:', error)
    return false
  }
}

// Testament operations
export function saveTestament(testament) {
  try {
    const testaments = readJsonFile(TESTAMENTS_FILE, [])
    const existingIndex = testaments.findIndex(t => t.id === testament.id)
    
    const testamentData = {
      id: testament.id,
      title: testament.title,
      topic: testament.topic,
      content: testament.content,
      goal: testament.goal || null,
      references_data: testament.references ? JSON.stringify(testament.references) : null,
      images: testament.images ? JSON.stringify(testament.images) : null,
      gallery_caption: testament.galleryCaption || null,
      background_color: testament.backgroundColor || null,
      foreground_color: testament.foregroundColor || null,
      author: testament.author,
      created_at: testament.createdAt,
      updated_at: testament.updatedAt || new Date().toISOString()
    }
    
    if (existingIndex >= 0) {
      testaments[existingIndex] = testamentData
    } else {
      testaments.push(testamentData)
    }
    
    return writeJsonFile(TESTAMENTS_FILE, testaments)
  } catch (error) {
    console.error('Error saving testament:', error)
    return false
  }
}

export function getTestament(id) {
  try {
    const testaments = readJsonFile(TESTAMENTS_FILE, [])
    const result = testaments.find(t => t.id === id)
    
    if (result) {
      return {
        id: result.id,
        title: result.title,
        topic: result.topic,
        content: result.content,
        goal: result.goal,
        references: result.references_data ? JSON.parse(result.references_data) : [],
        images: result.images ? JSON.parse(result.images) : [],
        galleryCaption: result.gallery_caption,
        backgroundColor: result.background_color,
        foregroundColor: result.foreground_color,
        author: result.author,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      }
    }
    return null
  } catch (error) {
    console.error('Error getting testament:', error)
    return null
  }
}

export function getAllTestaments() {
  try {
    const testaments = readJsonFile(TESTAMENTS_FILE, [])
    return testaments
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(result => ({
        id: result.id,
        title: result.title,
        topic: result.topic,
        content: result.content,
        goal: result.goal,
        references: result.references_data ? JSON.parse(result.references_data) : [],
        images: result.images ? JSON.parse(result.images) : [],
        galleryCaption: result.gallery_caption,
        backgroundColor: result.background_color,
        foregroundColor: result.foreground_color,
        author: result.author,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      }))
  } catch (error) {
    console.error('Error getting all testaments:', error)
    return []
  }
}

export function deleteTestament(id) {
  try {
    const testaments = readJsonFile(TESTAMENTS_FILE, [])
    const filteredTestaments = testaments.filter(t => t.id !== id)
    return writeJsonFile(TESTAMENTS_FILE, filteredTestaments)
  } catch (error) {
    console.error('Error deleting testament:', error)
    return false
  }
}

// Default testament operations
export function setDefaultTestament(testamentId) {
  try {
    return writeJsonFile(DEFAULT_TESTAMENT_FILE, { testament_id: testamentId })
  } catch (error) {
    console.error('Error setting default testament:', error)
    return false
  }
}

export function getDefaultTestamentId() {
  try {
    const data = readJsonFile(DEFAULT_TESTAMENT_FILE, { testament_id: null })
    return data.testament_id
  } catch (error) {
    console.error('Error getting default testament:', error)
    return null
  }
}

export function clearDefaultTestament() {
  try {
    return writeJsonFile(DEFAULT_TESTAMENT_FILE, { testament_id: null })
  } catch (error) {
    console.error('Error clearing default testament:', error)
    return false
  }
}

// Settings operations
export function saveSetting(key, value) {
  try {
    const settings = readJsonFile(SETTINGS_FILE, {})
    settings[key] = {
      value: JSON.stringify(value),
      updated_at: new Date().toISOString()
    }
    return writeJsonFile(SETTINGS_FILE, settings)
  } catch (error) {
    console.error('Error saving setting:', error)
    return false
  }
}

export function getSetting(key, defaultValue = null) {
  try {
    const settings = readJsonFile(SETTINGS_FILE, {})
    const setting = settings[key]
    
    if (setting && setting.value) {
      try {
        return JSON.parse(setting.value)
      } catch (error) {
        console.error('Error parsing setting value:', error)
        return defaultValue
      }
    }
    return defaultValue
  } catch (error) {
    console.error('Error getting setting:', error)
    return defaultValue
  }
}

export function deleteSetting(key) {
  try {
    const settings = readJsonFile(SETTINGS_FILE, {})
    delete settings[key]
    return writeJsonFile(SETTINGS_FILE, settings)
  } catch (error) {
    console.error('Error deleting setting:', error)
    return false
  }
}

// Initialize database on module load (if not in serverless)
if (!process.env.VERCEL) {
  initDatabase()
}