import { z } from 'zod';

export const roomJoinForm = z.object({
    nickname: z.string().min(2).max(32),
    isObserver: z.boolean().default(false),
    roomId: z.optional(z.string()),
});

export type RoomJoinForm = z.infer<typeof roomJoinForm>;
