import { ShieldCheck, Lock, Unlock } from 'lucide-react'
import OtpCodeInput from '../../../components/OtpCodeInput'
import { disable2FAAlert } from '../../../utils/swal'

function SecuritySection({
  working,
  twoFactorStatus,
  setupData,
  setupCode,
  disableCode,
  onStartTwoFactorSetup,
  onEnableTwoFactor,
  onDisableTwoFactor,
  onSetupCodeChange,
  onDisableCodeChange,
  onCancelSetup
}) {
  return (
    <article className="dashboard-panel security-panel">
      <header className="security-header-block">
        <ShieldCheck size={24} className="panel-icon" />
        <div>
          <h3>Autenticacion de dos factores</h3>
          <p>
            Agrega una capa extra de seguridad. Necesitaras un codigo de tu app de autenticacion
            cada vez que inicies sesion.
          </p>
        </div>
      </header>

      {!twoFactorStatus.enabled && !setupData ? (
        <button
          className="action-button primary-button"
          disabled={working}
          onClick={onStartTwoFactorSetup}
        >
          <Lock size={18} />
          <span>Activar 2FA</span>
        </button>
      ) : null}

      {setupData ? (
        <section className="totp-setup-box-strong" aria-label="Configurar autenticacion de dos factores">
          <img
            className="qr-image"
            src={setupData.qrCodeDataUrl}
            alt="Codigo QR para configurar autenticacion"
            width="200"
            height="200"
            loading="lazy"
          />
          <p>Escanea este codigo con tu app de autenticacion o ingresa la clave manualmente.</p>
          <code className="manual-key">{setupData.manualEntryKey}</code>
          <form
            className="totp-form"
            onSubmit={(event) => {
              event.preventDefault()
              onEnableTwoFactor()
            }}
          >
            <OtpCodeInput
              label="Codigo de verificacion"
              value={setupCode}
              onChange={onSetupCodeChange}
              disabled={working}
              idPrefix="setup-code"
            />
            <div className="session-actions">
              <button className="action-button primary-button" disabled={working} type="submit">
                Confirmar y activar
              </button>
              <button
                className="action-button ghost"
                disabled={working}
                type="button"
                onClick={onCancelSetup}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {twoFactorStatus.enabled ? (
        <form
          className="totp-disable-box totp-form"
          onSubmit={async (event) => {
            event.preventDefault()
            const result = await disable2FAAlert()
            if (result.isConfirmed) onDisableTwoFactor()
          }}
        >
          <div className="security-status-active">
            <Lock size={18} />
            <span>2FA activado</span>
          </div>
          <p className="totp-helper">
            Para desactivar la autenticacion de dos factores, ingresa un codigo valido de tu app.
          </p>
          <OtpCodeInput
            label="Codigo de verificacion"
            value={disableCode}
            onChange={onDisableCodeChange}
            disabled={working}
            idPrefix="disable-code"
          />
          <div className="session-actions">
            <button className="action-button ghost danger" disabled={working} type="submit">
              <Unlock size={18} />
              <span>Desactivar 2FA</span>
            </button>
          </div>
        </form>
      ) : null}
    </article>
  )
}

export default SecuritySection
