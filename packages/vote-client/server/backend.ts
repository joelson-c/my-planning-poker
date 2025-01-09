import type { Request, Response } from 'express';
import PocketBase, {
    type RecordAuthResponse,
    type RecordService,
} from 'pocketbase';
import type { Room } from '~/types/room';
import type { User } from '~/types/user';

interface TypedPocketBase extends PocketBase {
    collection(idOrName: string): RecordService; // default fallback for any other collection
    collection(idOrName: 'vote_users'): RecordService<User>;
    collection(idOrName: 'vote_rooms'): RecordService<Room>;
}

export type Backend = TypedPocketBase;

export async function createBackend(request: Request, response: Response) {
    const pb = new PocketBase(
        import.meta.env.VITE_BACKEND_ENDPOINT,
    ) as TypedPocketBase;

    pb.authStore.loadFromCookie(request.get('Cookie') || '');
    pb.authStore.onChange(() => {
        if (response.headersSent) {
            return;
        }

        response.append('Set-Cookie', pb.authStore.exportToCookie());
    });

    try {
        // get an up-to-date auth store state by verifying and refreshing the loaded auth record (if any)
        if (pb.authStore.isValid) {
            await pb.collection('vote_users').authRefresh();
        }
    } catch {
        // clear the auth store on failed refresh
        pb.authStore.clear();
    }

    return pb;
}

export async function authWithRoomAndNickname(
    backend: Backend,
    room: string,
    nickname: string,
    password: string,
) {
    const authResponse = await backend.send<RecordAuthResponse<User>>(
        '/api/vote/collections/vote_rooms/room-auth',
        {
            method: 'POST',
            body: {
                nickname,
                password,
                room,
            },
        },
    );

    backend.authStore.save(authResponse.token, authResponse.record);

    return authResponse;
}
