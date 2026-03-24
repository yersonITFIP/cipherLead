import { 
  LayoutDashboard, 
  Book, 
  Activity,
  KeyRound,
  User,
  ShieldCheck
} from 'lucide-react'

export const DASHBOARD_SECTIONS = [
  { id: 'overview', label: 'Bitacora', icon: LayoutDashboard },
  { id: 'subjects', label: 'Materias', icon: Book },
  { id: 'passwords', label: 'Passwords', icon: KeyRound },
  { id: 'activity', label: 'Actividad', icon: Activity }
]

export const PROFILE_SECTIONS = [
  { id: 'identity', label: 'Configuracion', icon: User },
  { id: 'security', label: 'Seguridad', icon: ShieldCheck }
]
