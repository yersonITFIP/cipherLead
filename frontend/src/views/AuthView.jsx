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
  return (
    <div className="auth-layout">
      <section className="welcome-panel" aria-labelledby="auth-title">
        <div className="brand-strip" aria-label="Identidad de CipherLeaf">
          <img src="/logo.png" alt="Logo de CipherLeaf" width="44" height="44" />
          <div>
            <strong>CipherLeaf</strong>
            <p>Tu espacio personal resguardado</p>
          </div>
        </div>
        <h2 id="auth-title">Accede a tu diario en segundos</h2>
        <p className="auth-lead">
          Menos ruido, mas enfoque: entra y empieza a escribir.
        </p>

        <div className="auth-hero-media" aria-label="Resumen visual de acceso seguro">
          <img
            className="auth-hero-image"
            src="/privacy-illustration.svg"
            alt="Interfaz de diario privado protegido"
            width="320"
            height="210"
            loading="lazy"
          />
          <div className="auth-icon-row" aria-label="Indicadores de seguridad">
            <span className="auth-icon-pill">
              <img src="/nav-security.svg" alt="" width="16" height="16" aria-hidden="true" />
              2FA
            </span>
            <span className="auth-icon-pill">
              <img src="/nav-identity.svg" alt="" width="16" height="16" aria-hidden="true" />
              Sesion segura
            </span>
            <span className="auth-icon-pill">
              <img src="/nav-overview.svg" alt="" width="16" height="16" aria-hidden="true" />
              Notas privadas
            </span>
          </div>
        </div>
      </section>

      <section className="form-shell form-shell-elevated" aria-label="Formulario de acceso">
        <div className="auth-form-topbar">
          <ThemeToggleButton />
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
              className="form-grid"
              onSubmit={(event) => {
                event.preventDefault()
                onLogin()
              }}
            >
              <label className="field-block" htmlFor="login-email">
                <span>Correo electronico</span>
                <input
                  id="login-email"
                  className="auth-input"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  value={loginForm.email}
                  onChange={(event) => onLoginChange('email', event.target.value)}
                  required
                />
              </label>
              <label className="field-block" htmlFor="login-password">
                <span>Contrasena</span>
                <input
                  id="login-password"
                  className="auth-input"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Tu contrasena"
                  value={loginForm.password}
                  onChange={(event) => onLoginChange('password', event.target.value)}
                  required
                />
              </label>
              <button className="action-button primary-button" disabled={working} type="submit">
                {working ? 'Accediendo...' : 'Acceder al dashboard'}
              </button>
            </form>
          ) : (
            <form
              id="register-panel"
              role="tabpanel"
              aria-labelledby="register-tab"
              className="form-grid"
              onSubmit={(event) => {
                event.preventDefault()
                onRegister()
              }}
            >
              <label className="field-block" htmlFor="register-name">
                <span>Nombre visible</span>
                <input
                  id="register-name"
                  className="auth-input"
                  type="text"
                  autoComplete="name"
                  placeholder="Como quieres que se vea tu nombre"
                  value={registerForm.displayName}
                  onChange={(event) => onRegisterChange('displayName', event.target.value)}
                  required
                />
              </label>
              <label className="field-block" htmlFor="register-email">
                <span>Correo electronico</span>
                <input
                  id="register-email"
                  className="auth-input"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  value={registerForm.email}
                  onChange={(event) => onRegisterChange('email', event.target.value)}
                  required
                />
              </label>
              <label className="field-block" htmlFor="register-password">
                <span>Contrasena</span>
                <input
                  id="register-password"
                  className="auth-input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Minimo 8 caracteres"
                  value={registerForm.password}
                  onChange={(event) => onRegisterChange('password', event.target.value)}
                  required
                />
              </label>
              <label className="field-block" htmlFor="register-password-confirm">
                <span>Confirmar contrasena</span>
                <input
                  id="register-password-confirm"
                  className="auth-input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repite tu contrasena"
                  value={registerForm.confirmPassword}
                  onChange={(event) => onRegisterChange('confirmPassword', event.target.value)}
                  required
                />
              </label>
              <button className="action-button primary-button" disabled={working} type="submit">
                {working ? 'Creando...' : 'Crear cuenta local'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

export default AuthView
