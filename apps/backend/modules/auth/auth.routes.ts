import { Router } from "express";
import { z } from "zod";
import { registerUser, loginUser, me } from "./auth.service";
import { auth } from "../../middlewares/auth";

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
      parse.data.displayName,
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

export default router;
