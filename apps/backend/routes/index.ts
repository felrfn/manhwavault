import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import manhwaRoutes from "../modules/manhwa/manhwa.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/manhwa", manhwaRoutes);

export default router;
