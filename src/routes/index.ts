import { Router } from "express";

import usersRouter from "./users/index.ts";
import authRouter from "./auth/index.ts";
import chatsRouter from "./chats/index.ts";
import { authMiddlewareHandler } from "../handlers/auth-handlers.ts";

const router = Router();

router.use(authMiddlewareHandler);

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/chats", chatsRouter);

export default router;