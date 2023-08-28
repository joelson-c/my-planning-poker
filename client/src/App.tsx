import UsernameEntry from "./pages/UsernameEntry";
import Vote from "./pages/Vote";
import useUserData from "./hooks/useUserData";

export default function App() {
    const { username } = useUserData();

    return (
        <main className="h-screen dark:bg-black">
            {username ? <Vote /> : <UsernameEntry />}
        </main>
    );
}
