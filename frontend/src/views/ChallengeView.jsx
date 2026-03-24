import OtpCodeInput from '../components/OtpCodeInput'
import ThemeToggleButton from '../components/ThemeToggleButton'

function ChallengeView({ pendingChallenge, challengeCode, working, onCodeChange, onVerify, onCancel }) {
  return (
    <div className="challenge-layout">
      <div className="auth-theme-toggle">
        <ThemeToggleButton />
      </div>

      <section className="challenge-intro" aria-labelledby="challenge-title">
        <img
          className="challenge-illustration"
          src="/privacy-illustration.svg"
          alt="Ilustracion de diario protegido"
          width="320"
          height="210"
          loading="lazy"
        />
        <span className="panel-kicker">Verificacion segura</span>
        <h2 id="challenge-title">Desbloquea tu diario privado</h2>
        <p>
          La contrasena fue validada. Ingresa el codigo de 6 digitos para abrir la sesion privada
          de <strong>{pendingChallenge.user?.email || 'tu cuenta'}</strong>.
        </p>
      </section>

      <section className="session-box challenge-box challenge-box-strong" aria-label="Verificacion TOTP">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onVerify()
          }}
        >
          <OtpCodeInput
            label="Codigo TOTP"
            value={challengeCode}
            onChange={onCodeChange}
            disabled={working}
            idPrefix="challenge-code"
          />
          <div className="session-actions session-actions-centered">
            <button className="action-button primary-button" disabled={working} type="submit">
              {working ? 'Validando...' : 'Validar acceso'}
            </button>
            <button className="action-button ghost" disabled={working} type="button" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ChallengeView
