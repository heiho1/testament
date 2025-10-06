#!/usr/bin/env node

import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createHash, randomBytes } from 'crypto'

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

// Hash password with salt
function hashPassword(password) {
  const salt = randomBytes(32).toString('hex')
  const hash = createHash('sha256').update(password + salt).digest('hex')
  return { hash, salt }
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
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
🔧 Testament Admin User Creation Tool
=====================================

Usage:
  npm run create-admin -- --create <username> <password> <name> [email] [role]
  npm run create-admin -- --list
  npm run create-admin -- --help

Examples:
  npm run create-admin -- --create admin admin123 "Admin User" admin@example.com admin
  npm run create-admin -- --create author secret123 "John Doe" john@example.com author
  npm run create-admin -- --list

Roles: admin, author, public (default: admin)
`)
    return null
  }
  
  if (args[0] === '--list') {
    return { action: 'list' }
  }
  
  if (args[0] === '--create') {
    if (args.length < 4) {
      console.log('❌ Error: --create requires at least username, password, and name')
      console.log('Usage: npm run create-admin -- --create <username> <password> <name> [email] [role]')
      return null
    }
    
    const [, username, password, name, email, role] = args
    
    let roleValue = ROLES.ADMIN
    if (role) {
      switch (role.toLowerCase()) {
        case 'admin':
          roleValue = ROLES.ADMIN
          break
        case 'author':
          roleValue = ROLES.AUTHOR
          break
        case 'public':
          roleValue = ROLES.PUBLIC
          break
        default:
          console.log(`❌ Error: Invalid role '${role}'. Valid roles: admin, author, public`)
          return null
      }
    }
    
    return {
      action: 'create',
      userData: {
        username,
        password,
        name,
        email: email || null,
        role: roleValue
      }
    }
  }
  
  console.log(`❌ Error: Unknown action '${args[0]}'`)
  console.log('Use --help for usage information')
  return null
}

// Main function
function main() {
  console.log('🔧 Testament Admin User Creation Tool')
  console.log('=====================================\n')
  
  try {
    const config = parseArgs()
    if (!config) {
      process.exit(1)
    }
    
    // Initialize database
    const db = initDatabase()
    
    switch (config.action) {
      case 'create':
        console.log(`👤 Creating user '${config.userData.username}'...\n`)
        createUser(db, config.userData)
        console.log('\n📋 Updated user list:')
        listUsers(db)
        break
        
      case 'list':
        listUsers(db)
        break
    }
    
    db.close()
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Run the script
main()