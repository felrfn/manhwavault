import { prisma } from "../../lib/prisma.js";

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

  const [data, total] = await prisma.$transaction([
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

  const ids = data.map((m: any) => m.id);
  const rating = (prisma as any).rating;
  const grouped =
    ids.length && rating
      ? await rating.groupBy({
          by: ["manhwaId"],
          where: { manhwaId: { in: ids } },
          _avg: { score: true },
        })
      : [];
  const avgMap = new Map(
    (
      grouped as Array<{ manhwaId: string; _avg: { score: number | null } }>
    ).map((g) => [
      g.manhwaId,
      Number(((g._avg.score ?? 0) as number).toFixed(2)),
    ])
  );

  const enriched = data.map((m: any) => ({
    ...m,
    avgRating: avgMap.get(m.id) ?? 0,
  }));

  return { data: enriched, total };
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
    const rating = await (prisma as any).rating.findUnique({
      where: { userId_manhwaId: { userId, manhwaId: manhwa.id } },
    });
    extras = {
      isFavorite: !!fav,
      readingStatus: status?.status ?? null,
      progress: status?.progress ?? null,
      myRating: rating?.score ?? null,
    };
  }
  const agg = await (prisma as any).rating.aggregate({
    where: { manhwaId: manhwa.id },
    _avg: { score: true },
    _count: { score: true },
  });
  const avgRating = Number((agg._avg.score ?? 0).toFixed(2));
  const ratingCount = agg._count.score ?? 0;
  return { ...manhwa, avgRating, ratingCount, ...extras };
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
    include: {
      user: { select: { username: true, displayName: true } },
    },
  });
}

// MOVED to modules/user/user.service.ts:
// - listCommentsByUser
// - listManhwaByUserStatus

export async function upsertRatingBySlug(
  slug: string,
  userId: string,
  score: number
) {
  if (score < 1 || score > 5) throw new Error("VALIDATION_ERROR");
  const manhwa = await prisma.manhwa.findUnique({ where: { slug } });
  if (!manhwa) throw new Error("NOT_FOUND");
  const existing = await (prisma as any).rating.findUnique({
    where: { userId_manhwaId: { userId, manhwaId: manhwa.id } },
  });
  if (!existing) {
    return (prisma as any).rating.create({
      data: { userId, manhwaId: manhwa.id, score },
    });
  }
  return (prisma as any).rating.update({
    where: { id: existing.id },
    data: { score },
  });
}
