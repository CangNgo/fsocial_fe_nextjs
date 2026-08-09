import { getNotifications, getUnreadNotification } from "@/services/notifications/notification-api";
import { notificationKeys } from "@/services/notifications/notification.key";
import { getCookie } from "@/shared/utils/cookie";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useNotifications(lastItem?: string) {
  return useInfiniteQuery({
    queryKey: notificationKeys.all,
    queryFn: () => getNotifications({ cursor: lastItem }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage?.data?.hasMore ? lastPage.data.nextCursor : undefined,
  })
}

export function useUnreadNotification() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setHasToken(!!getCookie("access-token")));
  }, []);

  return useQuery({
    queryKey: notificationKeys.unRead,
    queryFn: getUnreadNotification,
    enabled: hasToken,
  })
}