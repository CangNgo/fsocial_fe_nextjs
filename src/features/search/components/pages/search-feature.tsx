"use client";
import { SearchIcon } from "lucide-react";
import { LoadingIcon } from "@/shared/components/atoms/icon/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSearch } from "../../hooks/use-search";
import type { SearchTab } from "../../types/search";
import { messageNotFoundPost, messageNotFoundUser } from "../../utils/search-messages";

const searchTabs: SearchTab[] = ["all", "users", "posts"];

export default function SearchFeature() {
  const { query, setQuery, tab, setTab, users, posts, searchAction } = useSearch();

  return (
    <div
      className="min-h-[100dvh] flex-grow bg-background overflow-auto scrollable-div
           sm:pt-5 pt-2 transition"
    >
      <div className="mx-auto md:space-y-5 space-y-4 lg:max-w-[540px]">
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
            <Button
              type="button"
              key={item}
              className={`py-2 w-full rounded-t-sm border-b hover:border-primary hover:text-primary active:bg-gray-3light ${
                tab === item ? "border-primary text-primary" : "border-transparent text-gray"
              } transition`}
              onClick={() => setTab(item)}
            >
              {item === "all" ? "Tất cả" : item === "users" ? "Mọi người" : "Bài viết"}
            </Button>
          ))}
        </div>

        {(tab === "all" || tab === "users") && (
          <div className="mx-3 xl:mx-0">
            <h5 className="font-medium">Người dùng</h5>

            {!users &&
              [0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="py-2 flex items-center gap-3">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="space-y-1 flex-grow">
                    <Skeleton className="w-32 h-4 rounded-sm" />
                    <Skeleton className="w-24 h-4 rounded-sm" />
                  </div>
                </div>
              ))}

            {users?.length === 0 && <p className="text-center text-gray">{messageNotFoundUser}</p>}

            {users?.map((user) => (
              <div
                key={user.userId}
                className="flex items-center justify-between border-b py-3 transition"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="size-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.displayName}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.displayName}</p>
                    {(user.followers ?? 0) > 0 && (
                      <p className="fs-xs text-gray">{user.followers} người theo dõi</p>
                    )}
                  </div>
                </div>
                <Button type="button" variant="ghost" className="btn-ghost max-w-fit px-4 py-1 rounded">
                  Theo dõi
                </Button>
              </div>
            ))}
          </div>
        )}

        {(tab === "all" || tab === "posts") && (
          <div className="sm:space-y-3 space-y-2">
            <h5 className="font-medium lg:px-0 px-3">Bài viết liên quan</h5>

            {posts?.map((post) => (
              <div key={post.id} className="sm:rounded shadow-y my-2 md:my-4 p-4 border">
                <p>{post.content}</p>
              </div>
            ))}

            {posts?.length === 0 && (
              <p className="my-4 text-center text-gray">{messageNotFoundPost}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
