import { z } from "zod";

export const createUserForm = z.object({
    username: z.string(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    password: z.string(),
    phone_number: z.string(),
    verification_token: z.string().optional(),
    is_verified: z.boolean().optional(),
});

export type CreateUserForm = z.infer<typeof createUserForm>;