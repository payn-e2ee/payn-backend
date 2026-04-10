import { z } from "zod";

export const createUserForm = z.object({
    username: z.string(),
});

export type CreateUserForm = z.infer<typeof createUserForm>;