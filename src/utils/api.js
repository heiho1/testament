// API client for testament backend
const API_BASE = 'http://localhost:3001/api'

async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

// Testament operations
export async function getTestaments() {
  return await apiCall('/testaments')
}

export async function getTestament(id) {
  return await apiCall(`/testaments/${id}`)
}

export async function saveTestament(testament) {
  const method = 'POST'
  return await apiCall('/testaments', {
    method,
    body: JSON.stringify(testament)
  })
}

export async function updateTestament(id, updates) {
  const existing = await getTestament(id)
  if (existing) {
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }
    await apiCall(`/testaments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updated)
    })
    return updated
  }
  return null
}

export async function deleteTestament(id) {
  return await apiCall(`/testaments/${id}`, {
    method: 'DELETE'
  })
}

// Default testament operations
export async function setDefaultTestament(id) {
  return await apiCall('/default-testament', {
    method: 'POST',
    body: JSON.stringify({ testamentId: id })
  })
}

export async function getDefaultTestamentId() {
  const result = await apiCall('/default-testament')
  return result.id
}

export async function getDefaultTestament() {
  const result = await apiCall('/default-testament')
  return result.testament
}

export async function clearDefaultTestament() {
  return await apiCall('/default-testament', {
    method: 'DELETE'
  })
}

export async function isDefaultTestament(id) {
  const defaultId = await getDefaultTestamentId()
  return defaultId === id
}

// Settings operations
export async function getSettings() {
  return await apiCall('/settings')
}

export async function saveSettings(settings) {
  return await apiCall('/settings', {
    method: 'POST',
    body: JSON.stringify(settings)
  })
}

// Authentication operations
export async function loginUser(username, password) {
  return await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
}

export async function getUserInfo(username) {
  return await apiCall(`/auth/user/${username}`)
}

export async function getAllUsers() {
  return await apiCall('/users')
}