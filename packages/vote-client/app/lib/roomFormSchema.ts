import { z } from 'zod';

export const roomJoinSchema = z.object({
    nickname: z.string().min(2).max(32),
    isObserver: z.coerce.boolean().default(false),
    roomId: z.string().min(1),
});

export type RoomJoinShema = z.infer<typeof roomJoinSchema>;

export const roomCreateSchema = roomJoinSchema.omit({
    roomId: true,
});

export type RoomCreateSchema = z.infer<typeof roomCreateSchema>;
