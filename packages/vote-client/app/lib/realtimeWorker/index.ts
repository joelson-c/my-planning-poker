import { Channel, Socket } from 'phoenix';
import type { InboundMessage, InitMessage, OutboundMessage } from './messages';
import { initRealtime } from './init';
import { mapPresence } from './presence';

let socket: Socket | undefined;
let channel: Channel | undefined;
let currentSocketId: string | undefined;

self.onmessage = (e: MessageEvent<InboundMessage>) => {
    if (import.meta.env.DEV) {
        console.log('Message received from main script: %o', e.data);
    }

    switch (e.data.type) {
        case 'init':
            try {
                const realtime = initRealtime(e.data as InitMessage);
                socket = realtime.socket;
                channel = realtime.channel;

                channel.onError((payload) => {
                    sendMessage({ type: 'error', payload });
                });

                channel.onClose((payload) => {
                    if (typeof payload === 'string' && payload === 'leave') {
                        // Ignore normal leave events
                        return;
                    }

                    sendMessage({ type: 'room_closed' });
                });

                realtime.presence.onSync(() =>
                    sendMessage({
                        type: 'presence_sync',
                        payload: mapPresence(
                            realtime.presence,
                            currentSocketId,
                        ),
                    }),
                );

                channel.join().receive('ok', ({ id, room: { status } }) => {
                    currentSocketId = id;
                    sendMessage({ type: 'connected', status });
                });

                channel.on('state_changed', ({ status }) => {
                    sendMessage({ type: 'state_changed', status });
                });

                channel.on(
                    'user_removed',
                    ({ src_nickname, dest_nickname }) => {
                        sendMessage({
                            type: 'user_removed',
                            payload: {
                                srcNickname: src_nickname,
                                dstNickname: dest_nickname,
                            },
                        });
                    },
                );
            } catch (error) {
                sendMessage({ type: 'error', payload: error });
            }

            break;
        case 'disconnect':
            if (channel) {
                channel.leave();
                channel = undefined;
            }

            if (socket) {
                socket.disconnect();
                socket = undefined;
            }

            break;
        case 'vote':
            channel
                ?.push('vote', { value: e.data.payload })
                .receive('ok', ({ value }) => {
                    sendMessage({
                        type: 'vote_response',
                        payload: value,
                    });
                });
            break;
        case 'change_Status':
            channel?.push('change_state', { target: e.data.payload });
            break;
        case 'get_results':
            channel?.push('results', {}).receive('ok', (result) => {
                sendMessage({ type: 'room_result', ...result });
            });

            break;
        case 'remove_user':
            channel?.push('remove_user', { user_id: e.data.payload.id });

            break;
        default:
            console.warn(
                'Unknown Message received from main script: %o',
                e.data,
            );
            break;
    }
};

function sendMessage(message: OutboundMessage) {
    self.postMessage(message);
}
