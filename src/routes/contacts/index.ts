import { Router } from "express";
import { listContactsHandler } from "../../handlers/contacts-handlers.ts";

const router = Router();

router.get("/", listContactsHandler);

export default router;