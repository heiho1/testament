#!/usr/bin/env node

import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createHash, randomBytes } from 'crypto'
import { createInterface } from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Database file path
const dbPath = join(__dirname, 'testament.db')

// User roles
const ROLES = {
  ADMIN: 'admin',
  AUTHOR: 'testament-author',
  PUBLIC: 'public-user'
}

// Initialize readline interface for user input
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})

// Utility function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

// Utility function to ask for password (simplified - visible input for now)
function askPassword(question) {
  return askQuestion(question)
}

// Hash password with salt
function hashPassword(password) {
  const salt = randomBytes(32).toString('hex')
  const hash = createHash('sha256').update(password + salt).digest('hex')
  return { hash, salt }
}

// Verify password
function verifyPassword(password, hash, salt) {
  const testHash = createHash('sha256').update(password + salt).digest('hex')
  return testHash === hash
}

// Initialize database and create users table
function initDatabase() {
  const db = new Database(dbPath)
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON')
  
  // Create users table if it doesn't exist
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
  
  db.exec(createUsersTable)
  
  console.log('✅ Database initialized and users table created/verified')
  return db
}

// Create admin user
function createUser(db, userData) {
  const { hash, salt } = hashPassword(userData.password)
  
  const insertUser = db.prepare(`
    INSERT INTO users (username, password_hash, password_salt, role, name, email, active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `)
  
  try {
    const result = insertUser.run(
      userData.username,
      hash,
      salt,
      userData.role,
      userData.name,
      userData.email || null
    )
    
    console.log(`✅ User '${userData.username}' created successfully with ID: ${result.lastInsertRowid}`)
    return result
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log(`❌ Error: Username '${userData.username}' already exists`)
    } else {
      console.log(`❌ Error creating user: ${error.message}`)
    }
    return null
  }
}

// List existing users
function listUsers(db) {
  const getUsers = db.prepare('SELECT id, username, role, name, email, active, created_at FROM users ORDER BY created_at DESC')
  const users = getUsers.all()
  
  if (users.length === 0) {
    console.log('📝 No users found in database')
    return
  }
  
  console.log('\n📋 Existing users:')
  console.log('ID | Username | Role | Name | Email | Active | Created')
  console.log('---|----------|------|------|-------|--------|---------')
  
  users.forEach(user => {
    const createdAt = new Date(user.created_at).toLocaleDateString()
    const active = user.active ? '✅' : '❌'
    console.log(`${user.id.toString().padEnd(2)} | ${user.username.padEnd(8)} | ${user.role.padEnd(4)} | ${user.name.padEnd(4)} | ${(user.email || '').padEnd(5)} | ${active.padEnd(6)} | ${createdAt}`)
  })
  console.log('')
}

// Main function
async function main() {
  console.log('🔧 Testament Admin User Creation Tool')
  console.log('=====================================\n')
  
  try {
    // Initialize database
    const db = initDatabase()
    
    // Show existing users
    listUsers(db)
    
    // Ask what to do
    const action = await askQuestion('What would you like to do? (create/list/quit): ')
    
    switch (action.toLowerCase()) {
      case 'create':
      case 'c':
        console.log('\n👤 Creating new user...\n')
        
        const username = await askQuestion('Enter username: ')
        if (!username) {
          console.log('❌ Username is required')
          process.exit(1)
        }
        
        const password = await askPassword('Enter password: ')
        if (!password) {
          console.log('❌ Password is required')
          process.exit(1)
        }
        
        const confirmPassword = await askPassword('Confirm password: ')
        if (password !== confirmPassword) {
          console.log('❌ Passwords do not match')
          process.exit(1)
        }
        
        const name = await askQuestion('Enter full name: ')
        if (!name) {
          console.log('❌ Full name is required')
          process.exit(1)
        }
        
        const email = await askQuestion('Enter email (optional): ')
        
        const roleInput = await askQuestion('Enter role (admin/author/public) [admin]: ')
        const role = roleInput || 'admin'
        
        let roleValue
        switch (role.toLowerCase()) {
          case 'admin':
          case 'a':
            roleValue = ROLES.ADMIN
            break
          case 'author':
          case 'au':
            roleValue = ROLES.AUTHOR
            break
          case 'public':
          case 'p':
            roleValue = ROLES.PUBLIC
            break
          default:
            roleValue = ROLES.ADMIN
        }
        
        const userData = {
          username,
          password,
          name,
          email,
          role: roleValue
        }
        
        createUser(db, userData)
        break
        
      case 'list':
      case 'l':
        // Already listed above
        break
        
      case 'quit':
      case 'q':
      case '':
        console.log('👋 Goodbye!')
        break
        
      default:
        console.log('❌ Invalid option')
        break
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    rl.close()
  }
}

// Run the script
main().catch(console.error)