import { z } from "zod";

export const uploadAttachmentForm = z.object({
    original_file_name: z.string(),
    original_file_size: z.coerce.number(),
});

export type UploadAttachmentForm = z.infer<typeof uploadAttachmentForm>;
