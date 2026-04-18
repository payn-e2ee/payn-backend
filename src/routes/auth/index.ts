import { Router } from "express";
import { loginHandler, registerHandler, sendOtpHandler, verifyOtpHandler } from "../../handlers/auth-handlers.ts";

const router = Router();

router.post("/login", loginHandler);
router.post("/send-otp", sendOtpHandler);
router.post("/verify-otp", verifyOtpHandler);
router.post("/register", registerHandler);

export default router;