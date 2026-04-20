import { Router } from "express";
import { getContactByIdHandler, listContactsHandler } from "../../handlers/contacts-handlers.ts";

const router = Router();

router.get("/", listContactsHandler);
router.get("/:id", getContactByIdHandler);

export default router;