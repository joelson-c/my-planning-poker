import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import RoomJoin from "./pages/RoomJoin";
import Vote from "./pages/Vote";
import VerifyUserJoinedInRoom from "./components/VerifyUserJoinedInRoom";

const BrowserRouter = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <RoomJoin />
            },
            {
                path: "/join/:roomId?",
                element: <RoomJoin />
            },
            {
                path: "/room/:roomId",
                element: (
                    <VerifyUserJoinedInRoom>
                        <Vote />
                    </VerifyUserJoinedInRoom>
                )
            }
        ]
    },
]);

export default BrowserRouter;
