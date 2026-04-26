import { z } from "zod";

export const editContactForm = z.object({
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
});

export type EditContactForm = z.infer<typeof editContactForm>;
