import { useCallback, useEffect, useState } from 'react'
import {
  clearPendingChallenge,
  clearSession,
  persistPendingChallenge,
  persistSession,
  readPendingChallenge,
  readSession
} from '../utils/sessionStorage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function defaultTwoFactorStatus() {
  return { enabled: false, hasPendingSetup: false }
}

function useAuthController() {
  const [mode, setMode] = useState('login')
  const [token, setToken] = useState('')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [protectedSummary, setProtectedSummary] = useState(null)
  const [twoFactorStatus, setTwoFactorStatus] = useState(defaultTwoFactorStatus())
  const [pendingChallenge, setPendingChallenge] = useState(null)
  const [setupData, setSetupData] = useState(null)
  const [setupCode, setSetupCode] = useState('')
  const [challengeCode, setChallengeCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const fetchJson = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, options)
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Error de solicitud')
    }

    return data
  }, [])

  const fetchAuthenticatedBundle = useCallback(async (authToken) => {
    const headers = { Authorization: `Bearer ${authToken}` }
    const [me, status, summary] = await Promise.all([
      fetchJson('/auth/me', { headers }),
      fetchJson('/auth/2fa/status', { headers }),
      fetchJson('/protected/summary', { headers })
    ])

    return { me, status, summary }
  }, [fetchJson])

  const hydrateSession = useCallback(async (authToken, sessionUser) => {
    const bundle = await fetchAuthenticatedBundle(authToken)
    setToken(authToken)
    setUser(sessionUser || bundle.me)
    setProfile(bundle.me)
    setTwoFactorStatus(bundle.status)
    setProtectedSummary(bundle.summary)
  }, [fetchAuthenticatedBundle])

  function resetAuthenticatedState() {
    clearSession()
    clearPendingChallenge()
    setToken('')
    setUser(null)
    setProfile(null)
    setProtectedSummary(null)
    setPendingChallenge(null)
    setTwoFactorStatus(defaultTwoFactorStatus())
    setSetupData(null)
    setSetupCode('')
    setChallengeCode('')
    setDisableCode('')
  }

  useEffect(() => {
    async function initialize() {
      setLoading(true)
      setError('')

      try {
        const session = readSession()
        if (session.token) {
          await hydrateSession(session.token, session.user)
          return
        }

        const pending = readPendingChallenge()
        if (pending?.challengeToken) {
          setPendingChallenge(pending)
        }
      } catch (initError) {
        resetAuthenticatedState()
        setError(initError.message || 'No se pudo restaurar la sesion')
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [hydrateSession])

  async function handleRegister() {
    setWorking(true)
    setError('')
    setMessage('')

    try {
      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error('Las contrasenas no coinciden')
      }

      await fetchJson('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: registerForm.displayName,
          email: registerForm.email,
          password: registerForm.password
        })
      })

      setMessage('Cuenta creada. Ahora puedes iniciar sesion.')
      setMode('login')
      setLoginForm({ email: registerForm.email, password: '' })
      setRegisterForm({ displayName: '', email: '', password: '', confirmPassword: '' })
    } catch (registerError) {
      setError(registerError.message || 'No se pudo registrar la cuenta')
    } finally {
      setWorking(false)
    }
  }

  async function handleLogin() {
    setWorking(true)
    setError('')
    setMessage('')

    try {
      const data = await fetchJson('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      })

      if (data.requiresTwoFactor) {
        const challenge = {
          challengeToken: data.challengeToken,
          user: data.user
        }

        persistPendingChallenge(challenge)
        setPendingChallenge(challenge)
        setChallengeCode('')
        return
      }

      persistSession(data.token, data.user)
      clearPendingChallenge()
      await hydrateSession(data.token, data.user)
    } catch (loginError) {
      setError(loginError.message || 'No se pudo iniciar sesion')
    } finally {
      setWorking(false)
    }
  }

  async function handleVerifyChallenge() {
    setWorking(true)
    setError('')
    setMessage('')

    try {
      const data = await fetchJson('/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeToken: pendingChallenge?.challengeToken,
          code: challengeCode
        })
      })

      persistSession(data.token, data.user)
      clearPendingChallenge()
      setPendingChallenge(null)
      setChallengeCode('')
      await hydrateSession(data.token, data.user)
    } catch (verifyError) {
      setError(verifyError.message || 'No se pudo verificar el segundo factor')
    } finally {
      setWorking(false)
    }
  }

  function cancelPendingTwoFactorChallenge() {
    clearPendingChallenge()
    setPendingChallenge(null)
    setChallengeCode('')
  }

  async function handleLogout() {
    setWorking(true)
    setError('')
    setMessage('')

    try {
      if (token) {
        await fetchJson('/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (logoutError) {
      setError(logoutError.message || 'No se pudo cerrar sesion limpiamente')
    } finally {
      resetAuthenticatedState()
      setWorking(false)
    }
  }

  async function handleRefreshProtectedState() {
    setWorking(true)
    setError('')

    try {
      const bundle = await fetchAuthenticatedBundle(token)
      setProfile(bundle.me)
      setTwoFactorStatus(bundle.status)
      setProtectedSummary(bundle.summary)
    } catch (refreshError) {
      setError(refreshError.message || 'No se pudo refrescar la sesion')
    } finally {
      setWorking(false)
    }
  }

  async function handleStartTwoFactorSetup() {
    setWorking(true)
    setError('')
    setMessage('')

    try {
      const data = await fetchJson('/auth/2fa/setup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      setSetupData(data)
      setSetupCode('')
      setTwoFactorStatus((current) => ({ ...current, hasPendingSetup: true }))
    } catch (setupError) {
      setError(setupError.message || 'No se pudo iniciar la configuracion del 2FA')
    } finally {
      setWorking(false)
    }
  }

  async function handleEnableTwoFactor() {
    setWorking(true)
    setError('')
    setMessage('')

    try {
      await fetchJson('/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code: setupCode })
      })

      setSetupData(null)
      setSetupCode('')
      setTwoFactorStatus({ enabled: true, hasPendingSetup: false })
      setMessage('2FA activado correctamente.')
      await handleRefreshProtectedState()
    } catch (enableError) {
      setError(enableError.message || 'No se pudo activar el 2FA')
    } finally {
      setWorking(false)
    }
  }

  async function handleDisableTwoFactor() {
    setWorking(true)
    setError('')
    setMessage('')

    try {
      await fetchJson('/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code: disableCode })
      })

      setDisableCode('')
      setSetupData(null)
      setTwoFactorStatus({ enabled: false, hasPendingSetup: false })
      setMessage('2FA desactivado correctamente.')
      await handleRefreshProtectedState()
    } catch (disableError) {
      setError(disableError.message || 'No se pudo desactivar el 2FA')
    } finally {
      setWorking(false)
    }
  }

  function updateLoginField(field, value) {
    setLoginForm((current) => ({ ...current, [field]: value }))
    if (error) setError('')
  }

  function updateRegisterField(field, value) {
    setRegisterForm((current) => ({ ...current, [field]: value }))
    if (error) setError('')
  }

  const displayName = profile?.display_name || user?.display_name || user?.email || 'Usuario'

  const handleSetMode = (newMode) => {
    setMode(newMode)
    if (error) setError('')
    if (message) setMessage('')
  }

  return {
    mode,
    loading,
    working,
    error,
    message,
    token,
    user,
    profile,
    pendingChallenge,
    twoFactorStatus,
    protectedSummary,
    setupData,
    setupCode,
    challengeCode,
    disableCode,
    loginForm,
    registerForm,
    displayName,
    setMode: handleSetMode,
    setSetupCode,
    setChallengeCode,
    setDisableCode,
    updateLoginField,
    updateRegisterField,
    cancelPendingTwoFactorChallenge,
    handleLogin,
    handleRegister,
    handleVerifyChallenge,
    handleLogout,
    handleRefreshProtectedState,
    handleStartTwoFactorSetup,
    handleEnableTwoFactor,
    handleDisableTwoFactor,
    setSetupData
  }
}

export default useAuthController
