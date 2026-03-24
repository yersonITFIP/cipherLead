import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'

function StatusBanner({ loading, error, message }) {
  if (!loading && !error && !message) return null

  return (
    <div className="status-container">
      {loading && (
        <div className="status status-loading" role="status" aria-live="polite">
          <Loader2 size={20} className="status-icon" />
          <span>Validando acceso a tu boveda privada...</span>
        </div>
      )}
      {!loading && error && (
        <div className="status status-error" role="alert" aria-live="assertive">
          <AlertCircle size={20} className="status-icon" />
          <span style={{ flex: 1 }}>{error}</span>
        </div>
      )}
      {!loading && message && (
        <div className="status status-success" role="status" aria-live="polite">
          <CheckCircle2 size={20} className="status-icon" />
          <span style={{ flex: 1 }}>{message}</span>
        </div>
      )}
    </div>
  )
}

export default StatusBanner
