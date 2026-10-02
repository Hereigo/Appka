import { useAuth } from 'react-oidc-context'
import { isAuthConfigured } from './oidcConfig'

function AuthControls() {
  const auth = useAuth()

  if (!isAuthConfigured) return null

  if (auth.isLoading) return <p className="muted auth-controls">Checking session…</p>

  if (!auth.isAuthenticated) {
    return (
      <div className="auth-controls">
        <button
          type="button"
          onClick={() => void auth.signinRedirect({ state: { returnTo: window.location.hash || '#/' } })}
        >
          Log in
        </button>
      </div>
    )
  }

  return (
    <div className="auth-controls">
      <span className="muted">{auth.user?.profile.email ?? auth.user?.profile.sub}</span>
      <button type="button" onClick={() => void auth.signoutRedirect()}>Log out</button>
    </div>
  )
}

export default AuthControls
