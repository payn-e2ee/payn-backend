import { Router } from "express";
import { loginHandler, sendOtpHandler, verifyOtpHandler } from "../../handlers/auth-handlers.ts";
import { registerHandler } from "../../handlers/users-handlers.ts";

const router = Router();

router.post("/login", loginHandler);
router.post("/send-otp", sendOtpHandler);
router.post("/verify-otp", verifyOtpHandler);
router.post("/register", registerHandler);

export default router;