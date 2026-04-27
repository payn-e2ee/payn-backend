import { z } from "zod";

export const createUserForm = z.object({
    username: z.string(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    phone_number: z.string(),
    verification_token: z.string().optional(),
});

export type CreateUserForm = z.infer<typeof createUserForm>;