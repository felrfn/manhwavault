import { Router } from "express";
import { authOptional, auth } from "../../middlewares/auth.js";
import { parsePagination } from "../../utils/pagination.js";
import {
  listManhwa,
  manhwaDetail,
  toggleFavoriteBySlug,
  upsertReadingStatusBySlug,
  listCommentsBySlug,
  createCommentBySlug,
  READING_STATUSES,
  upsertRatingBySlug,
} from "./manhwa.service.js";
import { z } from "zod";

const router = Router();

// LIST
router.get("/", async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const search = req.query.search ? String(req.query.search) : undefined;
  const genre = req.query.genre ? String(req.query.genre) : undefined;
  const { data, total } = await listManhwa({ search, genre, page, limit });
  res.json({
    success: true,
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// NEW: statuses enumeration helper
router.get("/statuses", (_req, res) => {
  res.json({ success: true, data: READING_STATUSES });
});

// DETAIL
router.get("/:slug", authOptional, async (req: any, res) => {
  const detail = await manhwaDetail(req.params.slug, req.userId);
  if (!detail)
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Manhwa not found" },
    });
  res.json({ success: true, data: detail });
});

// FAVORITE TOGGLE
router.post("/:slug/favorite", auth, async (req: any, res) => {
  try {
    const result = await toggleFavoriteBySlug(req.params.slug, req.userId);
    res.json({ success: true, data: result });
  } catch (e: any) {
    if (e.message === "NOT_FOUND")
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Manhwa not found" },
      });
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal error" },
    });
  }
});

// READING STATUS
const statusSchema = z.object({
  status: z.enum(["PLANNING", "READING", "COMPLETED", "PAUSED", "DROPPED"]),
  progress: z.number().int().min(0).optional(),
});

router.patch("/:slug/status", auth, async (req: any, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", issues: parsed.error.flatten() },
    });
  try {
    const updated = await upsertReadingStatusBySlug(
      req.params.slug,
      req.userId,
      parsed.data.status,
      parsed.data.progress
    );
    res.json({ success: true, data: updated });
  } catch (e: any) {
    if (e.message === "NOT_FOUND")
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Manhwa not found" },
      });
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal error" },
    });
  }
});

// COMMENTS LIST
router.get("/:slug/comments", async (req, res) => {
  const result = await listCommentsBySlug(req.params.slug);
  if (!result)
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Manhwa not found" },
    });
  res.json({ success: true, data: result.comments });
});

// COMMENT CREATE
const commentSchema = z.object({ body: z.string().min(1) });

router.post("/:slug/comments", auth, async (req: any, res) => {
  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", issues: parsed.error.flatten() },
    });
  try {
    const created = await createCommentBySlug(
      req.params.slug,
      req.userId,
      parsed.data.body
    );
    res.status(201).json({ success: true, data: created });
  } catch (e: any) {
    if (e.message === "NOT_FOUND")
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Manhwa not found" },
      });
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal error" },
    });
  }
});

export default router;

// RATING CELENJ
const ratingSchema = z.object({ score: z.number().int().min(1).max(5) });

router.put("/:slug/rating", auth, async (req: any, res) => {
  const parsed = ratingSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", issues: parsed.error.flatten() },
    });
  try {
    const updated = await upsertRatingBySlug(
      req.params.slug,
      req.userId,
      parsed.data.score
    );
    res.json({ success: true, data: updated });
  } catch (e: any) {
    if (e.message === "NOT_FOUND")
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Manhwa not found" },
      });
    if (e.message === "VALIDATION_ERROR")
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Score must be 1-5" },
      });
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal error" },
    });
  }
});
