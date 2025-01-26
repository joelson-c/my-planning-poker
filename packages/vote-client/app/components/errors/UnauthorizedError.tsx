import { Link } from 'react-router';
import { Lock } from 'lucide-react';
import { Button } from '../ui/button';

export function UnauthorizedError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
            <Lock className="w-24 h-24 text-yellow-500 mb-8" />
            <h1 className="text-4xl font-bold mb-4">401 - Unauthorized</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Sorry, you don't have permission to access this page.
            </p>
            <Button variant="outline" asChild>
                <Link to="/">Go back to Home</Link>
            </Button>
        </div>
    );
}
