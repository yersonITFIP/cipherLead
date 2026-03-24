import { Plus, FolderOpen, Trash2, FileText, Edit, ChevronLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { readSession } from '../../../utils/sessionStorage'
import { fetchNotesBySubject, createNote, updateNote, deleteNote } from '../../../utils/notesApi'
import NoteModal from '../../../components/NoteModal'
import IconSelector, { getIconComponent } from '../../../components/IconSelector'

function SubjectsSection({
  subjects,
  subjectForm,
  loading,
  error,
  onSubjectFormChange,
  onCreateSubject,
  onDeleteSubject
}) {
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [notes, setNotes] = useState([])
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [notesError, setNotesError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [noteForm, setNoteForm] = useState({ title: '', content: '', imageDataUrl: '' })
  const [editingNoteId, setEditingNoteId] = useState(null)

  useEffect(() => {
    if (selectedSubject) {
      loadNotes(selectedSubject.id)
    }
  }, [selectedSubject])

  async function loadNotes(subjectId) {
    try {
      setLoadingNotes(true)
      setNotesError('')
      const { token } = readSession()
      const data = await fetchNotesBySubject(token, subjectId)
      setNotes(data)
    } catch (error) {
      console.error('Error al cargar notas:', error)
      setNotesError(error.message)
    } finally {
      setLoadingNotes(false)
    }
  }

  function handleSubjectClick(subject) {
    setSelectedSubject(subject)
    setNotes([])
  }

  function handleBackToSubjects() {
    setSelectedSubject(null)
    setNotes([])
    setNotesError('')
  }

  function handleOpenCreateModal() {
    setModalMode('create')
    setNoteForm({ title: '', content: '', imageDataUrl: '' })
    setEditingNoteId(null)
    setIsModalOpen(true)
  }

  function handleOpenEditModal(note) {
    setModalMode('edit')
    setNoteForm({ title: note.title, content: note.content, imageDataUrl: note.imageDataUrl || '' })
    setEditingNoteId(note.id)
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    setNoteForm({ title: '', content: '', imageDataUrl: '' })
    setEditingNoteId(null)
    setNotesError('')
  }

  async function handleSaveNote() {
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      setNotesError('El título y el contenido son obligatorios')
      return
    }

    try {
      setLoadingNotes(true)
      setNotesError('')
      const { token } = readSession()

      if (modalMode === 'create') {
        const newNote = await createNote(
          token,
          selectedSubject.id,
          noteForm.title,
          noteForm.content,
          noteForm.imageDataUrl || ''
        )
        setNotes((current) => [newNote, ...current])
      } else {
        const updatedNote = await updateNote(
          token,
          editingNoteId,
          noteForm.title,
          noteForm.content,
          noteForm.imageDataUrl || ''
        )
        setNotes((current) => current.map(n => n.id === editingNoteId ? updatedNote : n))
      }

      handleCloseModal()
    } catch (error) {
      console.error('Error al guardar nota:', error)
      setNotesError(error.message)
    } finally {
      setLoadingNotes(false)
    }
  }

  async function handleDeleteNote(noteId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      return
    }

    try {
      setLoadingNotes(true)
      setNotesError('')
      const { token } = readSession()
      await deleteNote(token, noteId)
      setNotes((current) => current.filter(n => n.id !== noteId))
    } catch (error) {
      console.error('Error al eliminar nota:', error)
      setNotesError(error.message)
    } finally {
      setLoadingNotes(false)
    }
  }

  // Vista de una materia seleccionada con sus notas
  if (selectedSubject) {
    const SubjectIcon = getIconComponent(selectedSubject.icon || 'Book')

    return (
      <>
        <article className="dashboard-panel subjects-panel">
          <div className="panel-header-with-icon" style={{ marginBottom: '1rem' }}>
            <button
              onClick={handleBackToSubjects}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0.5rem',
                cursor: 'pointer',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s',
                marginRight: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--hover-background)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
              aria-label="Volver a materias"
            >
              <ChevronLeft size={20} />
            </button>
            <SubjectIcon size={22} className="panel-icon" />
            <h3>{selectedSubject.title}</h3>
          </div>
          
          {selectedSubject.description && (
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              {selectedSubject.description}
            </p>
          )}

          <button 
            className="action-button primary-button" 
            onClick={handleOpenCreateModal}
            disabled={loadingNotes}
            style={{ marginBottom: '1.5rem' }}
          >
            <Plus size={18} />
            <span>Nueva Nota</span>
          </button>

          {notesError && (
            <div 
              style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            >
              {notesError}
            </div>
          )}

          {loadingNotes && notes.length === 0 ? (
            <div className="empty-state">
              <p>Cargando notas...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <FileText size={32} className="empty-icon" />
              <p>Aún no tienes notas en esta materia. Crea una para empezar.</p>
            </div>
          ) : (
            <ul className="subject-list" aria-label="Lista de notas">
              {notes.map((note) => (
                <li key={note.id}>
                  <article className="subject-item static" style={{ cursor: 'default' }}>
                    <FileText size={18} className="item-icon" />
                    <div className="subject-item-content">
                      <strong>{note.title}</strong>
                      {note.imageDataUrl ? (
                        <img
                          src={note.imageDataUrl}
                          alt={`Imagen adjunta en nota ${note.title}`}
                          style={{
                            width: '100%',
                            maxWidth: '220px',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '0.5rem',
                            marginBottom: '0.5rem',
                            border: '1px solid var(--border-color)'
                          }}
                          loading="lazy"
                        />
                      ) : null}
                      <span style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {note.content}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        Actualizada: {new Date(note.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="note-action-button"
                        onClick={() => handleOpenEditModal(note)}
                        disabled={loadingNotes}
                        title="Editar nota"
                        aria-label={`Editar nota ${note.title}`}
                        style={{
                          padding: '0.5rem',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6b7280',
                          borderRadius: '0.375rem',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
                          e.currentTarget.style.color = '#3b82f6'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = '#6b7280'
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="note-action-button"
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={loadingNotes}
                        title="Eliminar nota"
                        aria-label={`Eliminar nota ${note.title}`}
                        style={{
                          padding: '0.5rem',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6b7280',
                          borderRadius: '0.375rem',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                          e.currentTarget.style.color = '#ef4444'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = '#6b7280'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </article>

        <NoteModal
          isOpen={isModalOpen}
          mode={modalMode}
          noteForm={noteForm}
          loading={loadingNotes}
          error={notesError}
          onClose={handleCloseModal}
          onSave={handleSaveNote}
          onTitleChange={(value) => setNoteForm(prev => ({ ...prev, title: value }))}
          onContentChange={(value) => setNoteForm(prev => ({ ...prev, content: value }))}
          onImageChange={(value) => setNoteForm(prev => ({ ...prev, imageDataUrl: value }))}
        />
      </>
    )
  }

  // Vista principal de materias
  const MainIcon = getIconComponent('Book')
  
  return (
    <article className="dashboard-panel subjects-panel">
      <div className="panel-header-with-icon">
        <MainIcon size={22} className="panel-icon" />
        <h3>Materias</h3>
      </div>
      <p>
        Organiza tu diario por temas o categorias. Cada materia puede agrupar notas relacionadas
        para mantener tu espacio ordenado.
      </p>

      <form className="subject-form" onSubmit={onCreateSubject}>
        <label className="field-block" htmlFor="subject-name">
          <span>Nombre</span>
          <input
            id="subject-name"
            className="auth-input"
            placeholder="Ejemplo: Proyectos personales"
            value={subjectForm.name}
            onChange={(event) => onSubjectFormChange('name', event.target.value)}
            disabled={loading}
            required
          />
        </label>
        <label className="field-block" htmlFor="subject-description">
          <span>Descripcion (opcional)</span>
          <input
            id="subject-description"
            className="auth-input"
            placeholder="Breve descripcion de esta materia"
            value={subjectForm.description}
            onChange={(event) => onSubjectFormChange('description', event.target.value)}
            disabled={loading}
          />
        </label>
        <IconSelector
          selectedIcon={subjectForm.icon || 'Book'}
          onIconSelect={(iconName) => onSubjectFormChange('icon', iconName)}
          disabled={loading}
        />
        {error && (
          <div className="error-message" style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
        <button className="action-button primary-button" type="submit" disabled={loading}>
          <Plus size={18} />
          <span>{loading ? 'Creando...' : 'Crear materia'}</span>
        </button>
      </form>

      {loading && subjects.length === 0 ? (
        <div className="empty-state">
          <p>Cargando materias...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={32} className="empty-icon" />
          <p>Aun no tienes materias. Crea una para empezar a organizar tus notas.</p>
        </div>
      ) : (
        <ul className="subject-list" aria-label="Lista de materias">
          {subjects.map((subject) => {
            const SubjectIcon = getIconComponent(subject.icon || 'Book')
            
            return (
              <li key={subject.id}>
                <article 
                  className="subject-item static"
                  onClick={() => handleSubjectClick(subject)}
                  style={{ cursor: 'pointer' }}
                >
                  <SubjectIcon size={18} className="item-icon" />
                  <div className="subject-item-content">
                  <strong>{subject.title}</strong>
                  <span>{subject.description || 'Sin descripcion'}</span>
                </div>
                <button
                  className="subject-delete-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSubject(subject.id)
                  }}
                  disabled={loading}
                  title="Eliminar materia"
                  aria-label={`Eliminar materia ${subject.title}`}
                  style={{
                    marginLeft: 'auto',
                    padding: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    borderRadius: '0.375rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                    e.currentTarget.style.color = '#ef4444'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#6b7280'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </article>
            </li>
            )
          })}
        </ul>
      )}
    </article>
  )
}

export default SubjectsSection
