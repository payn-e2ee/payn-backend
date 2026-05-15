import type { NextFunction, Request, Response } from "express";
import { getUserByUsername } from "../repositories/user-repository.ts";
import { loginForm } from "../zod-schema/login-form.ts";
import bcrypt from "bcrypt";
import { createDevice } from "../repositories/device.repository.ts";
import { generateToken, verifyToken } from "../helpers/jwt-helpers.ts";
import { sendOtpForm, verifyOtpForm } from "../zod-schema/auth-forms.ts";
import { match } from "path-to-regexp";

const PROTECTED_ROUTES: string[] = [
    "/users",
    "/chats",
    "/contacts",
    "/contacts/:id",
    "/chats/:id",
    "/chats/:id/messages",
    "/chats/:id/messages/batch",
];

export async function authMiddlewareHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!isProtectedPath(req.path)) {
        next();
        return;
    }

    const accessToken = req.headers["authorization"]?.slice("Bearer ".length);
    if (!accessToken) {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }

    const jwtPayload = verifyToken(accessToken);
    if (!jwtPayload) {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }

    const authSession = jwtPayload as AuthSession;
    req.authSession = authSession;
    next();
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
    const result = loginForm.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({
            message: "Invalid request data",
            errors: result.error.flatten(),
        });
        return;
    }

    const { username, password, base64_identity_key } = result.data;

    try {
        const user = await getUserByUsername(username);
        if (!user) {
            res.status(401).json({
                message: "Invalid username or password",
            });
            return;
        }

        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({
                message: "Invalid username or password",
            });
            return;
        }

        const device = await createDevice(user.id!, base64_identity_key);

        const tokenData = {
            user_id: user.id,
            device_id: device?.id,
        };

        const accessToken = generateToken(tokenData);

        res.status(200).json({
            message: "Login successful",
            data: {
                access_token: accessToken,
                user: {
                    id: user.id,
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    phone_number: user.phone_number,
                },
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "An unexpected error occurred. Please try again later.",
        });
    }
}

export async function sendOtpHandler(req: Request, res: Response): Promise<void> {
    const result = sendOtpForm.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({
            message: "Invalid request data",
            errors: result.error.flatten(),
        });
        return;
    }

    const { bypass_token } = result.data;

    if (bypass_token === process.env.BYPASS_TOKEN) {
        //testing mode: skip sms provider
        res.status(200).json({
            message: "OTP sent via  SMS",
        });
    } else {
        //soon: sms provider not implemented yet...
        res.status(400).json({
            message: "Invalid bypass token",
        });
    }
}

export async function verifyOtpHandler(req: Request, res: Response): Promise<void> {
    const result = verifyOtpForm.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({
            message: "Invalid request data",
            errors: result.error.flatten(),
        });
        return;
    }

    const { otp, bypass_token } = result.data;

    if (bypass_token === process.env.BYPASS_TOKEN) {
        //testing mode: skip sms provider
        res.status(200).json({
            verification_token: process.env.BYPASS_TOKEN,
        });
    } else {
        //check otp with sms provider (not implemented yet)
        res.status(400).json({
            message: "Invalid OTP",
        });
    }
}
function isProtectedPath(path: string): boolean {
    return PROTECTED_ROUTES.some((pattern) => {
        const matcher = match(pattern, { decode: decodeURIComponent });
        return matcher(path) !== false;
    });
}
