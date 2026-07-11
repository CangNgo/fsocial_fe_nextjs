"use client";
import { Bell } from "@/shared/components/atoms/icon/icons/bell";
import { regexInMessage, regexInSetting } from "@/shared/config/regex";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { usePathname } from "next/navigation";
import { Virtuoso } from "react-virtuoso";
import { fetchNotifications, fetchUnreadNotification } from "../../hooks/use-notification";
import { NotificationsItem } from "../molecules/notification-item";

export default function NotificationPanel() {
  const pathname = usePathname();
  const isNotificationSlide = regexInMessage.test(pathname) || regexInSetting.test(pathname);

  const user = ownerAccountStore((state) => state.user);
  const { data, isLoading } = fetchUnreadNotification()
  const { data: notifications, isLoading: isLoadingFetchNotification, fetchNextPage, isFetching, hasNextPage }
    = fetchNotifications()

  const notificationItems = notifications?.pages.flatMap(
    page => page?.data?.items ?? []
  )

  return (
    <div className="hidden md:block px-4">
      <div>
        <div className="p-4 flex items-center gap-5 lg:min-w-86 ">
          <div className="relative">
            <Bell active={true} />
            <div className="flex absolute bottom-1/2 left-1/2 justify-stretch w-fit px-1.5 rounded-2xl bg-primary">
              <span className="font-bold text-txtWhite text-[12px]">
                {isLoading ? 0 : data?.data}
              </span>
            </div>
          </div>
          <h5>Thông báo</h5>
        </div>
      </div>
      <Virtuoso
        height={"100%"}
        data={notificationItems}
        itemContent={
          (_, notification) => (<NotificationsItem key={notification.id} notification={notification} />)}
      />
    </div>
  );
}
