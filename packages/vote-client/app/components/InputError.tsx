import type { FieldError } from 'react-hook-form';

interface InputErrorProps {
    id: string;
    error?: FieldError;
}

export function InputError({ error, ...props }: InputErrorProps) {
    if (!error) {
        return null;
    }

    return (
        <p {...props} className="text-sm text-red-500" role="alert">
            {error.message}
        </p>
    );
}
