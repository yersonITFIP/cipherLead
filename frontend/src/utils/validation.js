/**
 * CipherLeaf - Input Validation & Sanitization
 * Security utilities to prevent XSS, SQL injection, and data theft
 */

// Dangerous patterns that could indicate injection attempts
const DANGEROUS_PATTERNS = {
  // HTML/Script injection
  htmlScript: /<[^>]*script[^>]*>|<script[^>]*>|<\/script>|javascript:|on\w+=/gi,

  // SQL injection keywords
  sqlKeywords: /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE|GRANT|REVOKE)\b/gi,

  // Command injection
  commandInjection: /[;&|`$(){}\\<>]/g,

  // XSS attempts
  xssAttempts: /[<>'"]/g,

  // Null bytes
  nullBytes: /\x00/g,

  // Tab/newline bypass
  lineBreaks: /[\n\r\t]/g
}

// Maximum lengths for different fields
const MAX_LENGTHS = {
  email: 255,
  password: 128,
  displayName: 50,
  title: 200,
  content: 50000,
  url: 2048,
  noteContent: 100000
}

/**
 * Sanitize a string to remove dangerous characters
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return input

  let sanitized = input

  // Remove null bytes
  sanitized = sanitized.replace(DANGEROUS_PATTERNS.nullBytes, '')

  // Remove line breaks that could bypass filters
  sanitized = sanitized.replace(DANGEROUS_PATTERNS.lineBreaks, ' ')

  // Trim whitespace
  sanitized = sanitized.trim()

  return sanitized
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= MAX_LENGTHS.email
}

/**
 * Validate password strength
 */
export function isValidPassword(password) {
  if (!password || typeof password !== 'string') return false
  if (password.length < 8) return false
  if (password.length > MAX_LENGTHS.password) return false
  return true
}

/**
 * Validate display name
 */
export function isValidDisplayName(name) {
  if (!name || typeof name !== 'string') return false
  if (name.length < 2 || name.length > MAX_LENGTHS.displayName) return false

  // Allow letters (including accented), numbers, spaces, hyphens, underscores
  const validNameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-_]+$/
  return validNameRegex.test(name)
}

/**
 * Validate title (for notes, subjects, etc.)
 */
export function isValidTitle(title) {
  if (!title || typeof title !== 'string') return false
  if (title.length < 1 || title.length > MAX_LENGTHS.title) return false

  // Check for injection patterns
  if (DANGEROUS_PATTERNS.htmlScript.test(title)) return false

  return true
}

/**
 * Validate content length
 */
export function isValidContent(content) {
  if (!content || typeof content !== 'string') return true // Empty content is valid
  return content.length <= MAX_LENGTHS.content
}

/**
 * Validate URL format
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return true // Empty URL is valid

  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Check for potential injection attempts
 */
export function detectInjectionAttempt(input) {
  if (!input || typeof input !== 'string') return false

  // Check for dangerous patterns
  if (DANGEROUS_PATTERNS.htmlScript.test(input)) return true
  if (DANGEROUS_PATTERNS.sqlKeywords.test(input)) return true

  return false
}

/**
 * Validate and sanitize all login form fields
 */
export function validateLoginForm({ email, password }) {
  const errors = {}

  // Sanitize inputs first
  const sanitizedEmail = sanitizeString(email)
  const sanitizedPassword = sanitizeString(password)

  if (!sanitizedEmail) {
    errors.email = 'El correo electronico es requerido'
  } else if (!isValidEmail(sanitizedEmail)) {
    errors.email = 'Correo electronico invalido'
  }

  if (!sanitizedPassword) {
    errors.password = 'La contrasena es requerida'
  } else if (!isValidPassword(sanitizedPassword)) {
    errors.password = 'La contrasena debe tener al menos 8 caracteres'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: {
      email: sanitizedEmail,
      password: sanitizedPassword
    }
  }
}

/**
 * Validate and sanitize all register form fields
 */
export function validateRegisterForm({ displayName, email, password, confirmPassword }) {
  const errors = {}

  // Sanitize inputs first
  const sanitizedName = sanitizeString(displayName)
  const sanitizedEmail = sanitizeString(email)
  const sanitizedPassword = sanitizeString(password)
  const sanitizedConfirm = sanitizeString(confirmPassword)

  if (!sanitizedName) {
    errors.displayName = 'El nombre es requerido'
  } else if (!isValidDisplayName(sanitizedName)) {
    errors.displayName = 'El nombre debe tener entre 2 y 50 caracteres (solo letras, numeros, espacios, guiones y guion bajo)'
  }

  if (!sanitizedEmail) {
    errors.email = 'El correo electronico es requerido'
  } else if (!isValidEmail(sanitizedEmail)) {
    errors.email = 'Correo electronico invalido'
  }

  if (!sanitizedPassword) {
    errors.password = 'La contrasena es requerida'
  } else if (!isValidPassword(sanitizedPassword)) {
    errors.password = 'La contrasena debe tener al menos 8 caracteres'
  }

  if (sanitizedPassword !== sanitizedConfirm) {
    errors.confirmPassword = 'Las contrasenas no coinciden'
  }

  if (detectInjectionAttempt(sanitizedName)) {
    errors.displayName = 'Caracteres invalidos detectados'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: {
      displayName: sanitizedName,
      email: sanitizedEmail,
      password: sanitizedPassword,
      confirmPassword: sanitizedConfirm
    }
  }
}

/**
 * Validate and sanitize note/subject title
 */
export function validateTitle(title) {
  const sanitized = sanitizeString(title)

  if (!sanitized) {
    return { isValid: false, error: 'El titulo es requerido', sanitized: '' }
  }

  if (!isValidTitle(sanitized)) {
    return { isValid: false, error: 'Titulo invalido o demasiado largo', sanitized }
  }

  return { isValid: true, error: null, sanitized }
}

/**
 * Validate and sanitize note content
 */
export function validateContent(content) {
  const sanitized = sanitizeString(content)

  if (!isValidContent(sanitized)) {
    return {
      isValid: false,
      error: `El contenido excede el limite de ${MAX_LENGTHS.content} caracteres`,
      sanitized: sanitized.substring(0, MAX_LENGTHS.content)
    }
  }

  return { isValid: true, error: null, sanitized }
}
