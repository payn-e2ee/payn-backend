import { Router } from "express";
import { getContactByIdHandler, listContactsHandler, addContactHandler } from "../../handlers/contacts-handlers.ts";

const router = Router();

router.get("/", listContactsHandler);
router.get("/:id", getContactByIdHandler);
router.post("/", addContactHandler);

export default router;