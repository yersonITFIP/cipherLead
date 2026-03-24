import { X, Save } from 'lucide-react'
import { useEffect, useRef } from 'react'

/**
 * NoteModal - Modal minimalista estilo Notion para crear/editar notas
 * 
 * Diseño inspirado en Notion:
 * - Sin bordes visibles en los campos
 * - Tipografía elegante y proporcional
 * - Espaciado generoso y limpio
 * - Botones de acción en el header
 * - Focus en el contenido, no en la UI
 */
function NoteModal({
  isOpen,
  mode,
  noteForm,
  loading,
  error,
  onClose,
  onSave,
  onTitleChange,
  onContentChange,
  onImageChange
}) {
  const titleInputRef = useRef(null)
  const modalContentRef = useRef(null)

  // Auto-focus en el título al abrir el modal
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isOpen])

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, loading, onClose])

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave()
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      onImageChange(result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div 
      className="note-modal-backdrop" 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        ref={modalContentRef}
        className="note-modal-content"
        style={{
          backgroundColor: 'var(--card-background)',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '1100px', // Más grande
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header minimalista - Solo botones de acción y cerrar */}
        <div 
          className="note-modal-header"
          style={{
            padding: '0.75rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            minHeight: '56px'
          }}
        >
          {/* Botones de acción a la izquierda */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onSave}
              disabled={loading}
              style={{
                background: loading ? 'var(--hover-background)' : '#2563eb',
                border: 'none',
                padding: '0.5rem 1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#2563eb'
                }
              }}
            >
              <Save size={16} />
              <span>{loading ? 'Guardando...' : 'Guardar'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0.5rem 1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'var(--hover-background)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              Cancelar
            </button>
          </div>

          {/* Botón cerrar (X) a la derecha */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'var(--hover-background)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Área de contenido - Form estilo Notion */}
        <form 
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden'
          }}
        >
          <div 
            className="note-modal-body"
            style={{
              padding: '3rem 4rem',
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Mensaje de error discreto (solo si existe) */}
            {error && (
              <div 
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  color: '#dc2626',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  marginBottom: '1.5rem',
                  lineHeight: '1.5'
                }}
              >
                {error}
              </div>
            )}

            {/* Input de título sin bordes - estilo Notion */}
            <input
              ref={titleInputRef}
              type="text"
              placeholder="Sin título"
              value={noteForm.title}
              onChange={(e) => onTitleChange(e.target.value)}
              disabled={loading}
              required
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '1.75rem', // 28px - un poco más pequeño
                fontWeight: 700,
                color: 'var(--text-primary)',
                padding: '0.5rem 0',
                marginBottom: '1rem',
                width: '100%',
                lineHeight: '1.2',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'text',
                transition: 'opacity 0.2s'
              }}
            />

            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="note-image-upload"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.9rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem'
                }}
              >
                <span>Adjuntar imagen</span>
              </label>
              <input
                id="note-image-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={loading}
                style={{ display: 'none' }}
              />
            </div>

            {noteForm.imageDataUrl ? (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '560px',
                  marginBottom: '1rem'
                }}
              >
                <img
                  src={noteForm.imageDataUrl}
                  alt="Imagen integrada en la nota"
                  style={{
                    width: '100%',
                    maxHeight: '360px',
                    objectFit: 'cover',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border-color)',
                    display: 'block'
                  }}
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => onImageChange('')}
                  disabled={loading}
                  aria-label="Quitar imagen"
                  style={{
                    position: 'absolute',
                    top: '0.55rem',
                    right: '0.55rem',
                    width: '28px',
                    height: '28px',
                    borderRadius: '999px',
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(15, 23, 42, 0.72)',
                    color: '#fff',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : null}

            {/* Textarea del contenido sin bordes - estilo Notion */}
            <textarea
              placeholder="Empieza a escribir..."
              value={noteForm.content}
              onChange={(e) => onContentChange(e.target.value)}
              disabled={loading}
              required
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                flex: 1,
                resize: 'none',
                fontFamily: 'inherit',
                fontSize: '1rem', // 16px
                fontWeight: 400,
                color: 'var(--text-primary)',
                lineHeight: '1.75', // Line height cómodo
                padding: '0.5rem 0',
                width: '100%',
                minHeight: '400px',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'text',
                transition: 'opacity 0.2s'
              }}
            />
          </div>
        </form>
      </div>

      {/* Estilos de animación */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Placeholder color discreto */
        .note-modal-body input::placeholder,
        .note-modal-body textarea::placeholder {
          color: var(--text-tertiary);
          opacity: 0.5;
        }

        /* Scrollbar personalizado para el modal */
        .note-modal-body::-webkit-scrollbar {
          width: 8px;
        }

        .note-modal-body::-webkit-scrollbar-track {
          background: transparent;
        }

        .note-modal-body::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
        }

        .note-modal-body::-webkit-scrollbar-thumb:hover {
          background: var(--text-tertiary);
        }

        /* Responsive - Mobile */
        @media (max-width: 768px) {
          .note-modal-content {
            max-width: 100% !important;
            border-radius: 0 !important;
            height: 100vh !important;
          }

          .note-modal-body {
            padding: 2rem 1.5rem !important;
          }

          .note-modal-body input {
            font-size: 1.75rem !important;
          }

          .note-modal-header {
            padding: 0.75rem 1rem !important;
          }
        }
      `}</style>
    </div>
  )
}

export default NoteModal
