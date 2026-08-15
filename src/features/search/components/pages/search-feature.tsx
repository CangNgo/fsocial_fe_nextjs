"use client";

import { PostList } from "@/features/post";
import { LoadingIcon } from "@/shared/components/atoms/icon/icon";
import { UserListSkeleton } from "@/shared/components/skeletons/user-list-skeleton";
import { Input } from "@/shared/components/ui/input";
import { PostResponse } from "@/shared/types/post";
import type { SearchTab } from "@/shared/types/search";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { useSearch } from "../../hooks/use-search";
import { messageNotFoundPost, messageNotFoundUser } from "../../utils/search-messages";
import { UserResultItem } from "../user-result-item";

const searchTabs: Array<{ key: SearchTab; label: string }> = [
  { key: "posts", label: "Bài viết" },
  { key: "users", label: "Mọi người" },
];

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

  const postCards = (posts ?? null) as PostResponse[] | null;
  const showEmptyHint = debouncedQuery.length === 0;

  return (
    <div
      id="search-scroll"
      className="min-h-[100dvh] flex-grow bg-background overflow-auto scrollable-div sm:pt-5 pt-2 transition"
    >
      <div className="mx-auto flex h-full flex-col md:space-y-5 space-y-4 lg:max-w-[540px]">
        <label
          htmlFor="search"
          className="mx-3 xl:mx-0 bg-background flex items-center gap-2 px-3 border rounded-full border-gray-2light hover:drop-shadow hover:border-gray"
        >
          <SearchIcon className="size-5 text-gray flex-shrink-0" />
          <Input
            id="search"
            type="text"
            placeholder="Tìm kiếm..."
            className="h-auto border-0 bg-background p-0 shadow-none focus-visible:ring-0"
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
              className={`py-2 w-full rounded-t-sm border-b hover:border-primary hover:text-primary active:bg-gray-3light ${tab === item.key ? "border-primary text-primary" : "border-transparent text-gray"
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
