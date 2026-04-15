import { Router } from "express";
import { loginHandler } from "../../handlers/auth-handlers.ts";

const router = Router();

router.post("/login", loginHandler);

export default router;