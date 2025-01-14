import { Loader2 } from 'lucide-react';

interface FullPageLoaderProps {
    message?: string;
}

export function FullPageLoader({
    message = 'Loading...',
}: FullPageLoaderProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 z-50">
            <div className="text-center">
                <Loader2 className="w-16 h-16 mb-4 text-blue-600 animate-spin mx-auto" />
                <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {message}
                </p>
            </div>
        </div>
    );
}
