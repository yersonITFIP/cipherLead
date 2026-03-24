const SESSION_TOKEN_KEY = 'auth_token'
const SESSION_USER_KEY = 'auth_user'
const PENDING_CHALLENGE_KEY = 'pending_2fa_challenge'

export function readSession() {
  return {
    token: localStorage.getItem(SESSION_TOKEN_KEY) || '',
    user: JSON.parse(localStorage.getItem(SESSION_USER_KEY) || 'null')
  }
}

export function persistSession(token, user) {
  localStorage.setItem(SESSION_TOKEN_KEY, token)
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(SESSION_TOKEN_KEY)
  localStorage.removeItem(SESSION_USER_KEY)
}

export function readPendingChallenge() {
  return JSON.parse(sessionStorage.getItem(PENDING_CHALLENGE_KEY) || 'null')
}

export function persistPendingChallenge(data) {
  sessionStorage.setItem(PENDING_CHALLENGE_KEY, JSON.stringify(data))
}

export function clearPendingChallenge() {
  sessionStorage.removeItem(PENDING_CHALLENGE_KEY)
}
