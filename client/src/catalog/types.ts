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
  