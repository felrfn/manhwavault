import { api } from "./client";
import type { Manhwa, Paginated, Comment } from "./types";

export async function listManhwa(
  page = 1,
  limit = 30,
  search?: string,
  genre?: string,
): Promise<Paginated<Manhwa>> {
  const params: any = { page, limit };
  if (search) params.search = search;
  if (genre) params.genre = genre;
  const res = await api.get("/manhwa", { params });
  return { data: res.data.data, meta: res.data.meta };
}

export async function manhwaDetail(slug: string): Promise<Manhwa> {
  const res = await api.get(`/manhwa/${slug}`);
  return res.data.data;
}

export async function toggleFavorite(slug: string) {
  const res = await api.post(`/manhwa/${slug}/favorite`);
  return res.data.data;
}

export async function updateStatus(
  slug: string,
  status: string,
  progress?: number,
) {
  const body: any = { status };
  if (typeof progress === "number") body.progress = progress;
  const res = await api.patch(`/manhwa/${slug}/status`, body);
  return res.data.data;
}

export async function fetchComments(slug: string): Promise<Comment[]> {
  const res = await api.get(`/manhwa/${slug}/comments`);
  return res.data.data;
}

export async function postComment(slug: string, body: string) {
  const res = await api.post(`/manhwa/${slug}/comments`, { body });
  return res.data.data;
}
