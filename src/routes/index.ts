import { Router } from "express";

import usersRouter from "./users/index.ts";
import authRouter from "./auth/index.ts";
import chatsRouter from "./chats/index.ts";
import contactsRouter from "./contacts/index.ts";
import attachmentsRouter from "./attachments/index.ts";

import { authMiddlewareHandler } from "../handlers/auth-handlers.ts";

const router = Router();

router.use(authMiddlewareHandler);

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/chats", chatsRouter);
router.use("/contacts", contactsRouter);
router.use("/attachments", attachmentsRouter);

export default router;