import { Router } from "express";
import { createChatHandler, getChatByIdHandler, listChatsHandler,  } from "../../handlers/chats-handlers.ts";

const router = Router();

router.get("/", listChatsHandler);
router.get("/:id", getChatByIdHandler);
router.post("/", createChatHandler);
export default router;