import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router';

export function GenericError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
            <AlertTriangle className="w-24 h-24 text-red-500 mb-8" />
            <h1 className="text-4xl font-bold mb-4">
                500 - Internal Server Error
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Sorry, something went wrong on our end.
            </p>
            <div className="flex space-x-4">
                <Button variant="outline" asChild>
                    <Link to="/">Go back to Home</Link>
                </Button>
            </div>
        </div>
    );
}
