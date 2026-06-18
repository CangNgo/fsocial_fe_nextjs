export interface Post {
  id: string;
  content: string;
  images: string[];
  userId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  userId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  createdAt: string;
}
