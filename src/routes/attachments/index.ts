import { Router } from "express";
import { getAttachmentByIdHandler, uploadAttachmentHandler } from "../../handlers/attachments-handlers.ts";

const router = Router();

router.get("/:id", getAttachmentByIdHandler);
router.post("/", uploadAttachmentHandler);

export default router;