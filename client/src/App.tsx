import { Outlet } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Footer from "./components/Footer";

export default function App() {
    return (
        <div className="flex flex-col dark:bg-black md:h-screen">
            <main className="container md:h-full">
                <Outlet />
            </main>
            <div className="mt-5 sm:mt-auto">
                <Footer />
            </div>
            <Toaster />
        </div>
    );
}
