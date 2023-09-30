import { useCallback, useEffect, useState } from 'react';
import { Divider } from '@nextui-org/react';
import useSocketClient from '../hooks/useSocketClient';
import UserList from '../components/UserList';
import PokerCardList from '../components/PokerCardList';
import useRoomData from '../hooks/useRoomData';
import useUserData from '../hooks/useUserData';
import ServerInfo from '../components/ServerInfo';
import RoomActions from '../components/pageActions/RoomActions';
import useRoomCards from '../hooks/useRoomCards';

export default function Vote() {
    const [vote, setVote] = useState<string>();
    const { socket } = useSocketClient();
    const { meta: roomMeta, currentUserData: currentRoomUser } = useRoomData();
    const { isObserver } = useUserData();

    async function onCardReveal() {
        setVote('');
        await socket.emitWithAck('revealCards');
    }

    function onResetRequested() {
        socket.emit('resetRoom');
    }

    const onVoteChanged = useCallback(function onVoteChanged(value: string) {
        if (!roomMeta?.hasRevealedCards && !isObserver) {
            setVote(value);
        }
    }, [isObserver, roomMeta]);

    const cardList = useRoomCards(onVoteChanged, vote);

    useEffect(() => {
        function onRoomReseted() {
            setVote(undefined);
        }

        socket.on('roomReset', onRoomReseted);

        return () => {
            socket.off('roomReset', onRoomReseted);
        };
    }, [socket]);

    useEffect(() => {
        async function sendVote() {
            if (!vote) {
                return;
            }

            const errorMsg = await socket.emitWithAck('voted', vote);
            if (errorMsg) {
                throw new Error('Error while voting: ' + errorMsg);
            }
        }

        sendVote();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vote]);

    return (
        <div className='container grid grid-cols-1 lg:grid-cols-3 justify-items-center gap-5 pt-10 xl:py-24 xl:h-full'>
            <div className='w-full lg:col-span-2'>
                <PokerCardList listItems={cardList} />
            </div>
            <div className='lg:justify-self-end'>
                <UserList />
                <Divider className='my-3' />
                <ServerInfo />
            </div>
            {currentRoomUser?.isModerator && (
                <div className='justify-self-end lg:justify-self-center col-span-1 lg:col-span-3'>
                    <RoomActions onResetRequested={onResetRequested} onCardReveal={onCardReveal} />
                </div>
            )}
        </div>
    );
}
