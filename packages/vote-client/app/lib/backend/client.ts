import PocketBase, { BaseAuthStore, RecordService } from 'pocketbase';
import type { Room } from '~/types/room';
import type { UserRecord } from '~/types/user';

interface AuthStore extends BaseAuthStore {
    get record(): UserRecord | null;
}

export interface BackendClient extends PocketBase {
    collection(idOrName: string): RecordService;
    collection(idOrName: 'voteUsers'): RecordService<UserRecord>;
    collection(idOrName: 'voteRooms'): RecordService<Room>;
    authStore: AuthStore;
}

export const backendClient = new PocketBase(
    import.meta.env.VITE_BACKEND_ENDPOINT,
) as BackendClient;
