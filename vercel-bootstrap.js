#!/usr/bin/env node

/**
 * Vercel Database Bootstrap Script
 * 
 * This script initializes the SQLite database and creates an admin user
 * for deployment on Vercel. It runs during the build process and uses
 * environment variables for configuration.
 */

import { initDatabase, createUser, getUserByUsername } from './src/utils/database.js'
import { createHash, randomBytes } from 'crypto'

// Environment variables for admin user
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD 
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrator'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''
const ADMIN_ROLE = process.env.ADMIN_ROLE || 'admin'

// Validation function
function validateEnvironment() {
  const errors = []
  
  if (!ADMIN_PASSWORD) {
    errors.push('ADMIN_PASSWORD is required')
  }
  
  if (ADMIN_PASSWORD && ADMIN_PASSWORD.length < 6) {
    errors.push('ADMIN_PASSWORD must be at least 6 characters')
  }
  
  return errors
}

// Hash password function (copied from create-admin-cli.js)
function hashPassword(password) {
  const salt = randomBytes(32).toString('hex')
  const hash = createHash('sha256').update(password + salt).digest('hex')
  return { hash, salt }
}

// Database user creation function
async function createAdminUser() {
  try {
    console.log('🔧 Vercel Bootstrap: Initializing database...')
    
    // Initialize database
    initDatabase()
    
    // Check if admin user already exists
    const existingUser = getUserByUsername(ADMIN_USERNAME)
    
    if (existingUser) {
      console.log(`✅ Admin user '${ADMIN_USERNAME}' already exists (ID: ${existingUser.id})`)
      return
    }
    
    // Create admin user with hashed password
    const { hash, salt } = hashPassword(ADMIN_PASSWORD)
    
    const result = createUser(
      ADMIN_USERNAME,
      hash,
      salt,
      ADMIN_ROLE,
      ADMIN_NAME,
      ADMIN_EMAIL || null
    )
    
    if (result.success) {
      console.log(`✅ Admin user '${ADMIN_USERNAME}' created successfully (ID: ${result.id})`)
      console.log(`   Name: ${ADMIN_NAME}`)
      console.log(`   Email: ${ADMIN_EMAIL || 'none'}`)
      console.log(`   Role: ${ADMIN_ROLE}`)
    } else {
      console.error(`❌ Failed to create admin user: ${result.error}`)
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Error during database bootstrap:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Vercel database bootstrap...')
  
  // Validate environment variables
  const errors = validateEnvironment()
  if (errors.length > 0) {
    console.error('❌ Environment validation errors:')
    errors.forEach(error => console.error(`   - ${error}`))
    console.error('')
    console.error('Required environment variables in Vercel:')
    console.error('   - ADMIN_PASSWORD (minimum 6 characters)')
    console.error('Optional environment variables:')
    console.error('   - ADMIN_USERNAME (default: admin)')
    console.error('   - ADMIN_NAME (default: Administrator)')
    console.error('   - ADMIN_EMAIL (default: empty)')
    console.error('   - ADMIN_ROLE (default: admin)')
    process.exit(1)
  }
  
  console.log('📋 Bootstrap configuration:')
  console.log(`   Username: ${ADMIN_USERNAME}`)
  console.log(`   Name: ${ADMIN_NAME}`)
  console.log(`   Email: ${ADMIN_EMAIL || 'none'}`)
  console.log(`   Role: ${ADMIN_ROLE}`)
  console.log(`   Password: ${'*'.repeat(ADMIN_PASSWORD.length)}`)
  console.log('')
  
  await createAdminUser()
  
  console.log('✅ Vercel database bootstrap completed successfully!')
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Run the bootstrap
main().catch(error => {
  console.error('❌ Bootstrap failed:', error.message)
  process.exit(1)
})