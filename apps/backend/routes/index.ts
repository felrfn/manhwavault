import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import manhwaRoutes from "../modules/manhwa/manhwa.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import commentRoutes from "../modules/comment/comment.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/manhwa", manhwaRoutes);
router.use("/user", userRoutes);
router.use("/comments", commentRoutes);

export default router;
