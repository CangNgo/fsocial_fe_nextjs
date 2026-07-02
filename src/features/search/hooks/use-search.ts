"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchPosts, searchUsers } from "../api/search-api";
import type { PostResult, SearchResponse, SearchTab, UserResult } from "../types/search";

const SEARCH_DEBOUNCE_MS = 800;

export function useSearch() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SearchTab>("all");
  const [users, setUsers] = useState<UserResult[] | null>(null);
  const [posts, setPosts] = useState<PostResult[] | null>(null);
  const [searchAction, setSearchAction] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSendKeyword = useCallback(async () => {
    if (!query.trim()) {
      setUsers(null);
      setPosts(null);
      return;
    }

    setSearchAction(true);
    try {
      const [respUsers, respPosts] = await Promise.all([
        searchUsers(query) as Promise<SearchResponse<UserResult> | null>,
        searchPosts(query) as Promise<SearchResponse<PostResult> | null>,
      ]);
      setUsers(respUsers?.data ?? []);
      setPosts(respPosts?.data ?? []);
    } catch (error) {
      console.log("Lỗi tìm kiếm: ", error);
    } finally {
      setSearchAction(false);
    }
  }, [query]);

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      handleSendKeyword();
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [handleSendKeyword]);

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
