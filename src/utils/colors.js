// Color utility functions

// Function to darken a color by a percentage
export function darkenColor(color, percent) {
  // Convert hex to RGB
  let r, g, b
  if (color.startsWith('#')) {
    const hex = color.replace('#', '')
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16)
      g = parseInt(hex[1] + hex[1], 16)
      b = parseInt(hex[2] + hex[2], 16)
    } else {
      r = parseInt(hex.substring(0, 2), 16)
      g = parseInt(hex.substring(2, 4), 16)
      b = parseInt(hex.substring(4, 6), 16)
    }
  } else if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g)
    r = parseInt(match[0])
    g = parseInt(match[1])
    b = parseInt(match[2])
  } else {
    return color
  }

  // Darken by percent
  r = Math.max(0, Math.floor(r * (1 - percent / 100)))
  g = Math.max(0, Math.floor(g * (1 - percent / 100)))
  b = Math.max(0, Math.floor(b * (1 - percent / 100)))

  return `rgb(${r}, ${g}, ${b})`
}

// Function to lighten a color by a percentage
export function lightenColor(color, percent) {
  // Convert hex to RGB
  let r, g, b
  if (color.startsWith('#')) {
    const hex = color.replace('#', '')
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16)
      g = parseInt(hex[1] + hex[1], 16)
      b = parseInt(hex[2] + hex[2], 16)
    } else {
      r = parseInt(hex.substring(0, 2), 16)
      g = parseInt(hex.substring(2, 4), 16)
      b = parseInt(hex.substring(4, 6), 16)
    }
  } else if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g)
    r = parseInt(match[0])
    g = parseInt(match[1])
    b = parseInt(match[2])
  } else {
    return color
  }

  // Lighten by percent
  r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)))
  g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)))
  b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)))

  return `rgb(${r}, ${g}, ${b})`
}
