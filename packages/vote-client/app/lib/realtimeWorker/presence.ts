import type { Presence } from 'phoenix';
import type { Presence as RoomPresence } from './messages';

type UserMeta = {
    socket_id: string;
    voted: boolean;
    observer: boolean;
    online_at: number;
    phx_ref: string;
};

export function mapPresence(
    presence: Presence,
    currentSocketId?: string,
): RoomPresence[] {
    return presence.list((nickname, { metas }) => {
        const { observer, voted, phx_ref, socket_id }: UserMeta = [
            ...metas,
        ].pop();
        return {
            id: phx_ref,
            nickname,
            observer,
            voted,
            current: socket_id === currentSocketId,
        } satisfies RoomPresence;
    });
}
