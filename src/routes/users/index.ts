import { Router } from "express";
import { getCurrentUserHandler, getUserByIdHandler } from "../../handlers/users-handlers.ts";

const router = Router();

router.get("/", getCurrentUserHandler);
router.get("/:id", getUserByIdHandler);

export default router;