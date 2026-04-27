import { Router } from "express";
import { getContactByIdHandler, listContactsHandler, addContactHandler, deleteContactHandler } from "../../handlers/contacts-handlers.ts";

const router = Router();

router.get("/", listContactsHandler);
router.get("/:id", getContactByIdHandler);
router.post("/", addContactHandler);
router.delete("/:id", deleteContactHandler);

export default router;