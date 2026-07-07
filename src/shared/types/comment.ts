export interface Comment {
  id: string;
  commentId?: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  content: CommentContent;
  createDatetime: string;
  countLikes: number;
  like?: boolean;
  reply?: boolean;
  displayName?: string;
}

export interface CommentContent {
  text?: string;
  media?: string;
  html?: string;
}

export interface CommentReply {
  id: string;
  reply: Comment[];
}
