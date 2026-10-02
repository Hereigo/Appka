import { WebStorageStateStore, type User, type UserManagerSettings } from 'oidc-client-ts'

const authority = import.meta.env.VITE_CIDAAS_AUTHORITY
const clientId = import.meta.env.VITE_CIDAAS_CLIENT_ID
const scope = import.meta.env.VITE_CIDAAS_SCOPE ?? 'openid profile email roles'

export const isAuthConfigured = Boolean(authority && clientId)

export type SigninState = { returnTo?: string }

export const oidcConfig: UserManagerSettings = {
  authority: authority ?? '',
  client_id: clientId ?? '',
  redirect_uri: `${window.location.origin}/callback`,
  post_logout_redirect_uri: `${window.location.origin}/`,
  response_type: 'code',
  scope,

  // PKCE is on by default for response_type=code; sessionStorage limits the XSS blast radius.
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),

  automaticSilentRenew: true,
  monitorSession: false,
}

// Leaves /callback and the ?code=&state= query behind, and restores the requested hash route.
export function onSigninCallback(user: User | void) {
  const returnTo = (user?.state as SigninState | undefined)?.returnTo
  window.location.replace(`${window.location.origin}/${returnTo ?? '#/'}`)
}
