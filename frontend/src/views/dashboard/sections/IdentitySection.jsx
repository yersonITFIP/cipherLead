import { User } from 'lucide-react'
import { formatDate } from '../../../utils/formatters'

function IdentitySection({
  displayName,
  profile,
  user,
  displayNameDraft,
  onDisplayNameDraftChange,
  onSavePreferences,
  settingsFeedback
}) {
  return (
    <article className="dashboard-panel identity-panel">
      <div className="panel-header-with-icon">
        <User size={22} className="panel-icon" />
        <h3>Configuracion de cuenta</h3>
      </div>

      <p>Personaliza tu nombre mostrado y revisa el estado de tu cuenta.</p>

      <form className="identity-settings-form" onSubmit={onSavePreferences}>
        <div className="field-block">
          <label htmlFor="display-name-input">
            <span>Nombre mostrado</span>
          </label>
          <input
            id="display-name-input"
            className="auth-input"
            type="text"
            value={displayNameDraft}
            onChange={(event) => onDisplayNameDraftChange(event.target.value)}
            placeholder="Escribe tu nombre"
            autoComplete="name"
          />
        </div>

        <div className="identity-settings-actions">
          <button type="submit" className="action-button primary-button">Guardar configuracion</button>
          {settingsFeedback ? <p className="settings-feedback">{settingsFeedback}</p> : null}
        </div>
      </form>

      <p className="identity-section-caption">Resumen de cuenta y actividad reciente.</p>

      <dl className="detail-list">
        <div>
          <dt>Nombre mostrado</dt>
          <dd>{displayName || 'Sin nombre'}</dd>
        </div>
        <div>
          <dt>Correo electronico</dt>
          <dd>{profile?.email || user?.email || 'No disponible'}</dd>
        </div>
        <div>
          <dt>Estado de cuenta</dt>
          <dd>{profile?.is_active ? 'Activa' : 'Inactiva'}</dd>
        </div>
        <div>
          <dt>Ultima sesion</dt>
          <dd>{formatDate(profile?.last_login_at) || 'Primera vez'}</dd>
        </div>
      </dl>
    </article>
  )
}

export default IdentitySection
