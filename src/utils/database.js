import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Database file path (in project root)
const dbPath = join(__dirname, '../../testament.db')

// Initialize database connection
let db = null

export function initDatabase() {
  try {
    db = new Database(dbPath)
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON')
    
    // Create tables if they don't exist
    createTables()
    
    console.log('Database initialized successfully at:', dbPath)
    return db
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

function createTables() {
  // Settings table
  const createSettingsTable = `
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Testaments table
  const createTestamentsTable = `
    CREATE TABLE IF NOT EXISTS testaments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      content TEXT NOT NULL,
      goal TEXT,
      references_data TEXT, -- JSON string for references
      images TEXT, -- JSON string
      gallery_caption TEXT,
      background_color TEXT,
      foreground_color TEXT,
      author TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    )
  `

  // Default testament table (stores which testament is the default)
  const createDefaultTestamentTable = `
    CREATE TABLE IF NOT EXISTS default_testament (
      id INTEGER PRIMARY KEY,
      testament_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (testament_id) REFERENCES testaments (id) ON DELETE CASCADE
    )
  `

  // Users table for authentication
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'public-user',
      name TEXT NOT NULL,
      email TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `

  db.exec(createSettingsTable)
  db.exec(createTestamentsTable)
  db.exec(createDefaultTestamentTable)
  db.exec(createUsersTable)
}

export function getDatabase() {
  if (!db) {
    initDatabase()
  }
  return db
}

// Settings operations
export function saveSetting(key, value) {
  const database = getDatabase()
  const stmt = database.prepare(`
    INSERT OR REPLACE INTO settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `)
  return stmt.run(key, JSON.stringify(value))
}

export function getSetting(key, defaultValue = null) {
  const database = getDatabase()
  const stmt = database.prepare('SELECT value FROM settings WHERE key = ?')
  const result = stmt.get(key)
  
  if (result) {
    try {
      return JSON.parse(result.value)
    } catch (error) {
      console.error('Error parsing setting value:', error)
      return defaultValue
    }
  }
  return defaultValue
}

export function deleteSetting(key) {
  const database = getDatabase()
  const stmt = database.prepare('DELETE FROM settings WHERE key = ?')
  return stmt.run(key)
}

// Testament operations
export function saveTestament(testament) {
  const database = getDatabase()
  const stmt = database.prepare(`
    INSERT OR REPLACE INTO testaments (
      id, title, topic, content, goal, references_data, images, gallery_caption,
      background_color, foreground_color, author, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  return stmt.run(
    testament.id,
    testament.title,
    testament.topic,
    testament.content,
    testament.goal || null,
    testament.references ? JSON.stringify(testament.references) : null,
    testament.images ? JSON.stringify(testament.images) : null,
    testament.galleryCaption || null,
    testament.backgroundColor || null,
    testament.foregroundColor || null,
    testament.author,
    testament.createdAt,
    testament.updatedAt || null
  )
}

export function getTestament(id) {
  const database = getDatabase()
  const stmt = database.prepare('SELECT * FROM testaments WHERE id = ?')
  const result = stmt.get(id)
  
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
}

export function getAllTestaments() {
  const database = getDatabase()
  const stmt = database.prepare('SELECT * FROM testaments ORDER BY created_at DESC')
  const results = stmt.all()
  
  return results.map(result => ({
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
}

export function deleteTestament(id) {
  const database = getDatabase()
  const stmt = database.prepare('DELETE FROM testaments WHERE id = ?')
  return stmt.run(id)
}

// Default testament operations
export function setDefaultTestament(testamentId) {
  const database = getDatabase()
  
  // Clear existing default
  const clearStmt = database.prepare('DELETE FROM default_testament')
  clearStmt.run()
  
  // Set new default
  const setStmt = database.prepare(`
    INSERT INTO default_testament (testament_id)
    VALUES (?)
  `)
  return setStmt.run(testamentId)
}

export function getDefaultTestamentId() {
  const database = getDatabase()
  const stmt = database.prepare('SELECT testament_id FROM default_testament LIMIT 1')
  const result = stmt.get()
  return result ? result.testament_id : null
}

export function clearDefaultTestament() {
  const database = getDatabase()
  const stmt = database.prepare('DELETE FROM default_testament')
  return stmt.run()
}

// Migrate data from localStorage (for backward compatibility)
export function migrateFromLocalStorage() {
  try {
    // Migrate testaments
    const testamentsData = localStorage.getItem('testaments')
    if (testamentsData) {
      const testaments = JSON.parse(testamentsData)
      testaments.forEach(testament => {
        try {
          saveTestament(testament)
        } catch (error) {
          console.error('Error migrating testament:', testament.id, error)
        }
      })
      console.log(`Migrated ${testaments.length} testaments from localStorage`)
    }

    // Migrate default testament
    const defaultTestamentId = localStorage.getItem('default_testament_id')
    if (defaultTestamentId) {
      setDefaultTestament(defaultTestamentId)
      console.log('Migrated default testament ID from localStorage')
    }

    // Migrate site settings
    const settingsData = localStorage.getItem('site_settings')
    if (settingsData) {
      const settings = JSON.parse(settingsData)
      saveSetting('site_settings', settings)
      console.log('Migrated site settings from localStorage')
    }

    console.log('Migration from localStorage completed successfully')
  } catch (error) {
    console.error('Error during migration from localStorage:', error)
  }
}

// User authentication functions
export function createUser(username, passwordHash, passwordSalt, role, name, email = null) {
  const db = getDatabase()
  
  const insertUser = db.prepare(`
    INSERT INTO users (username, password_hash, password_salt, role, name, email, active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `)
  
  try {
    const result = insertUser.run(username, passwordHash, passwordSalt, role, name, email)
    return { success: true, id: result.lastInsertRowid }
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, error: 'Username already exists' }
    }
    throw error
  }
}

export function getUserByUsername(username) {
  const db = getDatabase()
  const getUser = db.prepare('SELECT * FROM users WHERE username = ? AND active = 1')
  return getUser.get(username)
}

export function getAllUsers() {
  const db = getDatabase()
  const getUsers = db.prepare(`
    SELECT id, username, role, name, email, active, created_at, updated_at, last_login 
    FROM users 
    ORDER BY created_at DESC
  `)
  return getUsers.all()
}

export function updateUserLastLogin(username) {
  const db = getDatabase()
  const updateLogin = db.prepare(`
    UPDATE users 
    SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
    WHERE username = ?
  `)
  return updateLogin.run(username)
}

export function updateUser(id, updates) {
  const db = getDatabase()
  
  const fields = []
  const values = []
  
  if (updates.name) {
    fields.push('name = ?')
    values.push(updates.name)
  }
  
  if (updates.email !== undefined) {
    fields.push('email = ?')
    values.push(updates.email)
  }
  
  if (updates.role) {
    fields.push('role = ?')
    values.push(updates.role)
  }
  
  if (updates.active !== undefined) {
    fields.push('active = ?')
    values.push(updates.active ? 1 : 0)
  }
  
  if (updates.passwordHash && updates.passwordSalt) {
    fields.push('password_hash = ?', 'password_salt = ?')
    values.push(updates.passwordHash, updates.passwordSalt)
  }
  
  if (fields.length === 0) {
    return { success: false, error: 'No fields to update' }
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)
  
  const updateUser = db.prepare(`
    UPDATE users 
    SET ${fields.join(', ')} 
    WHERE id = ?
  `)
  
  try {
    const result = updateUser.run(...values)
    return { success: true, changes: result.changes }
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, error: 'Username already exists' }
    }
    throw error
  }
}

export function deleteUser(id) {
  const db = getDatabase()
  const deleteUser = db.prepare('DELETE FROM users WHERE id = ?')
  const result = deleteUser.run(id)
  return { success: true, changes: result.changes }
}

// Close database connection
export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}

// Initialize database on module load
initDatabase()