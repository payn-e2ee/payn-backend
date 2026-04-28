import { Router } from "express";
import { getCurrentUserHandler, updateCurrentUserHandler } from "../../handlers/users-handlers.ts";

const router = Router();

router.get("/", getCurrentUserHandler);
router.patch("/", updateCurrentUserHandler);

export default router;