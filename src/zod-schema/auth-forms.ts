import { z } from "zod";

export const sendOtpForm = z.object({
    phone_number: z.string(),
    bypass_token: z.string().optional(),
});

export const verifyOtpForm = z.object({
    phone_number: z.string(),
    otp: z.number(),
    bypass_token: z.string().optional(),
});

export type SendOtpForm = z.infer<typeof sendOtpForm>;
export type VerifyOtpForm = z.infer<typeof verifyOtpForm>;
