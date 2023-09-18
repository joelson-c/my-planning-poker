import { Outlet } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

export default function App() {
    return (
        <>
            <main className="h-screen dark:bg-black">
                <Outlet />
            </main>
            <Toaster />
        </>
    );
}
