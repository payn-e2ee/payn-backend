import { Router } from "express";
import { getChatByIdHandler, initChatHandler, listChatsHandler, listMessagesHandler } from "../../handlers/chats-handlers.ts";

const router = Router();

router.get("/", listChatsHandler);
router.post("/init", initChatHandler);
router.get("/:id", getChatByIdHandler);
router.get("/:id/messages", listMessagesHandler);

export default router;