export interface Manhwa {
  id: string;
  slug: string;
  title: string;
  description?: string;
  coverUrl?: string;
  genres: string[];
  createdAt: string;
  isFavorite?: boolean;
  readingStatus?: string | null;
  progress?: number | null;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; username: string; displayName?: string | null };
}
