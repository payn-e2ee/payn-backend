import { Router } from "express";
import { getCurrentUserHandler } from "../../handlers/users-handlers.ts";

const router = Router();

router.get("/", getCurrentUserHandler);

export default router;