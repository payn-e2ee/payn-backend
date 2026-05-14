import { Router } from "express";
import { getChatByIdHandler, initChatHandler, listChatsHandler, listMessagesHandler, updateMessagesBatchHandler } from "../../handlers/chats-handlers.ts";

const router = Router();

router.get("/", listChatsHandler);
router.post("/init", initChatHandler);
router.get("/:id", getChatByIdHandler);
router.get("/:id/messages", listMessagesHandler);
router.patch("/:id/messages/batch", updateMessagesBatchHandler);

export default router;