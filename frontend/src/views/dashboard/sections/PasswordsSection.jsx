import { useEffect, useMemo, useState } from 'react'
import {
  KeyRound,
  Plus,
  Save,
  Trash2,
  Edit3,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  XCircle,
  Link as LinkIcon,
  UserRound,
  Lock
} from 'lucide-react'
import { readSession } from '../../../utils/sessionStorage'
import {
  fetchPasswords,
  createPasswordEntry,
  updatePasswordEntry,
  deletePasswordEntry
} from '../../../utils/passwordsApi'
import { deleteAlert, successAlert, errorAlert, toast } from '../../../utils/swal'

const INITIAL_FORM = {
  title: '',
  username: '',
  password: '',
  url: '',
  notes: ''
}

const INITIAL_GENERATOR = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: false
}

function buildPassword({ length, uppercase, lowercase, numbers, symbols }) {
  const pools = []
  if (uppercase) pools.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  if (lowercase) pools.push('abcdefghijklmnopqrstuvwxyz')
  if (numbers) pools.push('0123456789')
  if (symbols) pools.push('!@#$%^&*()_+-=[]{}|;:,.<>?')

  if (pools.length === 0) {
    throw new Error('Debes activar al menos un conjunto de caracteres')
  }

  const allChars = pools.join('')
  const chars = []

  pools.forEach((pool) => {
    chars.push(pool[Math.floor(Math.random() * pool.length)])
  })

  while (chars.length < length) {
    chars.push(allChars[Math.floor(Math.random() * allChars.length)])
  }

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join('')
}

function PasswordsSection() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [copiedEntryId, setCopiedEntryId] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [editingId, setEditingId] = useState(null)
  const [generator, setGenerator] = useState(INITIAL_GENERATOR)
  const [showFormPassword, setShowFormPassword] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState({})

  useEffect(() => {
    loadEntries()
  }, [])

  useEffect(() => {
    if (!feedback) return undefined
    const timer = setTimeout(() => setFeedback(''), 2200)
    return () => clearTimeout(timer)
  }, [feedback])

  useEffect(() => {
    if (!copiedEntryId) return undefined
    const timer = setTimeout(() => setCopiedEntryId(null), 1800)
    return () => clearTimeout(timer)
  }, [copiedEntryId])

  const submitLabel = useMemo(() => (editingId ? 'Actualizar entrada' : 'Guardar entrada'), [editingId])

  async function loadEntries() {
    try {
      setLoading(true)
      setError('')
      const { token } = readSession()
      const data = await fetchPasswords(token)
      setEntries(data)
    } catch (loadError) {
      console.error('Error al cargar passwords:', loadError)
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function resetForm() {
    setForm(INITIAL_FORM)
    setEditingId(null)
    setShowFormPassword(false)
  }

  function validateForm() {
    if (!form.title.trim()) {
      throw new Error('El nombre de la entrada es obligatorio')
    }
    if (!form.username.trim()) {
      throw new Error('El usuario o email es obligatorio')
    }
    if (!form.password) {
      throw new Error('La contraseña es obligatoria')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      validateForm()
      setLoading(true)
      setError('')

      const payload = {
        title: form.title.trim(),
        username: form.username.trim(),
        password: form.password,
        url: form.url.trim(),
        notes: form.notes.trim()
      }

      const { token } = readSession()

      if (editingId) {
        const updated = await updatePasswordEntry(token, editingId, payload)
        setEntries((current) => current.map((entry) => (entry.id === editingId ? updated : entry)))
        setFeedback('Entrada actualizada correctamente')
      } else {
        const created = await createPasswordEntry(token, payload)
        setEntries((current) => [created, ...current])
        setFeedback('Entrada creada correctamente')
      }

      resetForm()
    } catch (submitError) {
      console.error('Error al guardar password:', submitError)
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(entry) {
    setEditingId(entry.id)
    setForm({
      title: entry.title || '',
      username: entry.username || '',
      password: entry.password || '',
      url: entry.url || '',
      notes: entry.notes || ''
    })
    setShowFormPassword(false)
    setError('')
  }

  async function handleDelete(entry) {
    const result = await deleteAlert(`la entrada "${entry.title}"`)
    if (!result.isConfirmed) return

    try {
      setLoading(true)
      setError('')
      const { token } = readSession()
      await deletePasswordEntry(token, entry.id)
      setEntries((current) => current.filter((item) => item.id !== entry.id))
      if (editingId === entry.id) {
        resetForm()
      }
      successAlert('Entrada eliminada')
    } catch (deleteError) {
      console.error('Error al eliminar password:', deleteError)
      setError(deleteError.message)
    } finally {
      setLoading(false)
    }
  }

  function handleGeneratorChange(field, value) {
    setGenerator((current) => ({ ...current, [field]: value }))
  }

  function handleGeneratePassword() {
    try {
      const length = Number(generator.length || 0)
      if (length < 8 || length > 64) {
        throw new Error('El largo debe estar entre 8 y 64 caracteres')
      }

      const generated = buildPassword({ ...generator, length })
      updateForm('password', generated)
      setShowFormPassword(true)
      setFeedback('Contraseña generada y aplicada al formulario')
    } catch (generatorError) {
      setError(generatorError.message)
    }
  }

  async function copyPassword(password, entryId = null) {
    if (!password) return

    try {
      await navigator.clipboard.writeText(password)
      setCopiedEntryId(entryId || 'form')
      toast('Contraseña copiada', 'success')
    } catch (clipboardError) {
      errorAlert('Error', 'No se pudo copiar la contraseña')
    }
  }

  function toggleEntryVisibility(entryId) {
    setVisiblePasswords((current) => ({
      ...current,
      [entryId]: !current[entryId]
    }))
  }

  return (
    <section className="passwords-hub" aria-label="Gestor de contraseñas">
      <article className="dashboard-panel passwords-editor-panel">
        <div className="panel-header-with-icon">
          <KeyRound size={22} className="panel-icon" />
          <h3>Gestor de Passwords</h3>
        </div>
        <p>
          Guarda credenciales cifradas por entrada. Puedes generar contraseñas robustas,
          copiarlas con un clic y administrarlas sin salir del dashboard.
        </p>

        <form className="subject-form" onSubmit={handleSubmit}>
          <div className="passwords-field-grid">
            <label className="field-block" htmlFor="password-title">
              <span>Nombre / sitio</span>
              <input
                id="password-title"
                className="auth-input"
                placeholder="Ejemplo: GitHub personal"
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                disabled={loading}
                required
              />
            </label>

            <label className="field-block" htmlFor="password-username">
              <span>Usuario o email</span>
              <div className="input-with-icon">
                <UserRound size={16} className="inner-input-icon" />
                <input
                  id="password-username"
                  className="auth-input with-left-icon"
                  placeholder="tu@email.com"
                  value={form.username}
                  onChange={(event) => updateForm('username', event.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </label>
          </div>

          <label className="field-block" htmlFor="password-secret">
            <span>Contraseña</span>
            <div className="password-input-row">
              <div className="input-with-icon">
                <Lock size={16} className="inner-input-icon" />
                <input
                  id="password-secret"
                  className="auth-input with-left-icon with-right-controls"
                  type={showFormPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => updateForm('password', event.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <button
                className="action-button ghost icon-only"
                type="button"
                onClick={() => setShowFormPassword((current) => !current)}
                title={showFormPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                disabled={loading}
              >
                {showFormPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                className="action-button ghost icon-only"
                type="button"
                onClick={() => copyPassword(form.password)}
                title="Copiar contraseña"
                disabled={loading || !form.password}
              >
                <Copy size={16} />
              </button>
            </div>
          </label>

          <div className="password-generator-box" aria-label="Generador de contraseñas">
            <div className="password-generator-top">
              <strong>Generador seguro</strong>
              <button
                type="button"
                className="action-button ghost"
                onClick={handleGeneratePassword}
                disabled={loading}
              >
                <RefreshCw size={16} />
                <span>Generar</span>
              </button>
            </div>

            <label className="field-block" htmlFor="generator-length">
              <span>Largo ({generator.length})</span>
              <input
                id="generator-length"
                type="range"
                min="8"
                max="64"
                value={generator.length}
                onChange={(event) => handleGeneratorChange('length', Number(event.target.value))}
                disabled={loading}
              />
            </label>

            <div className="password-toggle-grid">
              <label>
                <input
                  type="checkbox"
                  checked={generator.uppercase}
                  onChange={(event) => handleGeneratorChange('uppercase', event.target.checked)}
                  disabled={loading}
                />
                <span>Mayúsculas</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={generator.lowercase}
                  onChange={(event) => handleGeneratorChange('lowercase', event.target.checked)}
                  disabled={loading}
                />
                <span>Minúsculas</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={generator.numbers}
                  onChange={(event) => handleGeneratorChange('numbers', event.target.checked)}
                  disabled={loading}
                />
                <span>Números</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={generator.symbols}
                  onChange={(event) => handleGeneratorChange('symbols', event.target.checked)}
                  disabled={loading}
                />
                <span>Símbolos</span>
              </label>
            </div>
          </div>

          <div className="passwords-field-grid">
            <label className="field-block" htmlFor="password-url">
              <span>URL (opcional)</span>
              <div className="input-with-icon">
                <LinkIcon size={16} className="inner-input-icon" />
                <input
                  id="password-url"
                  className="auth-input with-left-icon"
                  placeholder="https://..."
                  value={form.url}
                  onChange={(event) => updateForm('url', event.target.value)}
                  disabled={loading}
                />
              </div>
            </label>

            <label className="field-block" htmlFor="password-notes">
              <span>Notas (opcional)</span>
              <input
                id="password-notes"
                className="auth-input"
                placeholder="Pistas, recordatorios o contexto"
                value={form.notes}
                onChange={(event) => updateForm('notes', event.target.value)}
                disabled={loading}
              />
            </label>
          </div>

          {error ? <p className="password-feedback error">{error}</p> : null}
          {feedback ? <p className="password-feedback success">{feedback}</p> : null}

          <div className="session-actions compact">
            <button className="action-button primary-button" type="submit" disabled={loading}>
              {editingId ? <Save size={18} /> : <Plus size={18} />}
              <span>{loading ? 'Guardando...' : submitLabel}</span>
            </button>
            <button
              className="action-button ghost"
              type="button"
              onClick={resetForm}
              disabled={loading}
            >
              <XCircle size={16} />
              <span>Limpiar</span>
            </button>
          </div>
        </form>
      </article>

      <aside className="dashboard-panel passwords-list-panel" aria-label="Entradas guardadas">
        <div className="panel-header-with-icon">
          <KeyRound size={20} className="panel-icon" />
          <h3>Entradas</h3>
        </div>

        {loading && entries.length === 0 ? (
          <p className="empty-state">Cargando entradas cifradas...</p>
        ) : entries.length === 0 ? (
          <p className="empty-state">
            No hay contraseñas guardadas todavía. Crea tu primera entrada para comenzar.
          </p>
        ) : (
          <ul className="password-entry-list" aria-label="Lista de contraseñas">
            {entries.map((entry) => {
              const visible = Boolean(visiblePasswords[entry.id])
              return (
                <li key={entry.id}>
                  <article className="password-entry-card">
                    <div className="password-entry-head">
                      <strong>{entry.title}</strong>
                      <span>{new Date(entry.updated_at).toLocaleDateString()}</span>
                    </div>

                    <p className="password-entry-meta">{entry.username}</p>

                    {entry.url ? (
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noreferrer"
                        className="password-entry-link"
                      >
                        {entry.url}
                      </a>
                    ) : null}

                    {entry.notes ? <p className="password-entry-notes">{entry.notes}</p> : null}

                    <div className="password-secret-chip">
                      <code>{visible ? entry.password : '••••••••••••'}</code>
                      <div className="password-secret-actions">
                        <button
                          className="action-button ghost icon-only"
                          type="button"
                          title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          onClick={() => toggleEntryVisibility(entry.id)}
                        >
                          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button
                          className="action-button ghost icon-only"
                          type="button"
                          title="Copiar contraseña"
                          onClick={() => copyPassword(entry.password, entry.id)}
                        >
                          <Copy size={15} />
                        </button>
                      </div>
                    </div>

                    {copiedEntryId === entry.id ? (
                      <small className="copy-feedback-inline">Copiado</small>
                    ) : null}

                    <div className="session-actions compact">
                      <button
                        className="action-button ghost icon-only"
                        type="button"
                        onClick={() => handleEdit(entry)}
                        title="Editar entrada"
                        disabled={loading}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        className="action-button ghost danger icon-only"
                        type="button"
                        onClick={() => handleDelete(entry)}
                        title="Eliminar entrada"
                        disabled={loading}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </aside>
    </section>
  )
}

export default PasswordsSection
