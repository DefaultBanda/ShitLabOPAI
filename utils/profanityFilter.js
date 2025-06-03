import Filter from "leo-profanity"

// Initialize the filter
Filter.loadDictionary()

// Check if text contains profanity
export function isProfane(text) {
  if (!text) return false
  return Filter.check(text)
}

// Get a clean version of the name
export function getCleanName(name) {
  if (!name || !name.trim()) return "Anonymous"

  if (isProfane(name)) {
    return "Anonymous"
  }

  return name.trim()
}

// Clean a text by replacing profanity with asterisks
export function cleanText(text) {
  if (!text) return ""
  return Filter.clean(text)
}
