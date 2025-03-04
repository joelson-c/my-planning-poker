import { clsx, type ClassValue } from 'clsx';
import { ClientResponseError } from 'pocketbase';
import { twMerge } from 'tailwind-merge';
import { UnauthorizedError } from './errors/UnauthorizedError';
import { NotFoundError } from './errors/NotFoundError';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formDataToObject(formData: FormData) {
    return Object.fromEntries(formData);
}

export function isClientResponseError(
    error: unknown,
): error is ClientResponseError {
    return error instanceof ClientResponseError;
}

export function normalizeBackendError(error: unknown): never {
    if (!(error instanceof ClientResponseError)) {
        throw error;
    }

    if (error.status === 401) {
        throw new UnauthorizedError();
    }

    if (error.status === 404) {
        throw new NotFoundError();
    }

    throw error;
}
