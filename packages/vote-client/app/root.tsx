import type { PropsWithChildren } from 'react';
import type { Route } from './+types/root';
import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from 'react-router';
import { Toaster } from './components/ui/toaster';
import styles from './tailwind.css?url';
import { UnauthorizedError as UnauthorizedErrorComponent } from './components/errors/UnauthorizedError';
import { GenericError } from './components/errors/GenericError';
import { Header } from './components/Header';

export function links() {
    return [
        { rel: 'stylesheet', href: styles },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossOrigin: 'anonymous',
        },
        {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
        },
    ];
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    const isAuthError = isRouteErrorResponse(error) && error.status === 401;
    if (isAuthError) {
        return <UnauthorizedErrorComponent />;
    }

    return <GenericError />;
}

export function Layout({ children }: PropsWithChildren) {
    return (
        <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body>
                <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    <Header />
                    <main className="container mx-auto pb-4 sm:pb-0">
                        {children}
                    </main>
                </div>
                <ScrollRestoration />
                <Scripts />
                <Toaster />
            </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}
