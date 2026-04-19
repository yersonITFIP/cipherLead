import Swal from 'sweetalert2'

// Configuración global para dark mode
const darkModeConfig = {
  background: '#0f172a',
  color: '#e2e8f0',
  confirmButtonColor: '#22c55e',
  cancelButtonColor: '#64748b'
}

const darkModeDangerConfig = {
  background: '#0f172a',
  color: '#e2e8f0',
  confirmButtonColor: '#ef4444',
  cancelButtonColor: '#64748b'
}

// Alerta de confirmación genérica
export function confirmAlert(title, text, confirmText = 'Sí, continuar') {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    ...darkModeConfig
  })
}

// Confirmación para eliminar
export function deleteAlert(itemName = 'este elemento') {
  return Swal.fire({
    title: '¿Estás seguro?',
    text: `¿Quieres eliminar ${itemName}? Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    ...darkModeDangerConfig
  })
}

// Alerta de éxito
export function successAlert(title = '¡Listo!', text = '') {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
    ...darkModeConfig
  })
}

// Alerta de error
export function errorAlert(title = 'Error', text = 'Algo salió mal') {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'Entendido',
    ...darkModeDangerConfig
  })
}

// Confirmación para cerrar sesión
export function logoutAlert() {
  return Swal.fire({
    title: '¿Cerrar sesión?',
    text: 'Tu sesión se cerrará y tendrás que volver a iniciar sesión.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    ...darkModeConfig
  })
}

// Confirmación para desactivar 2FA
export function disable2FAAlert() {
  return Swal.fire({
    title: '¿Desactivar 2FA?',
    text: 'Tu cuenta será menos segura. ¿Estás seguro de que quieres desactivar la autenticación de dos factores?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, desactivar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    ...darkModeDangerConfig
  })
}

// Toast de información breve
export function toast(message, icon = 'info') {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    background: '#0f172a',
    color: '#e2e8f0',
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })
  return Toast.fire({ icon, message })
}
