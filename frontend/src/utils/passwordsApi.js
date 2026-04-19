import { API_BASE_URL } from '../config/api'

async function parseApiResponse(response, fallbackMessage) {
  if (response.ok) {
    return response.json()
  }

  let payload = null
  try {
    payload = await response.json()
  } catch (error) {
    payload = null
  }

  throw new Error(payload?.error || fallbackMessage)
}

export async function fetchPasswords(token) {
  const response = await fetch(`${API_BASE_URL}/passwords`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return parseApiResponse(response, 'Error al obtener las contraseñas')
}

export async function createPasswordEntry(token, payload) {
  const response = await fetch(`${API_BASE_URL}/passwords`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })

  return parseApiResponse(response, 'Error al crear la contraseña')
}

export async function updatePasswordEntry(token, passwordId, payload) {
  const response = await fetch(`${API_BASE_URL}/passwords/${passwordId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })

  return parseApiResponse(response, 'Error al actualizar la contraseña')
}

export async function deletePasswordEntry(token, passwordId) {
  const response = await fetch(`${API_BASE_URL}/passwords/${passwordId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return parseApiResponse(response, 'Error al eliminar la contraseña')
}
