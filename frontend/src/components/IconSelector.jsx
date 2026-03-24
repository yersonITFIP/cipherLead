import { 
  Book, BookOpen, Briefcase, Code, Coffee, Cpu, FileText, 
  Palette, Music, Camera, Heart, Star, Zap, Target, 
  Lightbulb, Globe, Rocket, Trophy, GraduationCap, Beaker,
  Dumbbell, Plane, Home, ShoppingBag
} from 'lucide-react'
import { useState } from 'react'

const AVAILABLE_ICONS = [
  { name: 'Book', component: Book, label: 'Libro' },
  { name: 'BookOpen', component: BookOpen, label: 'Libro abierto' },
  { name: 'GraduationCap', component: GraduationCap, label: 'Educación' },
  { name: 'Briefcase', component: Briefcase, label: 'Trabajo' },
  { name: 'Code', component: Code, label: 'Programación' },
  { name: 'Cpu', component: Cpu, label: 'Tecnología' },
  { name: 'Beaker', component: Beaker, label: 'Ciencia' },
  { name: 'Palette', component: Palette, label: 'Arte' },
  { name: 'Music', component: Music, label: 'Música' },
  { name: 'Camera', component: Camera, label: 'Fotografía' },
  { name: 'Coffee', component: Coffee, label: 'Café' },
  { name: 'Heart', component: Heart, label: 'Salud' },
  { name: 'Dumbbell', component: Dumbbell, label: 'Ejercicio' },
  { name: 'Star', component: Star, label: 'Favorito' },
  { name: 'Target', component: Target, label: 'Objetivo' },
  { name: 'Trophy', component: Trophy, label: 'Logro' },
  { name: 'Lightbulb', component: Lightbulb, label: 'Idea' },
  { name: 'Zap', component: Zap, label: 'Energía' },
  { name: 'Rocket', component: Rocket, label: 'Proyecto' },
  { name: 'Globe', component: Globe, label: 'Viajes' },
  { name: 'Plane', component: Plane, label: 'Aventura' },
  { name: 'Home', component: Home, label: 'Hogar' },
  { name: 'ShoppingBag', component: ShoppingBag, label: 'Compras' },
  { name: 'FileText', component: FileText, label: 'Documentos' }
]

export function getIconComponent(iconName) {
  const icon = AVAILABLE_ICONS.find(i => i.name === iconName)
  return icon ? icon.component : Book
}

function IconSelector({ selectedIcon, onIconSelect, disabled }) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedIconData = AVAILABLE_ICONS.find(i => i.name === selectedIcon) || AVAILABLE_ICONS[0]
  const SelectedIconComponent = selectedIconData.component

  return (
    <div className="icon-selector-wrapper">
      <label className="field-block">
        <span>Icono</span>
        <button
          type="button"
          className="icon-selector-trigger"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          aria-label="Seleccionar icono"
          aria-expanded={isOpen}
        >
          <SelectedIconComponent size={20} />
          <span>{selectedIconData.label}</span>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{ marginLeft: 'auto', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </label>

      {isOpen && (
        <>
          <div 
            className="icon-selector-backdrop" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="icon-selector-dropdown" role="listbox" aria-label="Seleccionar icono">
            {AVAILABLE_ICONS.map((icon) => {
              const IconComponent = icon.component
              const isSelected = icon.name === selectedIcon

              return (
                <button
                  key={icon.name}
                  type="button"
                  className={`icon-selector-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onIconSelect(icon.name)
                    setIsOpen(false)
                  }}
                  role="option"
                  aria-selected={isSelected}
                  title={icon.label}
                >
                  <IconComponent size={20} />
                  <span>{icon.label}</span>
                  {isSelected && (
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3"
                      style={{ marginLeft: 'auto' }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default IconSelector
