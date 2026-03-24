const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function createSubject(token, title, description, icon = 'Book') {
  const response = await fetch(`${API_BASE_URL}/subjects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, description, icon })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al crear la materia')
  }

  return response.json()
}

export async function fetchSubjects(token) {
  const response = await fetch(`${API_BASE_URL}/subjects`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al obtener las materias')
  }

  return response.json()
}

export async function deleteSubject(token, subjectId) {
  const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al eliminar la materia')
  }

  return response.json()
}
