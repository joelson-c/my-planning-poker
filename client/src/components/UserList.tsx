import { MdCheckCircle, MdQuestionMark, MdSecurity } from 'react-icons/md';
import { FaBinoculars } from 'react-icons/fa';
import { RoomUser } from 'my-planit-poker-shared/typings/VotingRoom';
import classNames from 'classnames';

import { Tooltip } from '@nextui-org/react';

import { useRootStore } from '../state/rootStore';

function getUserIcon(user: RoomUser) {
    switch (true) {
        case user.hasVoted:
            return <MdCheckCircle className="text-green-600 w-5 h-5" />;
        case user.isObserver:
            return <FaBinoculars className="text-gray-600 w-4 h-4" />;
        default:
            return <MdQuestionMark className="w-5 h-5" />;
    }
}

function getBorderStyle(user: RoomUser) {
    switch (true) {
        case user.hasVoted:
            return 'border-green-600';
        case user.isObserver:
            return 'border-gray-600';
        case user.isModerator:
            return 'border-yellow-600';
        default:
            return '';
    }
}

function getTooltip(user: RoomUser) {
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
    const roomUsers = useRootStore((state) => state.roomUsers);

    return (
        <>
            <h2 className="text-bold text-xl mb-3">Usuários</h2>
            <ul className="space-y-4 h-full max-h-[148px] md:max-h-[196px] overflow-y-auto overflow-x-hidden">
                {roomUsers?.map((user) => (
                    <li
                        className={classNames(
                            'relative flex items-center gap-1 p-2 border-2 rounded-lg',
                            getBorderStyle(user)
                        )}
                        key={user.userId}
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
                                <span className="absolute bg-black -right-1 -bottom-1 z-10 rounded">
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
