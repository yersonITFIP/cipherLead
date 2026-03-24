import { useMemo } from 'react'
import { 
  Search, 
  Plus, 
  Pin, 
  Star, 
  Copy, 
  Trash2, 
  Edit3,
  Eraser,
  Save
} from 'lucide-react'
import { formatDate } from '../../../utils/formatters'

function NotesSection({
  notes,
  draft,
  searchTerm,
  filter,
  onDraftChange,
  onSaveNote,
  onResetDraft,
  onSearchChange,
  onFilterChange,
  onLoadNote,
  onTogglePinned,
  onToggleFavorite,
  onDuplicateNote,
  onDeleteNote
}) {
  const draftWordCount = useMemo(() => {
    return draft.content.trim() ? draft.content.trim().split(/\s+/).length : 0
  }, [draft.content])

  const visibleNotes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return notes.filter((note) => {
      const matchesSearch =
        !normalizedSearch ||
        note.title.toLowerCase().includes(normalizedSearch) ||
        note.content.toLowerCase().includes(normalizedSearch) ||
        note.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))

      if (!matchesSearch) {
        return false
      }

      if (filter === 'pinned') {
        return note.pinned
      }

      if (filter === 'favorites') {
        return note.favorite
      }

      return true
    })
  }, [notes, searchTerm, filter])

  return (
    <section className="notes-hub" aria-label="Panel independiente de notas">
      <article className="dashboard-panel notes-editor-panel">
        <div className="panel-header-with-icon">
          <Edit3 size={24} className="panel-icon" />
          <h3>Notas</h3>
        </div>
        <p>
          Espacio de escritura amplia para registrar ideas, avances y reflexiones. Puedes fijar,
          marcar favoritas, duplicar y filtrar cada nota.
        </p>

        <form className="subject-form" onSubmit={onSaveNote}>
          <label className="field-block" htmlFor="note-title">
            <span>Titulo</span>
            <input
              id="note-title"
              className="auth-input"
              placeholder="Ejemplo: Plan semanal"
              value={draft.title}
              onChange={(event) => onDraftChange('title', event.target.value)}
            />
          </label>

          <div className="note-meta-grid">
            <label className="field-block" htmlFor="note-mood">
              <span>Estado</span>
              <select
                id="note-mood"
                className="auth-input"
                value={draft.mood}
                onChange={(event) => onDraftChange('mood', event.target.value)}
              >
                <option value="focus">Enfoque</option>
                <option value="calm">Calma</option>
                <option value="energy">Energia</option>
                <option value="neutral">Neutral</option>
              </select>
            </label>

            <label className="field-block" htmlFor="note-tags">
              <span>Etiquetas (separadas por coma)</span>
              <input
                id="note-tags"
                className="auth-input"
                placeholder="ideas, trabajo, personal"
                value={draft.tags}
                onChange={(event) => onDraftChange('tags', event.target.value)}
              />
            </label>
          </div>

          <label className="field-block" htmlFor="note-content">
            <span>Contenido</span>
            <textarea
              id="note-content"
              className="auth-input note-textarea note-textarea-large"
              placeholder="Escribe aqui tu nota en detalle..."
              value={draft.content}
              onChange={(event) => onDraftChange('content', event.target.value)}
              rows={14}
              required
            />
          </label>

          <div className="note-editor-footer">
            <p className="note-counter" aria-live="polite">
              {draftWordCount} palabra(s) | {draft.content.length} caracter(es)
            </p>
            <div className="session-actions compact">
              <button className="action-button primary-button" type="submit">
                <Save size={18} />
                <span>{draft.id ? 'Actualizar nota' : 'Guardar nota'}</span>
              </button>
              <button className="action-button ghost" type="button" onClick={onResetDraft}>
                <Eraser size={18} />
                <span>Limpiar</span>
              </button>
            </div>
          </div>
        </form>
      </article>

      <aside className="dashboard-panel notes-sidebar" aria-label="Herramientas de notas">
        <div className="panel-header-with-icon">
          <Search size={20} className="panel-icon" />
          <h3>Biblioteca</h3>
        </div>
        
        <label className="field-block" htmlFor="note-search">
          <span>Buscar nota</span>
          <div className="input-with-icon">
            <Search size={16} className="inner-input-icon" />
            <input
              id="note-search"
              className="auth-input with-left-icon"
              placeholder="Buscar por texto o etiqueta"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </label>

        <label className="field-block" htmlFor="note-filter">
          <span>Filtro rapido</span>
          <select
            id="note-filter"
            className="auth-input"
            value={filter}
            onChange={(event) => onFilterChange(event.target.value)}
          >
            <option value="all">Todas</option>
            <option value="pinned">Solo fijadas</option>
            <option value="favorites">Solo favoritas</option>
          </select>
        </label>

        {visibleNotes.length === 0 ? (
          <p className="empty-state">No hay notas con ese filtro. Prueba otro criterio.</p>
        ) : (
          <ul className="note-list" aria-label="Lista de notas">
            {visibleNotes.map((note) => (
              <li key={note.id} className="note-item note-card">
                <div className="note-card-head">
                  <strong>{note.title || 'Nota sin titulo'}</strong>
                  <span className={`note-mood-badge mood-${note.mood}`}>{note.mood}</span>
                </div>
                <p>{note.content}</p>
                <div className="note-tag-list" aria-label="Etiquetas de la nota">
                  {note.tags.length === 0 ? <span className="note-tag ghost">Sin etiquetas</span> : null}
                  {note.tags.map((tag) => (
                    <span key={`${note.id}-${tag}`} className="note-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
                <time dateTime={note.updatedAt}>{formatDate(note.updatedAt)}</time>
                <div className="session-actions compact">
                  <button className="action-button ghost icon-only" type="button" onClick={() => onLoadNote(note)} title="Editar">
                    <Edit3 size={16} />
                  </button>
                  <button
                    className={`action-button ghost icon-only ${note.pinned ? 'active-tag' : ''}`}
                    type="button"
                    onClick={() => onTogglePinned(note.id)}
                    title={note.pinned ? 'Desfijar' : 'Fijar'}
                  >
                    <Pin size={16} />
                  </button>
                  <button
                    className={`action-button ghost icon-only ${note.favorite ? 'active-tag' : ''}`}
                    type="button"
                    onClick={() => onToggleFavorite(note.id)}
                    title={note.favorite ? 'Quitar favorita' : 'Favorita'}
                  >
                    <Star size={16} />
                  </button>
                  <button className="action-button ghost icon-only" type="button" onClick={() => onDuplicateNote(note.id)} title="Duplicar">
                    <Copy size={16} />
                  </button>
                  <button className="action-button ghost danger icon-only" type="button" onClick={() => onDeleteNote(note.id)} title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </section>
  )
}

export default NotesSection
