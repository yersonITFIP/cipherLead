const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function createNote(token, subjectId, title, content, imageDataUrl = '') {
  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ subjectId, title, content, imageDataUrl })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al crear la nota')
  }

  return response.json()
}

export async function fetchNotesBySubject(token, subjectId) {
  const response = await fetch(`${API_BASE_URL}/notes/subject/${subjectId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al obtener las notas')
  }

  return response.json()
}

export async function fetchNote(token, noteId) {
  const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al obtener la nota')
  }

  return response.json()
}

export async function updateNote(token, noteId, title, content, imageDataUrl = '') {
  const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, content, imageDataUrl })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al actualizar la nota')
  }

  return response.json()
}

export async function deleteNote(token, noteId) {
  const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al eliminar la nota')
  }

  return response.json()
}
