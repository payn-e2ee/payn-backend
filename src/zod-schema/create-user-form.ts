import { z } from "zod";

export const createUserForm = z.object({
    username: z.string(),
    firstname: z.string(),
    lastname: z.string(),
    password: z.string(),
    phone_number: z.string(),
});

export type CreateUserForm = z.infer<typeof createUserForm>;