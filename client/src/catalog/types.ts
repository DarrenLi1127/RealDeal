export interface PostImage {
  id: string;
  position: number;
  url: string;
}

export interface Genre {
  id: number;
  name: string;
  description: string;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  images: Array<{
    id: string;
    position: number;
    url: string;
  }>;
  createdAt: string;
  likesCount: number;
  starsCount: number;
  liked: boolean;
  starred: boolean;
  genres: Genre[];
  level: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  content: string;
  parentId?: string;
  replies: Comment[];
  likesCount: number;
  liked: boolean;
  createdAt: string;
}

  