import { useEffect, useOptimistic, useReducer, useTransition } from 'react';
import type {
    InboundMessage,
    OutboundMessage,
} from '../realtimeWorker/messages';
import type { JoinSchema } from '~/components/room-login/schema';
import { reducer } from './state';

const worker = new Worker(new URL('../realtimeWorker', import.meta.url), {
    type: 'module',
});

function sendMessage(msg: InboundMessage) {
    worker.postMessage(msg);
}

interface RealtimeRoomArgs {
    joinData: JoinSchema;
}

export function useRealtimeRoom({
    joinData: { nickname, roomId, isObserver },
}: RealtimeRoomArgs) {
    const [state, dispatch] = useReducer(reducer, {
        isConnected: false,
        presence: [],
        status: 'voting',
    });

    const [optimisticVote, addOptimisticVote] = useOptimistic(
        state.vote,
        (_, newVote?: string) => newVote,
    );

    const [, startTransition] = useTransition();

    useEffect(() => {
        sendMessage({
            type: 'init',
            payload: {
                nickname,
                roomId,
                isObserver,
            },
        });

        return () => {
            sendMessage({ type: 'disconnect' });
        };
    }, [nickname, roomId, isObserver]);

    function onWorkerMessage(evt: MessageEvent<OutboundMessage>) {
        if (import.meta.env.DEV) {
            console.log('Message received from worker: %o', evt.data);
        }

        switch (evt.data.type) {
            case 'connected':
                dispatch({ type: 'set_status', status: evt.data.status });
                dispatch({ type: 'client_connection', isConnected: true });
                break;
            case 'error':
                console.error(
                    'received error from worker: %o',
                    evt.data.payload,
                );

                dispatch({ type: 'error', error: evt.data.payload });
                break;
            case 'presence_sync':
                dispatch({ type: 'sync_presence', presence: evt.data.payload });
                break;
            case 'vote_response':
                dispatch({ type: 'vote', value: evt.data.payload });
                break;
            case 'state_changed':
                if (evt.data.status === 'voting') {
                    dispatch({ type: 'set_result', result: undefined });
                    dispatch({ type: 'vote', value: undefined });
                }

                dispatch({
                    type: 'set_status',
                    status: evt.data.status,
                });

                break;
            case 'room_result':
                dispatch({ type: 'set_result', result: evt.data });
                break;
            default:
                console.warn(
                    'Unknown Message received from worker: %o',
                    evt.data,
                );
                break;
        }
    }

    useEffect(() => {
        worker.addEventListener('message', onWorkerMessage);

        return () => worker.removeEventListener('message', onWorkerMessage);
    }, []);

    useEffect(() => {
        if (state.status !== 'reveal') {
            return;
        }

        sendMessage({ type: 'get_results' });
    }, [state.status]);

    function dispatchVote(payload: string) {
        startTransition(() => {
            addOptimisticVote(payload);

            sendMessage({
                type: 'vote',
                payload,
            });
        });
    }

    function dispatchReveal() {
        sendMessage({
            type: 'change_Status',
            payload: 'reveal',
        });
    }

    function dispatchReset() {
        sendMessage({
            type: 'change_Status',
            payload: 'voting',
        });
    }

    return {
        ...state,
        vote: optimisticVote,
        hasError: state.error !== undefined,
        dispatchVote,
        dispatchReveal,
        dispatchReset,
    };
}
