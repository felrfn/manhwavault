import { Router } from "express";
import { parsePagination } from "../../utils/pagination.js";
import { listLatestComments } from "./comment.service.js";

const router = Router();

// GET /comments
router.get("/", async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const { data, total } = await listLatestComments(page, limit);
  res.json({
    success: true,
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export default router;
