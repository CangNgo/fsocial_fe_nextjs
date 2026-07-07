"use client";

import { useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import { adminKeys } from "@/services/admin/admin.key";
import { getAdminProfile } from "@/services/admin/admin-profile-api";
import { adminStore } from "@/shared/stores/admin-store";
import { getCookie } from "@/shared/utils/cookie";

export function useAdminProfile() {
  const setUser = adminStore((state) => state.setUser);

  const token = getCookie("access-token");
  let userId: string | undefined;
  if (token) {
    try {
      userId = jwtDecode<{ sub: string }>(token).sub;
    } catch {
      userId = undefined;
    }
  }

  const query = useQuery({
    queryKey: [...adminKeys.users, "me", userId],
    queryFn: () => getAdminProfile(userId as string),
    enabled: Boolean(userId),
    select: (resp) => (resp?.statusCode === 200 ? resp.data : null),
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data as Parameters<typeof setUser>[0]);
    }
  }, [query.data, setUser]);
}
