import { FaBinoculars } from "react-icons/fa";
import { MdQuestionMark, MdCheckCircle, MdSecurity } from "react-icons/md";
import { Tooltip } from "@nextui-org/react";
import useRoomData from "../hooks/useRoomData";
import { RoomStatusUsers } from "my-planit-poker-shared/typings/VotingRoom";

function getUserIcon(user: RoomStatusUsers) {
    switch (true) {
        case user.hasVoted:
            return <MdCheckCircle className="text-green-600 w-5 h-5" />;
        case user.isObserver:
            return <FaBinoculars className="text-gray-600 w-4 h-4" />;
        default:
            return <MdQuestionMark className="w-5 h-5" />;
    }
}

function getBorderStyle(user: RoomStatusUsers) {
    switch (true) {
        case user.hasVoted:
            return 'border-green-600';
        case user.isObserver:
            return 'border-gray-600';
        default:
            return '';
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
                    <li
                        className={`relative flex items-center gap-1 p-2 border-2 rounded-lg ${getBorderStyle(user)}`}
                        key={user.id}
                    >
                        {user.isModerator && (
                            <Tooltip content="Moderador" placement="left" color="warning" showArrow={true}>
                                <span>
                                    <MdSecurity className="text-yellow-600 w-5 h-5" />
                                </span>
                            </Tooltip>
                        )}
                        <Tooltip content={getTooltip(user)} showArrow={true}>
                            <div className="truncate flex-[0_1_calc(100%-25px)]">
                                <span className="text-bold">{user.username}</span>
                                <span className="absolute bg-black -right-2 -bottom-1 z-10 rounded">
                                    {getUserIcon(user)}
                                </span>
                            </div>
                        </Tooltip>
                    </li>
                ))}
            </ul >
        </>
    )
}
