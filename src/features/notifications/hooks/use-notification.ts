import { getNotifications, getUnreadNotification } from "@/services/notifications/notification-api";
import { notificationKeys } from "@/services/notifications/notification.key";
import { getCookie } from "@/shared/utils/cookie";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function fetchNotifications(lastItem?: string) {
  return useInfiniteQuery({
    queryKey: notificationKeys.all,
    queryFn: () => getNotifications({ cursor: lastItem }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage?.data?.hasMore ? lastPage.data.nextCursor : undefined,
  })
}

export function fetchUnreadNotification() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!getCookie("access-token"));
  }, []);

  return useQuery({
    queryKey: notificationKeys.unRead,
    queryFn: getUnreadNotification,
    enabled: hasToken,
  })
}