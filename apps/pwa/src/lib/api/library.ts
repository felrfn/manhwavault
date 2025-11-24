import { api } from "./client";

interface LibraryItem {
  slug: string;
  title: string;
  coverUrl?: string;
  genres: string[];
  status: string;
  progress: number;
  updatedAt: string;
}

interface LibraryResponse {
  success: boolean;
  data: LibraryItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export async function listLibrary(status: string, page = 1, limit = 20) {
  const res = await api.get(`/library/${status.toLowerCase()}`, {
    params: { page, limit },
  });
  return res.data as LibraryResponse;
}

export async function librarySummary() {
  const res = await api.get("/library/summary");
  return res.data.data as Record<string, number>;
}
