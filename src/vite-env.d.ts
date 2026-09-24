/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ADMIN_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** App version injected from package.json by vite.config.ts */
declare const __APP_VERSION__: string;

/** Unique per build (version + timestamp), used to version the service worker cache */
declare const __BUILD_ID__: string;
