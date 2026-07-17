import { CreatePost } from "../types/post";

export const createPostFormData = (createPost: CreatePost) => {
  const formData = new FormData();
  if (createPost.userId) {
    formData.append("userId", createPost.userId);
  }
  formData.append("text", createPost.text);
  formData.append("HTMLText", createPost.htmltext);
  createPost.media.forEach((file) => {
    formData.append("media", file);
  });
  return formData;
}