import { useEffect, useState } from 'react'
import { LogOut, User as UserIcon, HelpCircle, LifeBuoy, Shield } from 'lucide-react'
import { DASHBOARD_SECTIONS, PROFILE_SECTIONS } from './dashboard/constants'
import ActivitySection from './dashboard/sections/ActivitySection'
import IdentitySection from './dashboard/sections/IdentitySection'
import OverviewSection from './dashboard/sections/OverviewSection'
import PasswordsSection from './dashboard/sections/PasswordsSection'
import SecuritySection from './dashboard/sections/SecuritySection'
import SubjectsSection from './dashboard/sections/SubjectsSection'
import { fetchSubjects, createSubject, deleteSubject } from '../utils/subjectsApi'
import { readSession } from '../utils/sessionStorage'
import ThemeToggleButton from '../components/ThemeToggleButton'

const DISPLAY_NAME_STORAGE_KEY = 'diario-display-name'

function DashboardView({
  working,
  displayName,
  profile,
  user,
  protectedSummary,
  twoFactorStatus,
  setupData,
  setupCode,
  disableCode,
  onRefresh,
  onLogout,
  onStartTwoFactorSetup,
  onEnableTwoFactor,
  onDisableTwoFactor,
  onSetupCodeChange,
  onDisableCodeChange,
  onCancelSetup
}) {
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '', icon: 'Book' })
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [subjectError, setSubjectError] = useState('')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [displayNameDraft, setDisplayNameDraft] = useState(() => {
    if (typeof window === 'undefined') {
      return displayName || ''
    }

    return window.localStorage.getItem(DISPLAY_NAME_STORAGE_KEY) || displayName || ''
  })
  const [displayNameLocal, setDisplayNameLocal] = useState(() => {
    if (typeof window === 'undefined') {
      return displayName || ''
    }

    return window.localStorage.getItem(DISPLAY_NAME_STORAGE_KEY) || displayName || ''
  })
  const [settingsFeedback, setSettingsFeedback] = useState('')

  const resolvedDisplayName = displayNameLocal || displayName || 'Sin nombre'

  const securityStatus = twoFactorStatus.enabled ? 'Blindaje activo' : 'Blindaje pendiente'
  const securityHint = twoFactorStatus.enabled
    ? 'Tu diario exige verificacion adicional en cada inicio de sesion.'
    : 'Activa el 2FA para reforzar el acceso antes de habilitar cifrado por entrada.'

  useEffect(() => {
    loadSubjects()
  }, [])

  async function loadSubjects() {
    try {
      setLoadingSubjects(true)
      setSubjectError('')
      const { token } = readSession()
      const data = await fetchSubjects(token)
      setSubjects(data)
    } catch (error) {
      console.error('Error al cargar materias:', error)
      setSubjectError(error.message)
    } finally {
      setLoadingSubjects(false)
    }
  }

  function handleSavePreferences(event) {
    event.preventDefault()

    const nextDisplayName = displayNameDraft.trim()
    setDisplayNameLocal(nextDisplayName || displayName || '')
    setSettingsFeedback('Configuracion guardada correctamente.')

    if (typeof window !== 'undefined') {
      if (nextDisplayName) {
        window.localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, nextDisplayName)
      } else {
        window.localStorage.removeItem(DISPLAY_NAME_STORAGE_KEY)
      }
    }
  }

  function handleSubjectFormChange(field, value) {
    setSubjectForm((current) => ({ ...current, [field]: value }))
  }

  async function handleCreateSubject(event) {
    event.preventDefault()

    const trimmedName = subjectForm.name.trim()
    const trimmedDescription = subjectForm.description.trim()
    const icon = subjectForm.icon || 'Book'
    
    if (!trimmedName) {
      return
    }

    try {
      setLoadingSubjects(true)
      setSubjectError('')
      const { token } = readSession()
      const newSubject = await createSubject(token, trimmedName, trimmedDescription, icon)
      
      setSubjects((current) => [newSubject, ...current])
      setSubjectForm({ name: '', description: '', icon: 'Book' })
    } catch (error) {
      console.error('Error al crear materia:', error)
      setSubjectError(error.message)
    } finally {
      setLoadingSubjects(false)
    }
  }

  async function handleDeleteSubject(subjectId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta materia?')) {
      return
    }

    try {
      setLoadingSubjects(true)
      setSubjectError('')
      const { token } = readSession()
      await deleteSubject(token, subjectId)
      
      setSubjects((current) => current.filter(s => s.id !== subjectId))
    } catch (error) {
      console.error('Error al eliminar materia:', error)
      setSubjectError(error.message)
    } finally {
      setLoadingSubjects(false)
    }
  }

  return (
    <div className={`dashboard-layout ${sidebarCollapsed ? 'sidebar-is-collapsed' : 'sidebar-is-open'}`}>
      {/* Mobile Backdrop */}
      {!sidebarCollapsed && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarCollapsed(true)}
          aria-hidden="true"
        />
      )}

      <aside className="dashboard-nav-sector" aria-label="Navegacion del dashboard">
        <div className="sidebar-header">
          <div className="dashboard-brand" aria-label="Marca de CipherLeaf">
            <img src="/logo.png" alt="Logo CipherLeaf" width="32" height="32" />
            <span className="sidebar-label">CipherLeaf</span>
          </div>
        </div>

        <nav className="dashboard-nav" aria-label="Secciones del dashboard">
          <p className="dashboard-nav-title sidebar-label">Principal</p>
          <ul className="dashboard-nav-list">
            {DASHBOARD_SECTIONS.map((section) => {
              const Icon = section.icon
              return (
                <li key={section.id}>
                  <button
                    className={`dashboard-nav-button ${activeSection === section.id ? 'active' : ''}`}
                    type="button"
                    onClick={() => {
                      setActiveSection(section.id)
                      if (window.innerWidth <= 1024) setSidebarCollapsed(true)
                    }}
                    aria-current={activeSection === section.id ? 'page' : undefined}
                    title={sidebarCollapsed ? section.label : undefined}
                  >
                    <Icon size={20} className="lucide-icon" />
                    <span className="sidebar-label">{section.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="action-button secondary nav-logout-button" disabled={working} onClick={onLogout} title={sidebarCollapsed ? "Cerrar sesion" : undefined}>
            <LogOut size={18} className="lucide-icon" />
            <span className="sidebar-label">Cerrar sesion</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main-area">
        <header className="dashboard-top-bar">
          <div className="top-bar-left">
            <button 
              className="sidebar-toggle-button" 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? "Expandir menu" : "Contraer menu"}
            >
              <div className="burger-icon">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
            <div className="top-bar-welcome">
              <h2>{DASHBOARD_SECTIONS.find(s => s.id === activeSection)?.label || 'Panel'}</h2>
            </div>
          </div>

          <div className="top-bar-right">
            <ThemeToggleButton />

            <div className="user-profile-summary">
              <span className="user-name-label">{resolvedDisplayName}</span>
              <button
                className="user-avatar-button"
                type="button"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                onClick={() => setProfileMenuOpen((current) => !current)}
              >
                <UserProfileIcon />
              </button>

              {profileMenuOpen ? (
                <div className="user-hub-menu" role="menu" aria-label="Configuracion de cuenta">
                  <div className="menu-user-info">
                    <strong>{resolvedDisplayName}</strong>
                    <p>{user?.email}</p>
                  </div>
                  <div className="menu-divider"></div>
                  {PROFILE_SECTIONS.map((section) => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.id}
                        type="button"
                        className="user-hub-item"
                        role="menuitem"
                        onClick={() => {
                          setActiveSection(section.id)
                          setProfileMenuOpen(false)
                          if (window.innerWidth <= 1024) setSidebarCollapsed(true)
                        }}
                      >
                        <Icon size={18} className="lucide-icon" />
                        <span>{section.label}</span>
                      </button>
                    )
                  })}
                  <div className="menu-divider"></div>
                  <button className="user-hub-item logout-item" onClick={onLogout}>
                    <LogOut size={18} className="lucide-icon" />
                    <span>Cerrar sesion</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <section className="dashboard-content" aria-live="polite">
          {activeSection === 'overview' ? (
            <OverviewSection
              profile={profile}
              user={user}
              securityStatus={securityStatus}
              securityHint={securityHint}
              protectedSummary={protectedSummary}
            />
          ) : null}

          {activeSection === 'subjects' ? (
            <SubjectsSection
              subjects={subjects}
              subjectForm={subjectForm}
              loading={loadingSubjects}
              error={subjectError}
              onSubjectFormChange={handleSubjectFormChange}
              onCreateSubject={handleCreateSubject}
              onDeleteSubject={handleDeleteSubject}
            />
          ) : null}

          {activeSection === 'passwords' ? (
            <PasswordsSection />
          ) : null}

          {activeSection === 'identity' ? (
            <IdentitySection
              displayName={resolvedDisplayName}
              profile={profile}
              user={user}
              displayNameDraft={displayNameDraft}
              onDisplayNameDraftChange={setDisplayNameDraft}
              onSavePreferences={handleSavePreferences}
              settingsFeedback={settingsFeedback}
            />
          ) : null}

          {activeSection === 'security' ? (
            <SecuritySection
              working={working}
              twoFactorStatus={twoFactorStatus}
              setupData={setupData}
              setupCode={setupCode}
              disableCode={disableCode}
              onStartTwoFactorSetup={onStartTwoFactorSetup}
              onEnableTwoFactor={onEnableTwoFactor}
              onDisableTwoFactor={onDisableTwoFactor}
              onSetupCodeChange={onSetupCodeChange}
              onDisableCodeChange={onDisableCodeChange}
              onCancelSetup={onCancelSetup}
            />
          ) : null}

          {activeSection === 'activity' ? (
            <ActivitySection
              protectedSummary={protectedSummary}
              twoFactorStatus={twoFactorStatus}
              profile={profile}
              user={user}
              working={working}
              onRefresh={onRefresh}
            />
          ) : null}
        </section>

        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <img src="/logo.png" alt="CipherLeaf" className="footer-brand-logo" />
              <span className="footer-brand-name">CipherLeaf</span>
            </div>
            <span className="footer-copyright">
              &copy; {new Date().getFullYear()} CipherLeaf. Todos los derechos reservados.
            </span>
            <div className="footer-links">
              <a href="#" className="footer-link" title="Centro de ayuda">
                <HelpCircle size={14} className="footer-link-icon lucide-icon" />
                Ayuda
              </a>
              <a href="#" className="footer-link" title="Soporte tecnico">
                <LifeBuoy size={14} className="footer-link-icon lucide-icon" />
                Soporte
              </a>
              <a href="#" className="footer-link" title="Politicas de privacidad">
                <Shield size={14} className="footer-link-icon lucide-icon" />
                Privacidad
              </a>
            </div>
            <span className="footer-version">v1.0.0</span>
          </div>
        </footer>
      </main>
    </div>
  )
}

function UserProfileIcon() {
  // Simple avatar component using Lucide User icon
  return (
    <div className="user-avatar-inner">
      <UserIcon size={20} className="lucide-icon" />
    </div>
  )
}

export default DashboardView
