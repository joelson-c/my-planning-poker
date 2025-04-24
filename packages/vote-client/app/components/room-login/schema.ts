import { z } from 'zod';

export const createSchema = z.object({
    nickname: z.string().min(2).max(32),
    isObserver: z.coerce.boolean().default(false),
    roomId: z.literal(''),
});

export type CreateSchema = z.infer<typeof createSchema>;

export const joinSchema = createSchema.extend({
    roomId: z.string().min(1),
});

export type JoinSchema = z.infer<typeof joinSchema>;

export type LoginSchemas = JoinSchema | CreateSchema;
