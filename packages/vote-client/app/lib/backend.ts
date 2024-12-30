import PocketBase from 'pocketbase';

export const backend = new PocketBase(import.meta.env.VITE_BACKEND_ENDPOINT);
