"use client";
import { Bell } from "@/shared/components/atoms/icon/icons/bell";
import { DotBage } from "@/shared/components/molecules/dot-bage";
import { NotificationSkeleton } from "@/shared/components/skeletons/notification-skeleton";
import { Virtuoso } from "react-virtuoso";
import { useNotifications, useUnreadNotification } from "../../hooks/use-notification";
import { NotificationsItem } from "../molecules/notification-item";

export default function NotificationPanel() {

  const { data, isLoading } = useUnreadNotification()
  const { data: notifications, isLoading: isLoadingFetchNotification, fetchNextPage, isFetching, hasNextPage }
    = useNotifications()

  const notificationItems = notifications?.pages.flatMap(
    page => page?.data?.items ?? []
  )

  return (
    <div className="hidden md:flex flex-col h-full px-4 bg-background">
      <div>
        <div className="p-4 flex items-center gap-5 lg:min-w-86 ">
          <div className="relative">
            <Bell active={true} />
            <DotBage count={Number(data?.data)} />
          </div>
          <h5>Thông báo</h5>
        </div>
      </div>
      {isLoadingFetchNotification ? (
        <div className="flex-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      ) : (
        <Virtuoso
          className="flex-1"
          data={notificationItems}
          endReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          itemContent={
            (_, notification) => (<NotificationsItem key={notification.id} notification={notification}
            />)}
          components={{
            Footer: () => (isFetching && hasNextPage ? <NotificationSkeleton /> : null),
          }}
        />
      )}
    </div>
  );
}
