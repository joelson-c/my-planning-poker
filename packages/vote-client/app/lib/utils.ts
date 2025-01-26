import { clsx, type ClassValue } from 'clsx';
import { ClientResponseError } from 'pocketbase';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formDataToObject(formData: FormData) {
    return Object.fromEntries(formData);
}

export function isAbortError(error: unknown): error is ClientResponseError {
    return error instanceof ClientResponseError && error.isAbort;
}
