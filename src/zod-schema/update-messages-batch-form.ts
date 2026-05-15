import { z } from "zod";

export const updateMessagesBatchForm = z.object({
    message_ids: z.array(z.string()).min(1),
    status: z.enum(["sent", "delivered", "seen"]),
});

export type UpdateMessagesBatchForm = z.infer<typeof updateMessagesBatchForm>;