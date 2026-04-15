import { z } from "zod";

export const loginForm = z.object({
    username: z.string(),
    password: z.string(),
    base64_identity_key: z.string(),
});

export type LoginForm = z.infer<typeof loginForm>;