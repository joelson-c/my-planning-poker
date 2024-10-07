interface ImportMetaEnv {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  INLINE_API_GATEWAY_ENDPOINT: string;
  INLINE_DYNAMODB_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
