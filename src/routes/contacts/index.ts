import { Router } from "express";
import { getContactByIdHandler, listContactsHandler, addContactHandler, deleteContactHandler, updateContactHandler, searchContactsHandler } from "../../handlers/contacts-handlers.ts";

const router = Router();

router.get("/", listContactsHandler);
router.get("/search", searchContactsHandler);
router.get("/:id", getContactByIdHandler);
router.post("/", addContactHandler);
router.patch("/:id", updateContactHandler);
router.delete("/:id", deleteContactHandler);

export default router;