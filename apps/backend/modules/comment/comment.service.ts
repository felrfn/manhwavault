import { prisma } from "../../lib/prisma.js";

export async function listLatestComments(page: number, limit: number) {
  const [rows, total] = await prisma.$transaction([
    prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        user: { select: { id: true, username: true, displayName: true } },
        manhwa: {
          select: {
            id: true,
            slug: true,
            title: true,
            coverUrl: true,
          },
        },
      },
    }),
    prisma.comment.count(),
  ]);

  return { data: rows, total };
}
