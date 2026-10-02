/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CIDAAS_AUTHORITY?: string
  readonly VITE_CIDAAS_CLIENT_ID?: string
  readonly VITE_CIDAAS_SCOPE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
