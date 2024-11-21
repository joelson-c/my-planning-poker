import axios from 'axios';
import { env } from './environment.server';

export const httpClient = axios.create({
    baseURL: env.BACKEND_ENDPOINT,
});

export const getAuthenticatedHttpClient = (token: string) => {
    httpClient.defaults.headers.Authorization = `Bearer ${token}`;
    return httpClient;
};
