// Type definitions
export interface User {
  id: string;
  email: string;
  name?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  title: string;
  content?: string | null;
  published: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
