import { z } from "zod";

export const updateUserForm = z.object({
    username: z.string().nonempty(),
    firstname: z.string().nonempty(),
    lastname: z.string().nonempty(),
});

export type UpdateUserForm = z.infer<typeof updateUserForm>;