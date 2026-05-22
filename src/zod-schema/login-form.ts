import { z } from "zod";

export const loginForm = z.object({
    username: z.string().nonempty(),
    password: z.string().nonempty(),
});

export type LoginForm = z.infer<typeof loginForm>;