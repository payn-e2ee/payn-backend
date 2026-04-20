import { Router } from "express";
import { getChatByIdHandler, listChatsHandler } from "../../handlers/chats-handlers.ts";

const router = Router();

router.get("/", listChatsHandler);
router.get("/:id", getChatByIdHandler);

export default router;