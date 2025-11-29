import { Router } from "express";
import { parsePagination } from "../../utils/pagination.js";
import { prisma } from "../../lib/prisma.js";
import {
  listCommentsByUser,
  listManhwaByUserStatus,
  listFavoritesByUser,
} from "./user.service.js";
import { READING_STATUSES } from "../manhwa/manhwa.service.js";

const router = Router();

// GET /user/:username/comments
router.get("/:username/comments", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
  });
  if (!user)
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "User not found" },
    });

  const { page, limit } = parsePagination(req.query);
  const { data, total } = await listCommentsByUser(user.id, page, limit);

  res.json({
    success: true,
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /user/:username/status/:status
router.get("/:username/status/:status", async (req, res) => {
  const rawStatus = String(req.params.status || "").toUpperCase();
  if (!READING_STATUSES.includes(rawStatus as any)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid status" },
    });
  }

  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
  });
  if (!user)
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "User not found" },
    });

  const { page, limit } = parsePagination(req.query);
  const { data, total } = await listManhwaByUserStatus(
    user.id,
    rawStatus as any,
    page,
    limit
  );

  res.json({
    success: true,
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /user/:username/favorites
router.get("/:username/favorites", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
  });
  if (!user)
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "User not found" },
    });

  const { data } = await listFavoritesByUser(user.id);
  res.json({ success: true, data });
});

export default router;
