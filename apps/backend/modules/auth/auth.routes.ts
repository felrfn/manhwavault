import { Router } from "express";
import { z } from "zod";
import {
  registerUser,
  loginUser,
  me,
  updateProfile,
  changePassword,
} from "./auth.service.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  displayName: z.string().optional(),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

router.post("/register", async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success)
    return res
      .status(400)
      .json({ success: false, error: parse.error.flatten() });
  try {
    const data = await registerUser(
      parse.data.username,
      parse.data.password,
      parse.data.displayName
    );
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    if (e.message === "USERNAME_TAKEN")
      return res
        .status(409)
        .json({ success: false, error: "Username already used" });
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success)
    return res
      .status(400)
      .json({ success: false, error: parse.error.flatten() });
  try {
    const data = await loginUser(parse.data.username, parse.data.password);
    res.json({ success: true, data });
  } catch (e: any) {
    if (e.message === "INVALID_CREDENTIALS")
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.get("/me", auth, async (req: any, res) => {
  try {
    const data = await me(req.userId);
    res.json({ success: true, data });
  } catch (e: any) {
    if (e.message === "NOT_FOUND")
      return res.status(404).json({ success: false, error: "User not found" });
    res.status(500).json({ success: false, error: "Server error" });
  }
});

const profileSchema = z.object({
  displayName: z.string().optional().nullable(),
});
router.patch("/profile", auth, async (req: any, res) => {
  const parse = profileSchema.safeParse(req.body);
  if (!parse.success)
    return res
      .status(400)
      .json({ success: false, error: parse.error.flatten() });
  try {
    const data = await updateProfile(
      req.userId,
      parse.data.displayName ?? null
    );
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6),
});
router.patch("/password", auth, async (req: any, res) => {
  const parse = changePasswordSchema.safeParse(req.body);
  if (!parse.success)
    return res
      .status(400)
      .json({ success: false, error: parse.error.flatten() });
  try {
    await changePassword(
      req.userId,
      parse.data.oldPassword,
      parse.data.newPassword
    );
    res.json({ success: true });
  } catch (e: any) {
    if (e.message === "INVALID_OLD_PASSWORD")
      return res
        .status(401)
        .json({ success: false, error: "Invalid old password" });
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
