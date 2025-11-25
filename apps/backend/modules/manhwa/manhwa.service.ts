import { prisma } from "../../lib/prisma";

// NEW: reading statuses constant & type
export const READING_STATUSES = [
  "PLANNING",
  "READING",
  "COMPLETED",
  "PAUSED",
  "DROPPED",
] as const;
type ReadingStatus = (typeof READING_STATUSES)[number];

interface ListOpts {
  search?: string;
  genre?: string;
  page: number;
  limit: number;
}

export async function listManhwa(opts: ListOpts) {
  const { search, genre, page, limit } = opts;
  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }
  if (genre) where.genres = { has: genre };

  const [data, total] = await Promise.all([
    prisma.manhwa.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        slug: true,
        title: true,
        coverUrl: true,
        genres: true,
        createdAt: true,
      },
    }),
    prisma.manhwa.count({ where }),
  ]);

  return { data, total };
}

export async function manhwaDetail(slug: string, userId?: string) {
  const manhwa = await prisma.manhwa.findUnique({ where: { slug } });
  if (!manhwa) return null;

  let extras: any = {};
  if (userId) {
    const fav = await prisma.favorite.findUnique({
      where: { userId_manhwaId: { userId, manhwaId: manhwa.id } },
    });
    const status = await prisma.readingStatus.findUnique({
      where: { userId_manhwaId: { userId, manhwaId: manhwa.id } },
    });
    extras = {
      isFavorite: !!fav,
      readingStatus: status?.status ?? null,
      progress: status?.progress ?? null,
    };
  }
  return { ...manhwa, ...extras };
}

export async function toggleFavoriteBySlug(slug: string, userId: string) {
  const manhwa = await prisma.manhwa.findUnique({ where: { slug } });
  if (!manhwa) throw new Error("NOT_FOUND");

  const existing = await prisma.favorite.findUnique({
    where: { userId_manhwaId: { userId, manhwaId: manhwa.id } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return { isFavorite: false };
  }

  await prisma.favorite.create({ data: { userId, manhwaId: manhwa.id } });
  return { isFavorite: true };
}

export async function upsertReadingStatusBySlug(
  slug: string,
  userId: string,
  status: any,
  progress?: number
) {
  const manhwa = await prisma.manhwa.findUnique({ where: { slug } });
  if (!manhwa) throw new Error("NOT_FOUND");

  const existing = await prisma.readingStatus.findUnique({
    where: { userId_manhwaId: { userId, manhwaId: manhwa.id } },
  });

  let p = progress ?? 0;
  let finalStatus = status;

  if (status === "PLANNING" && p > 0) finalStatus = "READING";
  if (!existing) {
    return prisma.readingStatus.create({
      data: { userId, manhwaId: manhwa.id, status: finalStatus, progress: p },
    });
  }
  if (existing.status === "PLANNING" && finalStatus === "PLANNING" && p > 0) {
    finalStatus = "READING";
  }
  return prisma.readingStatus.update({
    where: { id: existing.id },
    data: { status: finalStatus, progress: p },
  });
}

export async function listCommentsBySlug(slug: string) {
  const manhwa = await prisma.manhwa.findUnique({ where: { slug } });
  if (!manhwa) return null;

  const comments = await prisma.comment.findMany({
    where: { manhwaId: manhwa.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, username: true, displayName: true } },
    },
  });

  return { manhwaId: manhwa.id, comments };
}

export async function createCommentBySlug(
  slug: string,
  userId: string,
  body: string
) {
  const manhwa = await prisma.manhwa.findUnique({ where: { slug } });
  if (!manhwa) throw new Error("NOT_FOUND");
  return prisma.comment.create({
    data: { userId, manhwaId: manhwa.id, body },
  });
}

// MOVED to modules/user/user.service.ts:
// - listCommentsByUser
// - listManhwaByUserStatus
