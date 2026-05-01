import { Router } from "express";
import { getCurrentUserHandler, getUserByIdHandler, updateCurrentUserHandler } from "../../handlers/users-handlers.ts";

const router = Router();

router.get("/", getCurrentUserHandler);
router.get("/:id", getUserByIdHandler);
router.patch("/", updateCurrentUserHandler);

export default router;