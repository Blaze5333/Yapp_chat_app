import { Router } from "express";
import { protectRoute } from "../middleware/auth";

const router = Router();
router.use(protectRoute)

// router.get("/")
// router.post("/with:participantId")
export default router;