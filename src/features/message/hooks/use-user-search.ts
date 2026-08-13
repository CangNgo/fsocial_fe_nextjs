"use client";

import { searchUsers } from "@/services/search/search-api";
import { searchKeys } from "@/services/search/search.key";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const SEARCH_DEBOUNCE_MS = 500;

export function useUserSearch() {
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedKeyword(keyword.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [keyword]);

  const query = useQuery({
    queryKey: searchKeys.users(debouncedKeyword),
    queryFn: () => searchUsers(debouncedKeyword),
    enabled: debouncedKeyword.length > 0,
    select: (resp) => (resp?.statusCode === 200 ? (resp.data?.items ?? []) : []),
  });

  return {
    keyword,
    setKeyword,
    users: debouncedKeyword.length > 0 ? (query.data ?? []) : undefined,
    isSearching: query.isFetching,
  };
}
