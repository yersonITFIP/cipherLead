import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      className={`theme-toggle-button ${theme === 'dark' ? 'dark' : 'light'}`}
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={theme === 'dark' ? 'Tema oscuro activo' : 'Tema claro activo'}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        <Sun size={14} />
      </span>
      <span className="theme-toggle-icon" aria-hidden="true">
        <Moon size={14} />
      </span>
      <span className="theme-toggle-thumb" aria-hidden="true" />
    </button>
  )
}

export default ThemeToggleButton
