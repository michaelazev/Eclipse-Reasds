/// <reference types="vite/client" />

declare global {
  interface Window {
    import?: {
      meta?: {
        env?: Record<string, any>
      }
    }
  }
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_GOOGLE_BOOKS_API_KEY?: string
  readonly VITE_APP_URL?: string
  readonly VITE_APP_NAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {}