import { useState } from 'react'
import { Eye, EyeOff, User, Mail, Lock, BookOpen, Feather, ShieldCheck, Sparkles } from 'lucide-react'
import ThemeToggleButton from '../components/ThemeToggleButton'

function AuthView({
  mode,
  onModeChange,
  working,
  loginForm,
  registerForm,
  onLoginChange,
  onRegisterChange,
  onLogin,
  onRegister
}) {
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="auth-layout">
      {/* Panel de bienvenida - Lado izquierdo */}
      <section className="welcome-panel" aria-labelledby="auth-title">
        <div className="auth-brand">
          <img src="/logo.jpeg" alt="Logo de CipherLeaf" className="auth-logo logo-circle" />
          <div className="auth-brand-text">
            <h1 className="auth-brand-name">CipherLeaf</h1>
            <p className="auth-brand-tagline">Tu espacio personal resguardado</p>
          </div>
        </div>

        <div className="auth-hero-section">
          <div className="auth-hero-icon">
            <BookOpen size={64} strokeWidth={1.5} />
            <div className="auth-hero-glow"></div>
          </div>
          <h2 id="auth-title" className="auth-hero-title">
            Tu diario, tu esencia
          </h2>
          <p className="auth-hero-subtitle">
            Un espacio privado donde tus pensamientos cobran vida. Encriptado, seguro y solo para ti.
          </p>
        </div>

        <div className="auth-features">
          <div className="auth-feature-item">
            <ShieldCheck size={18} className="auth-feature-icon" />
            <span>Encriptacion de extremo a extremo</span>
          </div>
          <div className="auth-feature-item">
            <Feather size={18} className="auth-feature-icon" />
            <span>Escribe sin limites ni distracciones</span>
          </div>
          <div className="auth-feature-item">
            <Sparkles size={18} className="auth-feature-icon" />
            <span>Organiza con materias y etiquetas</span>
          </div>
        </div>

        <div className="auth-visual-decoration">
          <div className="auth-leaf-pattern">
            <svg viewBox="0 0 100 100" className="auth-leaf-svg">
              <path d="M50 10 C70 10 90 30 90 50 C90 70 70 90 50 90 C30 90 10 70 10 50 C10 30 30 10 50 10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              <path d="M50 20 C65 20 80 35 80 50 C80 65 65 80 50 80 C35 80 20 65 20 50 C20 35 35 20 50 20" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />
            </svg>
          </div>
        </div>
      </section>

      {/* Panel del formulario - Lado derecho */}
      <section className="form-shell form-shell-elevated" aria-label="Formulario de acceso">
        <div className="auth-form-header">
          <ThemeToggleButton />
          <div className="auth-form-title-area">
            <h3 className="auth-form-heading">
              {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
            </h3>
            <p className="auth-form-subheading">
              {mode === 'login'
                ? 'Ingresa tus credenciales para acceder a tu diario'
                : 'Completa los datos para comenzar a escribir'}
            </p>
          </div>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Cambiar vista de acceso">
          <button
            className={`tab-button ${mode === 'login' ? 'active' : ''}`}
            onClick={() => onModeChange('login')}
            role="tab"
            aria-selected={mode === 'login'}
            aria-controls="login-panel"
            id="login-tab"
          >
            Iniciar sesion
          </button>
          <button
            className={`tab-button ${mode === 'register' ? 'active' : ''}`}
            onClick={() => onModeChange('register')}
            role="tab"
            aria-selected={mode === 'register'}
            aria-controls="register-panel"
            id="register-tab"
          >
            Registrarse
          </button>
        </div>

        <div
          key={mode}
          className={`auth-switch-panel ${mode === 'login' ? 'to-login' : 'to-register'}`}
        >
          {mode === 'login' ? (
            <form
              id="login-panel"
              role="tabpanel"
              aria-labelledby="login-tab"
              className="auth-form-grid"
              onSubmit={(event) => {
                event.preventDefault()
                onLogin()
              }}
            >
              <div className="auth-input-group">
                <label className="auth-label" htmlFor="login-email">
                  Correo electronico
                </label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    id="login-email"
                    className="auth-input auth-input-with-icon"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={loginForm.email}
                    onChange={(event) => onLoginChange('email', event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label" htmlFor="login-password">
                  Contrasena
                </label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="login-password"
                    className="auth-input auth-input-with-icon auth-input-with-right-icon"
                    type={showLoginPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Tu contrasena"
                    value={loginForm.password}
                    onChange={(event) => onLoginChange('password', event.target.value)}
                    required
                  />
                  <button
                    className="auth-password-toggle"
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    title={showLoginPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button className="action-button primary-button auth-submit-btn" disabled={working} type="submit">
                {working ? (
                  <>
                    <span className="auth-spinner"></span>
                    Accediendo...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Acceder al dashboard
                  </>
                )}
              </button>
            </form>
          ) : (
            <form
              id="register-panel"
              role="tabpanel"
              aria-labelledby="register-tab"
              className="auth-form-grid"
              onSubmit={(event) => {
                event.preventDefault()
                onRegister()
              }}
            >
              <div className="auth-input-group">
                <label className="auth-label" htmlFor="register-name">
                  Nombre visible
                </label>
                <div className="auth-input-wrapper">
                  <User size={18} className="auth-input-icon" />
                  <input
                    id="register-name"
                    className="auth-input auth-input-with-icon"
                    type="text"
                    autoComplete="name"
                    placeholder="Como quieres que se vea tu nombre"
                    value={registerForm.displayName}
                    onChange={(event) => onRegisterChange('displayName', event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label" htmlFor="register-email">
                  Correo electronico
                </label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    id="register-email"
                    className="auth-input auth-input-with-icon"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={registerForm.email}
                    onChange={(event) => onRegisterChange('email', event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label" htmlFor="register-password">
                  Contrasena
                </label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="register-password"
                    className="auth-input auth-input-with-icon auth-input-with-right-icon"
                    type={showRegisterPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Minimo 8 caracteres"
                    value={registerForm.password}
                    onChange={(event) => onRegisterChange('password', event.target.value)}
                    required
                  />
                  <button
                    className="auth-password-toggle"
                    type="button"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    title={showRegisterPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                  >
                    {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label" htmlFor="register-password-confirm">
                  Confirmar contrasena
                </label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="register-password-confirm"
                    className="auth-input auth-input-with-icon auth-input-with-right-icon"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repite tu contrasena"
                    value={registerForm.confirmPassword}
                    onChange={(event) => onRegisterChange('confirmPassword', event.target.value)}
                    required
                  />
                  <button
                    className="auth-password-toggle"
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    title={showConfirmPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button className="action-button primary-button auth-submit-btn" disabled={working} type="submit">
                {working ? (
                  <>
                    <span className="auth-spinner"></span>
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <Feather size={18} />
                    Crear cuenta local
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

export default AuthView
