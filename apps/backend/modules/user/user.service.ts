import { prisma } from "../../lib/prisma";

type ReadingStatus =
  | "PLANNING"
  | "READING"
  | "COMPLETED"
  | "PAUSED"
  | "DROPPED";

export async function listCommentsByUser(
  userId: string,
  page: number,
  limit: number
) {
  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        manhwa: {
          select: { id: true, slug: true, title: true, coverUrl: true },
        },
      },
    }),
    prisma.comment.count({ where: { userId } }),
  ]);
  return { data: comments, total };
}

export async function listManhwaByUserStatus(
  userId: string,
  status: ReadingStatus,
  page: number,
  limit: number
) {
  const [rows, total] = await Promise.all([
    prisma.readingStatus.findMany({
      where: { userId, status },
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        manhwa: {
          select: {
            id: true,
            slug: true,
            title: true,
            coverUrl: true,
            genres: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.readingStatus.count({ where: { userId, status } }),
  ]);

  const data = rows.map((r) => ({
    ...r.manhwa,
    status: r.status,
    progress: r.progress,
  }));

  return { data, total };
}
