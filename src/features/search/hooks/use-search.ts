"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { searchKeys } from "@/services/search/search.key";
import { searchPosts, searchUsers } from "@/services/search/search-api";
import type { SearchTab } from "@/shared/types/search";

const SEARCH_DEBOUNCE_MS = 800;
const DEFAULT_TAB: SearchTab = "posts";

export function useSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q")?.trim() ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [tab, setTab] = useState<SearchTab>(DEFAULT_TAB);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
    setDebouncedQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [query]);

  useEffect(() => {
    const currentQuery = searchParams.get("q")?.trim() ?? "";
    if (currentQuery === debouncedQuery) return;

    const params = new URLSearchParams(searchParams.toString());

    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [debouncedQuery, pathname, router, searchParams]);

  const usersQuery = useInfiniteQuery({
    queryKey: searchKeys.users(debouncedQuery),
    queryFn: ({ pageParam }) => searchUsers(debouncedQuery, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage?.data?.hasMore ? (lastPageParam as number) + 1 : undefined,
    enabled: debouncedQuery.length > 0,
  });

  const postsQuery = useInfiniteQuery({
    queryKey: searchKeys.posts(debouncedQuery),
    queryFn: ({ pageParam }) => searchPosts(debouncedQuery, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage?.data?.hasMore ? (lastPageParam as number) + 1 : undefined,
    enabled: debouncedQuery.length > 0,
  });

  const users =
    debouncedQuery.length > 0
      ? (usersQuery.data?.pages.flatMap((page) => page?.data?.items ?? []) ?? [])
      : null;

  const posts =
    debouncedQuery.length > 0
      ? (postsQuery.data?.pages.flatMap((page) => page?.data?.items ?? []) ?? [])
      : null;

  const searchAction = usersQuery.isFetching || postsQuery.isFetching;

  return {
    query,
    setQuery,
    debouncedQuery,
    tab,
    setTab,
    users,
    posts,
    searchAction,
    hasMoreUsers: Boolean(usersQuery.hasNextPage),
    hasMorePosts: Boolean(postsQuery.hasNextPage),
    fetchUsers: () => usersQuery.fetchNextPage(),
    fetchPosts: () => postsQuery.fetchNextPage(),
    isUsersPending: usersQuery.isPending,
    isPostsPending: postsQuery.isPending,
  };
}
