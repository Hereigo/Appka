import { useEffect, type PropsWithChildren } from 'react'
import { useAuth } from 'react-oidc-context'
import { isAuthConfigured } from './oidcConfig'

function RequireAuth({ children }: PropsWithChildren) {
  const auth = useAuth()

  useEffect(() => {
    if (!isAuthConfigured) return
    if (!auth.isLoading && !auth.isAuthenticated && !auth.activeNavigator && !auth.error) {
      void auth.signinRedirect({ state: { returnTo: window.location.hash || '#/' } })
    }
  }, [auth])

  if (!isAuthConfigured) {
    return (
      <section className="card">
        <h2>Sign-in unavailable</h2>
        <p className="error" role="alert">
          cidaas is not configured. Set <code>VITE_CIDAAS_AUTHORITY</code> and{' '}
          <code>VITE_CIDAAS_CLIENT_ID</code> in <code>Appka.Client/.env.local</code>, then restart
          the dev server.
        </p>
      </section>
    )
  }

  if (auth.error) {
    return (
      <section className="card">
        <h2>Sign-in failed</h2>
        <p className="error" role="alert">{auth.error.message}</p>
        <button type="button" onClick={() => void auth.signinRedirect()}>Try again</button>
      </section>
    )
  }

  if (!auth.isAuthenticated) {
    return (
      <section className="card">
        <h2>Signing in</h2>
        <p className="muted">Redirecting to cidaas…</p>
      </section>
    )
  }

  return <>{children}</>
}

export default RequireAuth
