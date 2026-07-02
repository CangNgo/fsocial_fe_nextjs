import type { PostsResponse, TimelinePost } from "@/shared/types/post";

export const normalizePost = (post: TimelinePost): TimelinePost => ({
  ...post,
  content: {
    ...post.content,
    htmltext: post.content?.htmltext ?? post.content?.html,
  },
});

export const getUniquePosts = (
  existingPosts: TimelinePost[] | null,
  incomingPosts: TimelinePost[],
) => {
  const existingIds = new Set(existingPosts?.map((post) => post.id).filter(Boolean) ?? []);
  return incomingPosts.filter((post) => !post.id || !existingIds.has(post.id));
};

export const isPostsResponse = (response: unknown): response is PostsResponse => {
  return typeof response === "object" && response !== null;
};
