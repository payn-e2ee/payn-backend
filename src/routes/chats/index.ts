import { Router } from "express";
import { listChatsHandler } from "../../handlers/chats-handlers.ts";

const router = Router();

router.get("/", listChatsHandler);

export default router;