export interface PostImage {
    id: string;
    position: number;
    url: string;
  }
  
  export interface Post {
    id: string;
    userId: string;
    username: string;
    title: string;
    content: string;
    images: PostImage[];
    createdAt: string;
    
    likesCount?: number;
    starsCount?: number;
    liked?: boolean;
    starred?: boolean;
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
  