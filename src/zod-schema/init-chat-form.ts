import { z } from "zod";


export const initChatForm = z.object({
    message_frames: z.array(
        z.object({
            header: z.object({
                chat_id: z.string(),
                message_id: z.string(),
                sender_user_id: z.string().nonempty(),
                sender_device_id: z.string().nonempty(),
                recipient_user_id: z.string().nonempty(),
                recipient_device_id: z.string().nonempty(),
                sender_identity_key: z.string().nonempty(),
                sender_ephemeral_public_key: z.string().nonempty(),
                message_counter: z.number(),
            }),
            ciphertext: z.string().nonempty(),
            auth_tag: z.string(),
        })
    ).nonempty(),
});

export type InitChatForm = z.infer<typeof initChatForm>;