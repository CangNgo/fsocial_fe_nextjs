"use client";
import { SearchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { LoadingIcon } from "@/components/atoms/Icon/Icon";
import { Input } from "@/components/atoms/input";
import { Skeleton } from "@/components/atoms/skeleton";
import { searchPosts, searchUsers } from "@/lib/api/user/searchApi";

const messageNotFoundPost = "Không tìm thấy bài viết phù hợp";
const messageNotFoundUser = "Không tìm thấy người dùng phù hợp";

interface UserResult {
  userId: string;
  avatar?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  followers?: number;
}

interface PostResult {
  id: string;
  content?: string;
  [key: string]: unknown;
}

export function SearchFeature() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "users" | "posts">("all");
  const [users, setUsers] = useState<UserResult[] | null>(null);
  const [posts, setPosts] = useState<PostResult[] | null>(null);
  const [_isEndPosts, setIsEndPosts] = useState(false);

  const [isFetching, setIsFetching] = useState(false);
  const [searchAction, setSearchAction] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSendKeyword = async () => {
    if (!query.trim()) {
      setUsers(null);
      setPosts(null);
      return;
    }
    setSearchAction(true);
    try {
      const [respUsers, respPosts] = await Promise.all([
        searchUsers(query) as Promise<any>,
        searchPosts(query) as Promise<any>,
      ]);
      setUsers(respUsers?.data ?? []);
      setPosts(respPosts?.data ?? []);
    } catch (error) {
      console.log("Lỗi tìm kiếm: ", error);
    } finally {
      setSearchAction(false);
    }
  };

  console.log("users: ", users);

  const _fetchMorePosts = async (q: string) => {
    if (isFetching) return;
    setIsFetching(true);
    const resp = (await searchPosts(q)) as any;
    setIsFetching(false);
    if (!resp || resp.statusCode !== 200) return;
    if (!posts) {
      setPosts(resp.data);
    } else {
      if (posts.length !== 0 && resp.data.length === 0) {
        setIsEndPosts(true);
        return;
      }
      setPosts((prev) => [...(prev ?? []), ...resp.data]);
    }
  };

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      handleSendKeyword();
    }, 800);
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [handleSendKeyword]);

  return (
    <div
      className="min-h-[100dvh] flex-grow bg-background overflow-auto scrollable-div
           sm:pt-5 pt-2 transition"
    >
      <div className="mx-auto md:space-y-5 space-y-4 lg:max-w-[540px]">
        {/* search input */}
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
            onChange={(e) => setQuery(e.target.value)}
          />
          {searchAction && <LoadingIcon stroke="stroke-gray" />}
        </label>

        {/* tabs */}
        <div className="mx-3 xl:mx-0 flex gap-6">
          {(["all", "users", "posts"] as const).map((t) => (
            <Button
              type="button"
              key={t}
              className={`py-2 w-full rounded-t-sm border-b hover:border-primary hover:text-primary active:bg-gray-3light ${
                tab === t ? "border-primary text-primary" : "border-transparent text-gray"
              } transition`}
              onClick={() => setTab(t)}
            >
              {t === "all" ? "Tất cả" : t === "users" ? "Mọi người" : "Bài viết"}
            </Button>
          ))}
        </div>

        {/* users section */}
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
                <Button
                  type="button"
                  variant="ghost"
                  className="btn-ghost max-w-fit px-4 py-1 rounded"
                >
                  Theo dõi
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* posts section */}
        {(tab === "all" || tab === "posts") && (
          <div className="sm:space-y-3 space-y-2">
            <h5 className="font-medium lg:px-0 px-3">Bài viết liên quan</h5>

            {posts?.map((post) => (
              <div key={post.id} className="sm:rounded shadow-y my-2 md:my-4 p-4 border">
                <p>{post.content as string}</p>
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
