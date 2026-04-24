import { z } from "zod";

export const createChatForm = z.object({
    participant_id: z.string().uuid(),
});

export type CreateChatForm = z.infer<typeof createChatForm>;
