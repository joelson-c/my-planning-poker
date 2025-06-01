import type { Presence } from 'phoenix';
import type { Presence as RoomPresence } from './messages';

type UserMeta = {
    nickname: string;
    voted: boolean;
    observer: boolean;
    online_at: number;
    phx_ref: string;
};

export function mapPresence(
    presence: Presence,
    currentSocketId?: string,
): RoomPresence[] {
    return presence.list((id, { metas }) => {
        const { observer, voted, nickname }: UserMeta = [...metas].pop();
        return {
            id,
            nickname,
            observer,
            voted,
            current: id === currentSocketId,
        } satisfies RoomPresence;
    });
}
