import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formDataToObject(formData: FormData) {
    return Object.fromEntries(formData);
}

export function roundNumber(x: number, precision = 1): number {
    if (precision < 0) {
        throw new Error('Precision must be greater than 0');
    }

    const factor = Math.pow(10, precision);
    return Math.round(x * factor) / factor;
}
