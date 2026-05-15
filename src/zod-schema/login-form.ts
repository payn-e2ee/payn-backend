import { z } from "zod";

export const loginForm = z.object({
    username: z.string().nonempty(),
    password: z.string().nonempty(),
    base64_identity_key: z.string().nonempty(),
    fcm_token: z.string().optional(),
});

export type LoginForm = z.infer<typeof loginForm>;