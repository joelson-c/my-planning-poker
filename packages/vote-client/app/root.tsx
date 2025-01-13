import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import type { PropsWithChildren } from 'react';
import { Toaster } from './components/ui/toaster';
import styles from './tailwind.css?url';

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
                    <header className="p-4 bg-white dark:bg-gray-800 shadow">
                        <div className="container mx-auto flex justify-between items-center">
                            <h1 className="text-2xl font-bold">
                                Planning Poker
                            </h1>
                        </div>
                    </header>
                    <main className="container mx-auto p-4">{children}</main>
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
