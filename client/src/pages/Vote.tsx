import { useCopyToClipboard } from 'usehooks-ts';
import { useHref } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCallback, useEffect, useState } from 'react';

import { Divider } from '@nextui-org/react';

import { useRootStore } from '../state/rootStore';
import useSocketClient from '../hooks/useSocketClient';
import useRoomCards from '../hooks/useRoomCards';
import UserList from '../components/UserList';
import ServerInfo from '../components/ServerInfo';
import PokerCardList from '../components/PokerCardList';
import RoomActions from '../components/pageActions/RoomActions';

export default function Vote() {
    const [vote, setVote] = useState<string>();
    const { socket } = useSocketClient();
    const [, copy] = useCopyToClipboard();
    const {
        meta: roomMeta, userData
    } = useRootStore((state) => ({
        meta: state.roomMeta,
        userData: state.remoteUserData
    }));
    const joinRoomHref = useHref(`/join/${roomMeta?.id}`);

    async function onCardReveal() {
        setVote('');
        await socket.emitWithAck('revealCards');
    }

    function onResetRequested() {
        socket.emit('resetRoom');
    }

    function onRoomShare() {
        copy(`${window.location.origin}${joinRoomHref}`);
        toast.success('Link da sala copiado para a área de transferência!');
    }

    const onVoteChanged = useCallback(function onVoteChanged(value: string) {
        if (!roomMeta?.hasRevealedCards && !userData?.isObserver) {
            setVote(value);
        }
    }, [userData, roomMeta]);

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
        <div className='flex flex-col h-full'>
            <div className='flex flex-col md:flex-row gap-10 h-full'>
                <div className='flex-[0_1_70%]'>
                    <PokerCardList listItems={cardList} />
                </div>
                <div className='flex-1'>
                    <UserList />
                    <Divider className='my-3' />
                    <ServerInfo />
                    <RoomActions
                        onResetRequested={onResetRequested}
                        onCardReveal={onCardReveal}
                        onRoomShare={onRoomShare}
                    />
                </div>
            </div>
        </div>
    );
}
