import { z } from "zod";

export const addContactForm = z.object({
    phone_number: z.string(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
});

export type AddContactForm = z.infer<typeof addContactForm>;
