import { Activity, RefreshCw } from 'lucide-react'

function ActivitySection({ protectedSummary, twoFactorStatus, profile, user, working, onRefresh }) {
  return (
    <div className="dashboard-stack">
      <article className="dashboard-panel">
        <div className="panel-header-with-icon">
          <Activity size={22} className="panel-icon" />
          <h3>Actividad de la cuenta</h3>
        </div>
        <p>Estado actual de tu sesion y seguridad.</p>
        <dl className="detail-list">
          <div>
            <dt>Estado de la API</dt>
            <dd>{protectedSummary?.message || 'Sin conexion'}</dd>
          </div>
          <div>
            <dt>Autenticacion 2FA</dt>
            <dd>{twoFactorStatus.enabled ? 'Activado' : 'Desactivado'}</dd>
          </div>
          <div>
            <dt>Correo de sesion</dt>
            <dd>{profile?.email || user?.email || 'No disponible'}</dd>
          </div>
        </dl>
      </article>

      <article className="dashboard-panel">
        <div className="panel-header-with-icon">
          <RefreshCw size={22} className="panel-icon" />
          <h3>Sincronizar datos</h3>
        </div>
        <p>Actualiza la informacion de seguridad y renueva el estado del panel.</p>
        <div className="session-actions">
          <button className="action-button primary-button" disabled={working} onClick={onRefresh}>
            <RefreshCw size={18} className={working ? 'spinning' : ''} />
            <span>Actualizar estado</span>
          </button>
        </div>
      </article>
    </div>
  )
}

export default ActivitySection
