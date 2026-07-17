"use client";

import Link from "next/link";
import { Virtuoso } from "react-virtuoso";
import { PostList } from "@/features/post";
import type { PostCardPost } from "@/features/post/hooks/use-post-card-actions";
import { LoadingIcon } from "@/shared/components/atoms/icon/icon";
import { UserAvatar } from "@/shared/components/molecules/user-avatar";
import { ROUTES } from "@/shared/config/routes";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearch } from "../../hooks/use-search";
import type { SearchTab, UserResult } from "@/shared/types/search";
import { messageNotFoundPost, messageNotFoundUser } from "../../utils/search-messages";

const searchTabs: Array<{ key: SearchTab; label: string }> = [
  { key: "posts", label: "Bài viết" },
  { key: "users", label: "Mọi người" },
];

function UserListSkeleton() {
  return [0, 1, 2, 3, 4].map((item) => (
    <div key={item} className="py-3 flex items-center gap-3 border-b">
      <Skeleton className="size-12 rounded-full" />
      <div className="space-y-1 flex-grow">
        <Skeleton className="w-32 h-4 rounded-sm" />
        <Skeleton className="w-24 h-4 rounded-sm" />
      </div>
    </div>
  ));
}

function UserResultItem({ user }: { user: UserResult }) {
  const followerCount = user.follower?.length ?? 0;

  return (
    <Link
      href={ROUTES.PROFILE(user.id)}
      className="flex items-center gap-3 border-b py-3 transition hover:bg-muted/30"
    >
      <UserAvatar src={user.avatar} displayName={user.displayName} className="size-12" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold truncate">{user.displayName ?? user.username}</p>
        {user.username && <p className="text-sm text-gray truncate">@{user.username}</p>}
        {followerCount > 0 && <p className="fs-xs text-gray">{followerCount} người theo dõi</p>}
      </div>
    </Link>
  );
}

export default function SearchFeature() {
  const {
    query,
    setQuery,
    debouncedQuery,
    tab,
    setTab,
    users,
    posts,
    searchAction,
    hasMoreUsers,
    hasMorePosts,
    fetchUsers,
    fetchPosts,
    isUsersPending,
    isPostsPending,
  } = useSearch();
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const element = document.getElementById("search-scroll");
    if (element) {
      queueMicrotask(() => {
        setScrollParent(element);
      });
    }
  }, []);

  const postCards = (posts ?? null) as PostCardPost[] | null;
  const showEmptyHint = debouncedQuery.length === 0;

  return (
    <div
      id="search-scroll"
      className="min-h-[100dvh] flex-grow bg-background overflow-auto scrollable-div sm:pt-5 pt-2 transition"
    >
      <div className="mx-auto flex h-full flex-col md:space-y-5 space-y-4 lg:max-w-[540px]">
        <label
          htmlFor="search"
          className="mx-3 xl:mx-0 bg-background flex items-center gap-2 py-2 px-3 border rounded-full border-gray-2light hover:drop-shadow hover:border-gray"
        >
          <SearchIcon className="size-5 text-gray flex-shrink-0" />
          <Input
            id="search"
            type="text"
            placeholder="Tìm kiếm..."
            className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {searchAction && <LoadingIcon stroke="stroke-gray" />}
        </label>

        <div className="mx-3 xl:mx-0 flex gap-6">
          {searchTabs.map((item) => (
            <button
              type="button"
              key={item.key}
              className={`py-2 w-full rounded-t-sm border-b hover:border-primary hover:text-primary active:bg-gray-3light ${
                tab === item.key ? "border-primary text-primary" : "border-transparent text-gray"
              } transition`}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {showEmptyHint && (
          <p className="px-3 text-center text-gray">Nhập từ khóa để tìm bài viết hoặc người dùng.</p>
        )}

        {!showEmptyHint && tab === "posts" && (
          <div className="flex-1 sm:space-y-3 space-y-2">
            <h5 className="font-medium lg:px-0 px-3">Bài viết liên quan</h5>
            {isPostsPending ? (
              <div className="px-3 xl:px-0">
                <PostList posts={null} cardStyle scrollContainerId="search-scroll" />
              </div>
            ) : postCards?.length ? (
              <div className="px-3 xl:px-0 flex-1">
                <PostList
                  posts={postCards}
                  fetchPosts={fetchPosts}
                  hasMore={hasMorePosts}
                  cardStyle
                  scrollContainerId="search-scroll"
                />
              </div>
            ) : (
              <p className="my-4 text-center text-gray">{messageNotFoundPost}</p>
            )}
          </div>
        )}

        {!showEmptyHint && tab === "users" && (
          <div className="mx-3 xl:mx-0 flex flex-1 flex-col">
            <h5 className="font-medium">Người dùng</h5>
            {isUsersPending ? (
              <UserListSkeleton />
            ) : users?.length ? (
              <Virtuoso
                className="h-full"
                customScrollParent={scrollParent ?? undefined}
                data={users}
                computeItemKey={(_, user) => user.id}
                increaseViewportBy={{ top: 600, bottom: 400 }}
                itemContent={(_, user) => <UserResultItem user={user} />}
                endReached={() => {
                  if (hasMoreUsers) {
                    fetchUsers();
                  }
                }}
                components={{
                  Footer: () =>
                    hasMoreUsers ? (
                      <div className="pt-2">
                        <UserListSkeleton />
                      </div>
                    ) : null,
                }}
              />
            ) : (
              <p className="text-center text-gray">{messageNotFoundUser}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
