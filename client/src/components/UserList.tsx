import { FaVoteYea, FaBinoculars } from "react-icons/fa";
import { BiQuestionMark } from "react-icons/bi";
import { Tooltip } from "@nextui-org/react";
import useRoomData from "../hooks/useRoomData";
import { RoomStatusUsers } from "my-planit-poker-shared/typings/VotingRoom";

function getUserIcon(user: RoomStatusUsers) {
    switch (true) {
        case user.hasVoted:
            return <FaVoteYea className="text-green-600 w-5 h-5" />;
        case user.isObserver:
            return <FaBinoculars className="w-5 h-5" />;
        default:
            return <BiQuestionMark className="w-5 h-5" />;
    }
}

function getBorderStyle(user: RoomStatusUsers) {
    switch (true) {
        case user.hasVoted:
            return 'border-green-600';
        case user.isObserver:
            return 'border-gray-600';
    }
}

function getTooltip(user: RoomStatusUsers) {
    switch (true) {
        case user.hasVoted:
            return `${user.username} já votou`;
        case user.isObserver:
            return `${user.username} está observando`;
        default:
            return 'Aguardando voto';
    }
}

export default function UserList() {
    const { users: roomUsers } = useRoomData();
    return (
        <>
            <h2 className="text-bold text-xl mb-3">Usuários</h2>
            <ul className="space-y-4">
                {roomUsers?.map((user) => (
                    <Tooltip key={user.id} content={getTooltip(user)}>
                        <li
                            className={`relative p-2 border-2 rounded-lg ${getBorderStyle(user)}`}
                        >
                            <span className="text-bold">{user.username}</span>
                            <span className="absolute bg-black -right-2 -bottom-1 z-10">
                                {getUserIcon(user)}
                            </span>
                        </li>
                    </Tooltip>
                ))}
            </ul>
        </>
    )
}
