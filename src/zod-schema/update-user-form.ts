import { z } from "zod";

export const updateUserForm = z.object({
    username: z.string().optional(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    phone_number: z.string().optional(),
});

export type UpdateUserForm = z.infer<typeof updateUserForm>;