import { z } from "zod";

export const registerDeviceForm = z.object({
    base64_identity_key: z.string().nonempty(),
    access_token: z.string().nonempty(),
});

export type RegisterDeviceForm = z.infer<typeof registerDeviceForm>;