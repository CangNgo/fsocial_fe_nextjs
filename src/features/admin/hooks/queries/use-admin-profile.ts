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
    queryFn: () => getAdminProfile(),
    enabled: Boolean(userId),
    select: (resp) => (resp?.statusCode === 200 ? resp.data : null),
  });

  useEffect(() => {
    if (query.data) {
      setUser({
        firstName: query.data.firstName ?? "",
        lastName: query.data.lastName ?? "",
        dob: query.data.dob ?? "",
        gender: query.data.gender ?? 3,
        username: query.data.username ?? "",
        email: query.data.email ?? "",
        avatar: query.data.avatar ?? "",
        address: query.data.address ?? "",
      });
    }
  }, [query.data, setUser]);

  return query;
}
