interface ImportMetaEnv {
  // Environment variables are defined in another file
  // This declaration is merged with the existing one.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}