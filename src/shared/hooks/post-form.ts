import { CreatePost } from "../types/post";

export const createPostFormData = (createPost: CreatePost) => {
  const formData = new FormData();
  if (createPost.userId) {
    formData.append("userId", createPost.userId);
  }
  formData.append("text", createPost.text);
  formData.append("html", createPost.html);
  createPost.media.forEach((file) => {
    formData.append("media", file);
  });
  return formData;
}