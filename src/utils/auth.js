import { loginUser } from './api.js'

const AUTH_KEY = 'testament_auth'

// User roles
export const ROLES = {
  ADMIN: 'admin',
  AUTHOR: 'testament-author',
  PUBLIC: 'public-user'
}

export async function login(username, password) {
  try {
    const result = await loginUser(username, password)
    
    if (result.success) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(result.user))
      return { success: true, user: result.user }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Network error during login' }
  }
}

export function logout() {
  localStorage.removeItem(AUTH_KEY)
}

export function getCurrentUser() {
  const data = localStorage.getItem(AUTH_KEY)
  return data ? JSON.parse(data) : null
}

export function isAuthenticated() {
  return getCurrentUser() !== null
}

export function hasRole(role) {
  const user = getCurrentUser()
  return user && user.role === role
}

export function isAdmin() {
  return hasRole(ROLES.ADMIN)
}

export function isAuthor() {
  return hasRole(ROLES.AUTHOR)
}

export function canEditTestament() {
  const user = getCurrentUser()
  return user && (user.role === ROLES.ADMIN || user.role === ROLES.AUTHOR)
}

// Check if current user can edit a specific testament
export function canEditSpecificTestament(testament) {
  const user = getCurrentUser()
  if (!user) return false

  // Users can only edit their own testaments
  return testament.author === user.username
}

// Check if current user can delete a specific testament
export function canDeleteTestament(testament) {
  const user = getCurrentUser()
  if (!user) return false

  // Admins can delete any testament
  if (user.role === ROLES.ADMIN) return true

  // Authors can only delete their own testaments
  return user.role === ROLES.AUTHOR && testament.author === user.username
}

// Check if current user can set default status for a testament
export function canSetDefaultTestament(testament) {
  const user = getCurrentUser()
  if (!user) return false

  // Only admins can set any testament as default
  return user.role === ROLES.ADMIN
}
