interface ImportMetaEnv {
    readonly VITE_BACKEND_ENDPOINT: string;
    readonly VITE_GTM_ID: string;
}

interface Window {
    dataLayer: Record<string, unknown>[];
}
