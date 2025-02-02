import type { ErrorResponse } from 'react-router';
import { GenericError } from './GenericError';

interface RouteErrorProps {
    error: ErrorResponse;
}

export function RouteError({ error }: RouteErrorProps) {
    // TODO: Proper handle route errors
    console.error(error);

    return <GenericError />;
}
