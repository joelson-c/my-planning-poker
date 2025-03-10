import {
    USER_KICKED_CLOSE_CODE,
    type InboundMessage,
    type OutboundMessage,
} from '~/types/messages';
import { backendClient } from '../backend/client';

type Subscriber = () => void;
type Snapshot = {
    open: boolean;
    message?: InboundMessage;
    closeCode?: number;
    closeReason?: string;
};

const initialSnapshot = {
    open: false,
} satisfies Snapshot;

class Socket {
    private static readonly EXPECTED_CLOSE_CODES = [
        1000,
        USER_KICKED_CLOSE_CODE,
    ];

    private static readonly MIN_RECONNECT_DELAY = 1000;
    private static readonly MAX_RECONNECT_DELAY = 30000;

    private socket: WebSocket;
    private subscribers: Subscriber[] = [];
    private snapshot: Snapshot = initialSnapshot;
    private outboundMessages: OutboundMessage[] = [];
    private reconnectTimeout: number = Socket.MIN_RECONNECT_DELAY;

    constructor(private readonly url: string) {
        this.socket = new WebSocket(this.url);

        this.initEvents();
    }

    subscribe = (subscriber: Subscriber) => {
        this.subscribers.push(subscriber);
        return () => {
            this.subscribers = this.subscribers.filter(
                (item) => item !== subscriber,
            );
        };
    };

    close = () => {
        this.socket.close();
        this.removeEvents();
    };

    getSnapshot = () => {
        return this.snapshot;
    };

    sendMessage = (message: OutboundMessage) => {
        this.outboundMessages.push(message);
        this.flushOutboundMessages();
    };

    private initEvents() {
        this.socket.addEventListener('open', this.onOpen);
        this.socket.addEventListener('close', this.onClose);
        this.socket.addEventListener('message', this.onMessage);
        this.socket.addEventListener('error', this.onError);
    }

    private removeEvents() {
        this.socket.removeEventListener('open', this.onOpen);
        this.socket.removeEventListener('close', this.onClose);
        this.socket.removeEventListener('message', this.onMessage);
        this.socket.removeEventListener('error', this.onError);
    }

    private notifySubscribers() {
        this.subscribers.forEach((subscriber) => subscriber());
    }

    private onOpen = () => {
        this.reconnectTimeout = Socket.MIN_RECONNECT_DELAY;
        this.setSnapshot({ open: true });
        this.notifySubscribers();
        this.flushOutboundMessages();
    };

    private onClose = (event: CloseEvent) => {
        this.setSnapshot({
            open: false,
            closeCode: event.code,
            closeReason: event.reason,
        });

        this.notifySubscribers();

        if (Socket.EXPECTED_CLOSE_CODES.includes(event.code)) {
            this.removeEvents();
            return;
        }

        this.tryReconnect();
    };

    private onError = () => {
        this.close();
    };

    private onMessage = (event: MessageEvent) => {
        const messages = this.parseMessages(event.data);
        if (!messages) {
            console.warn('Received invalid message:', event.data);
            return;
        }

        messages.forEach((message) => {
            this.setSnapshot({ message });
            this.notifySubscribers();
        });
    };

    private parseMessages(message: string): InboundMessage[] {
        if (typeof message !== 'string') {
            return [];
        }

        if (message.includes('\n')) {
            // Split multi-line messages
            const messages = message.split('\n');
            return messages.flatMap((msg) => this.parseMessages(msg));
        }

        try {
            return [JSON.parse(message)];
        } catch (error) {
            console.warn('Failed to parse message:', message, error);
            return [];
        }
    }

    private setSnapshot(snapshot: Partial<Snapshot>) {
        this.snapshot = {
            ...this.snapshot,
            ...snapshot,
        };
    }

    private flushOutboundMessages() {
        if (!this.snapshot.open) {
            // Socket is not open, do not send messages
            return;
        }

        while (this.outboundMessages.length > 0) {
            this.socket.send(
                this.encodeMessage(this.outboundMessages.shift()!),
            );
        }
    }

    private encodeMessage(message: OutboundMessage) {
        return JSON.stringify(message);
    }

    private tryReconnect() {
        if (this.snapshot.open) {
            return;
        }

        this.reconnectTimeout = Math.min(
            this.reconnectTimeout * 2,
            Socket.MAX_RECONNECT_DELAY,
        );
        setTimeout(() => {
            this.close();

            this.socket = new WebSocket(this.url);
            this.initEvents();
        }, this.reconnectTimeout);
    }
}

let socketInstance: Socket | null = null;
export function getSocket() {
    const url = new URL(backendClient.buildURL(`/api/ws/room`));
    url.protocol = 'wss:';
    url.searchParams.set('token', backendClient.authStore.token);

    if (!socketInstance) {
        socketInstance = new Socket(url.toString());
    }

    return socketInstance;
}
