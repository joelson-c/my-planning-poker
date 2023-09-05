import { useEffect, useMemo, useState } from 'react';
import { Button, Divider } from '@nextui-org/react';
import useSocketClient from '../hooks/useSocketClient';
import UserList from '../components/UserList';
import useFibonacciSequence from '../hooks/useFibonacciSequence';
import PokerCardList, { PokerListItems } from '../components/PokerCardList';
import useRoomData from '../hooks/useRoomData';
import useUserData from '../hooks/useUserData';

export default function Vote() {
    const [vote, setVote] = useState<string>();
    const { isConnected, socket } = useSocketClient();
    const { roomMeta, users: roomUsers } = useRoomData();
    const { isObserver } = useUserData();
    const fibSeq = useFibonacciSequence(89);

    async function onCardRevealClick() {
        setVote('');
        await socket.emitWithAck('revealCards');
    }

    function onResetRequested() {
        socket.emit('resetRoom');
    }

    function onVoteChanged(value: string) {
        if (!roomMeta?.hasRevealedCards && !isObserver) {
            setVote(value);
        }
    }

    const cardList = useMemo(() => {
        if (roomMeta?.hasRevealedCards) {
            return (roomUsers || []).reduce((acc, roomUser) => {
                if (roomUser.isObserver) {
                    return acc;
                }

                acc.push({
                    key: roomUser.id,
                    description: roomUser.username,
                    value: roomUser.votingValue || 'N/A'
                });

                return acc;
            }, [] as PokerListItems[])
        }

        return [
            ...fibSeq,
            '?',
            '☕'
        ].reduce((acc, card) => {
            acc.push({
                key: card.toString(),
                description: card.toString(),
                value: card.toString()
            });
            return acc;
        }, [] as PokerListItems[]);
    }, [fibSeq, roomMeta, roomUsers]);

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
        <div className='container grid grid-cols-2 xl:grid-cols-3 mx-auto pt-10 xl:py-40 h-full'>
            <div className='flex flex-wrap gap-2 col-span-full xl:col-span-2'>
                <PokerCardList listItems={cardList} currentVote={vote} onVote={onVoteChanged} />
            </div>
            <div className='xl:justify-self-end'>
                <p>Conectado no servidor? {isConnected ? 'Sim' : 'Não'}</p>
                <Divider className='my-3' />
                <UserList />
            </div>
            <div className='justify-self-end xl:justify-self-center col-span-1 xl:col-span-3'>
                {roomMeta?.hasRevealedCards ?
                    <Button type='button' onClick={onResetRequested}>Resetar</Button> :
                    <Button type='button' onClick={onCardRevealClick}>Revelar votos</Button>}
            </div>
        </div>
    );
}
