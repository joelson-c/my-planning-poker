import { FiCheckCircle } from "react-icons/fi";
import { BiQuestionMark } from "react-icons/bi";
import { Tooltip } from "@nextui-org/react";
import useRoomData from "../hooks/useRoomData";

export default function UserList() {
    const { users: roomUsers } = useRoomData();
    return (
        <>
            <h2 className="text-bold text-xl mb-3">Usuários</h2>
            <ul className="space-y-4">
                {roomUsers?.map((user) => (
                    <Tooltip key={user.id} content={user.hasVoted ? `${user.username} já votou` : 'Aguardando voto'}>
                        <li
                            className={`relative p-2 border-2 rounded-lg ` +
                                `${user.hasVoted ? 'border-2 border-green-600' : ''}`}
                        >
                            <span className="text-bold">{user.username}</span>
                            <span className="absolute bg-black -right-2 -bottom-1 z-10">
                                {user.hasVoted
                                    ? <FiCheckCircle className="text-green-600 w-5 h-5" />
                                    : <BiQuestionMark className="w-5 h-5" />}
                            </span>
                        </li>
                    </Tooltip>
                ))}
            </ul>
        </>
    )
}
