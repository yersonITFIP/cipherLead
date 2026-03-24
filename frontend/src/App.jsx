import './App.css'
import StatusBanner from './components/StatusBanner'
import useAuthController from './hooks/useAuthController'
import AuthView from './views/AuthView'
import ChallengeView from './views/ChallengeView'
import DashboardView from './views/DashboardView'

function App() {
  const {
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
    setMode,
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
  } = useAuthController()

  const showAuthView = !loading && !token && !pendingChallenge
  const showChallengeView = !loading && Boolean(pendingChallenge)
  const showDashboardView = !loading && Boolean(token)

  return (
    <main className={`app-shell ${showDashboardView ? 'shell-dashboard' : 'shell-auth'}`}>
      <section className={`surface-card ${showDashboardView ? 'dashboard-full' : 'auth-card'}`}>
        <StatusBanner loading={loading} error={error} message={message} />

        {showAuthView ? (
          <AuthView
            mode={mode}
            onModeChange={setMode}
            working={working}
            loginForm={loginForm}
            registerForm={registerForm}
            onLoginChange={updateLoginField}
            onRegisterChange={updateRegisterField}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        ) : null}

        {showChallengeView ? (
          <ChallengeView
            pendingChallenge={pendingChallenge}
            challengeCode={challengeCode}
            working={working}
            onCodeChange={setChallengeCode}
            onVerify={handleVerifyChallenge}
            onCancel={cancelPendingTwoFactorChallenge}
          />
        ) : null}

        {showDashboardView ? (
          <DashboardView
            working={working}
            displayName={displayName}
            profile={profile}
            user={user}
            protectedSummary={protectedSummary}
            twoFactorStatus={twoFactorStatus}
            setupData={setupData}
            setupCode={setupCode}
            disableCode={disableCode}
            onRefresh={handleRefreshProtectedState}
            onLogout={handleLogout}
            onStartTwoFactorSetup={handleStartTwoFactorSetup}
            onEnableTwoFactor={handleEnableTwoFactor}
            onDisableTwoFactor={handleDisableTwoFactor}
            onSetupCodeChange={setSetupCode}
            onDisableCodeChange={setDisableCode}
            onCancelSetup={() => {
              setSetupData(null)
              setSetupCode('')
            }}
          />
        ) : null}
      </section>
    </main>
  )
}

export default App
