import { User, ShieldCheck, Clock, Lock } from 'lucide-react'
import { formatDate } from '../../../utils/formatters'

function OverviewSection({ profile, user, securityStatus, securityHint, protectedSummary }) {
  return (
    <div className="dashboard-stack">
      <section className="dashboard-metrics" aria-label="Resumen de la cuenta">
        <article className="metric-card warm">
          <div className="metric-header">
            <User size={22} className="metric-icon" />
            <span>Cuenta</span>
          </div>
          <strong>{profile?.email || user?.email || 'Sin correo'}</strong>
          <p>Sesion activa con acceso completo a tu espacio personal.</p>
        </article>
        <article className="metric-card cold">
          <div className="metric-header">
            <ShieldCheck size={22} className="metric-icon" />
            <span>Seguridad</span>
          </div>
          <strong>{securityStatus}</strong>
          <p>{securityHint}</p>
        </article>
        <article className="metric-card mint">
          <div className="metric-header">
            <Clock size={22} className="metric-icon" />
            <span>Ultimo acceso</span>
          </div>
          <strong>{formatDate(profile?.last_login_at) || 'Primera sesion'}</strong>
          <p>Fecha de tu ultima entrada al diario.</p>
        </article>
      </section>

      <article className="dashboard-panel route-panel">
        <div className="panel-header-with-icon">
          <Lock size={22} className="panel-icon" />
          <h3>Estado del sistema</h3>
        </div>
        <p>
          La conexion con el servidor esta activa. Tus datos se transmiten de forma segura.
        </p>
        <div className="route-badge">{protectedSummary?.message || 'Conectado'}</div>
      </article>
    </div>
  )
}

export default OverviewSection
