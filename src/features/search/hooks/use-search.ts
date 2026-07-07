"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { searchKeys } from "@/services/search/search.key";
import { searchPosts, searchUsers } from "@/services/search/search-api";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import type { SearchTab } from "@/shared/types/search";

const SEARCH_DEBOUNCE_MS = 800;

export function useSearch() {
  const userId = ownerAccountStore((state) => state.user.id);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [tab, setTab] = useState<SearchTab>("all");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [query]);

  const usersQuery = useQuery({
    queryKey: searchKeys.users(debouncedQuery),
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.length > 0,
    select: (resp) => (resp?.statusCode === 200 ? (resp.data ?? []) : []),
  });

  const postsQuery = useQuery({
    queryKey: searchKeys.posts(debouncedQuery),
    queryFn: () => searchPosts(debouncedQuery, userId ?? ""),
    enabled: debouncedQuery.length > 0 && Boolean(userId),
    select: (resp) => (resp?.statusCode === 200 ? (resp.data ?? []) : []),
  });

  const users = debouncedQuery.length > 0 ? (usersQuery.data ?? null) : null;
  const posts = debouncedQuery.length > 0 ? (postsQuery.data ?? null) : null;
  const searchAction = usersQuery.isFetching || postsQuery.isFetching;

  return {
    query,
    setQuery,
    tab,
    setTab,
    users,
    posts,
    searchAction,
  };
}
