export { 
  getTestaments,
  getTestament,
  saveTestament,
  updateTestament,
  deleteTestament,
  setDefaultTestament,
  getDefaultTestamentId,
  getDefaultTestament,
  clearDefaultTestament,
  isDefaultTestament
} from './api.js'

// Utility function to manually clean up duplicates
export function cleanupDuplicates() {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return { removed: 0, remaining: 0 }

  const testaments = JSON.parse(data)
  const uniqueTestaments = testaments.filter((testament, index, self) =>
    index === self.findIndex(t => t.id === testament.id)
  )

  localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueTestaments))

  return {
    original: testaments.length,
    removed: testaments.length - uniqueTestaments.length,
    remaining: uniqueTestaments.length
  }
}

// Make cleanup available globally for debugging
if (typeof window !== 'undefined') {
  window.cleanupTestamentDuplicates = cleanupDuplicates
}
