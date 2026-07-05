"use client";
import { CheckCheck, EllipsisVertical, PawPrint } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  getNotificationWithPagination,
  markReadNotification,
} from "@/shared/api/notifications/notification-api";
import {
  Bell,
  CloseCollapseIcon,
  CommentNotiIcon,
  HeartNotiIcon,
  TrashCanIcon,
  XMarkIcon,
} from "@/shared/components/atoms/icon/icon";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { regexInMessage, regexInSetting } from "@/shared/config/regex";
import { type Notification, useNotificationStore } from "@/shared/stores/notification-store";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { popupExpandNoti3DotStore, popupNotificationtStore } from "@/shared/stores/popup-store";
import { dateTimeToNotiTime } from "@/shared/utils/convert-date-time";

interface NotificationWithMeta extends Notification {
  createdAt: string;
  textTime: string;
  labelType: number;
}

interface NotiProps {
  notification: Notification;
}

const Noti = ({ notification }: NotiProps) => {
  const router = useRouter();
  const { idNotiShowing, setIdNotiShowing } = popupExpandNoti3DotStore();
  const setVisible = popupNotificationtStore((state) => state.setIsVisible);

  const { deleteNotification, updateNotification, unreadCount, setUnreadCount } =
    useNotificationStore();

  const open = () => setIdNotiShowing(notification.id);
  const close = () => setIdNotiShowing(null);

  const deleteNoti = () => {
    deleteNotification(notification.id);
    close();
  };

  const markAsRead = async () => {
    setUnreadCount(notification.read ? unreadCount + 1 : unreadCount - 1);
    updateNotification(notification.id, { read: !notification.read });
    close();
    markReadNotification(notification.id);
  };

  const notiClicked = () => {
    close();
    if (!notification.read) markAsRead();
    setVisible(false);
    router.push(`${notification.deeplink}`);
  };

  const notiMap: Record<string, { icon: React.ReactNode; content: React.ReactNode }> = {
    LIKE: {
      icon: <HeartNotiIcon className="size-5" />,
      content: <span className="fs-sm">đã thả tim bài viết của bạn</span>,
    },
    likeComment: {
      icon: <HeartNotiIcon className="size-5" />,
      content: <span className="fs-sm">đã thả tim bình luận của bạn</span>,
    },
    COMMENT: {
      icon: <CommentNotiIcon className="size-5" />,
      content: <span className="fs-sm">đã bình luận về bài viết của bạn</span>,
    },
    FOLLOW: {
      icon: <PawPrint className="fill-logo size-5 stroke-logo" />,
      content: <span className="fs-sm">đã bắt đầu theo dõi bạn</span>,
    },
  };
  const notificationType = typeof notification.type === "string" ? notification.type : "";
  const notificationTitle = typeof notification.title === "string" ? notification.title : "i";
  const notificationEmail = Array.isArray(notification.email)
    ? notification.email.join(", ")
    : typeof notification.email === "string"
      ? notification.email
      : "";
  const notificationIcon = notiMap[notificationType]?.icon ?? null;

  return (
    <div
      className={`
        relative overflow-hidden ps-4 py-2 rounded-md flex justify-between
        ${idNotiShowing === notification.id ? "" : "hover:bg-gray-3light active:bg-gray-2light"}
        transition`}
    >
      {/* direct đến thông báo */}
      <Button type="button" className="flex items-center gap-2" onClick={notiClicked}>
        <div className={`relative ${notification.read && "opacity-60"}`}>
          <div className="size-12 rounded-full overflow-hidden">
            <Avatar className="size-full">
              <AvatarFallback className="fs-sm transition" />
            </Avatar>
          </div>
          <div className="absolute size-fit -top-1 -left-0.5">{notificationIcon}</div>
        </div>

        <div>
          <p className={`fs-sm text-left ${notification.read && "opacity-60"}`}>
            <span className="font-semibold me-1" />
            {notificationTitle}
          </p>
          <div className="flex items-center gap-2">
            <span className={`fs-xs ${notification.read && "opacity-60"}`}>
              {notificationEmail}
            </span>
            {!notification.read && <span className="size-2 bg-primary-gradient rounded-full" />}
          </div>
        </div>
      </Button>

      <Button type="button" className="px-4" onClick={open}>
        <EllipsisVertical className="size-5" />
      </Button>

      <div
        className={`flex absolute top-0 h-full left-full bg-secondary ${
          idNotiShowing === notification.id && "-translate-x-full"
        } transition`}
      >
        <Button
          type="button"
          variant="ghost"
          className="btn-secondary !rounded-none px-3 border-r"
          onClick={deleteNoti}
          tabIndex={idNotiShowing === notification.id ? 0 : -1}
        >
          <TrashCanIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="btn-secondary !rounded-none px-3 border-r"
          onClick={markAsRead}
          tabIndex={idNotiShowing === notification.id ? 0 : -1}
        >
          <CheckCheck />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="btn-secondary !rounded-none px-3.5"
          tabIndex={idNotiShowing === notification.id ? 0 : -1}
          onClick={close}
        >
          <XMarkIcon className="size-5" />
        </Button>
      </div>
    </div>
  );
};

export default function NotificationPanel() {
  const pathname = usePathname();
  const isNotificationSlide = regexInMessage.test(pathname) || regexInSetting.test(pathname);

  const user = ownerAccountStore((state) => state.user);

  const { notifications, appendNotifications, unreadCount } = useNotificationStore();

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const old = !notifications
    ? []
    : notifications.filter((noti) => (noti.labelType as unknown as number) === 2);

  const { isVisible, setIsVisible } = popupNotificationtStore();

  const handleGetNotification = async () => {
    // if (!user.id) return;
    // const resp = (await getNotificationWithPagination({
    //   userId: user.userId,
    //   channelId: "INBOX",
    //   page: 0,
    //   limit: 10,
    // })) as any;
    // if (!resp || resp.statusCode !== 200) return;
    // const data = resp.data;
    // setUnreadCount(resp.data.unreadCount ?? 0);
    // const processData = (Array.isArray(data) ? data : []).map((noti: any) => {
    //   const { textTime, labelType } = dateTimeToNotiTime(noti.createdAt);
    //   return { ...noti, textTime, labelType };
    // });
    // setNotifications(processData);
    // setPage(0);
    // setHasMore(processData.length === 10);
  };

  const handleLoadMoreNotifications = async () => {
    if (isLoading || !hasMore || !user.id) return;
    setIsLoading(true);
    const nextPage = page + 1;
    const resp = (await getNotificationWithPagination({
      userId: user.id,
      channelId: "INBOX",
      page: nextPage,
      limit: 10,
    })) as { statusCode?: number; data?: Notification[] | null } | null;

    if (resp?.statusCode !== 200) {
      setIsLoading(false);
      return;
    }

    const data = resp.data;
    const processData: NotificationWithMeta[] = (Array.isArray(data) ? data : [])
      .filter(
        (noti): noti is Notification & { createdAt: string } => typeof noti?.createdAt === "string",
      )
      .map((noti) => {
        const { textTime, labelType } = dateTimeToNotiTime(noti.createdAt);
        return { ...noti, textTime, labelType };
      });

    if (processData.length > 0) {
      appendNotifications(processData);
      setPage(nextPage);
      setHasMore(processData.length === 10);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const scrolledToBottom = scrollHeight - scrollTop - clientHeight < 100;
    if (scrolledToBottom && hasMore && !isLoading) {
      handleLoadMoreNotifications();
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: initial notification bootstrap should only rerun when logged-in user changes
  useEffect(() => {
    if (!user.id) return;
    handleGetNotification();
  }, [user.id]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: listener must stay stable per mounted container; internal guards use latest state via re-rendered handler
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  const closeNotificationPanel = () => setIsVisible(false);

  const handleScrimKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      closeNotificationPanel();
    }
  };

  const stopPanelClickPropagation = (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation();

  const handlePanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: backdrop wraps interactive children (buttons/links), so it cannot itself be a <Button>
    <div
      className={`
        z-0 bg-black h-screen overflow-hidden flex-shrink-0
        lg:border-l-[1px] lg:block ${
          !isNotificationSlide
            ? `
          lg:relative lg:left-auto lg:min-w-fit lg:max-w-fit lg:visible
          md:left-[260px] md:w-[calc(100%-260px)]
          sm:left-[210px] sm:w-[calc(100%-210px)]`
            : `
          lg:left-[260px] lg:w-[calc(100%-260px)]
          sm:left-[76px] sm:w-[calc(100%-76px)]
          `
        }
        left-0 fixed top-0 w-full bg-opacity-0
        ${isVisible ? "sm:bg-opacity-25" : "invisible sm:bg-opacity-0"}
        transition
      `}
      onClick={closeNotificationPanel}
      onKeyDown={handleScrimKeyDown}
      role="button"
      tabIndex={0}
    >
      <div
        className={`
          h-full relative bg-background
          ${!isNotificationSlide ? "lg:translate-x-0 lg:drop-shadow-none" : ""}
          lg:translate-y-0
          md:w-[360px]
          sm:w-[340px] sm:pb-0
          w-full pb-14
          ${
            isVisible
              ? "drop-shadow-[1px_0px_1px_var(--drop-shadow)]"
              : "sm:-translate-x-full sm:translate-y-0 translate-y-full"
          }
          transition`}
      >
        <CloseCollapseIcon
          className={`absolute left-full top-1/2 -translate-x-[1px] -translate-y-1/2 cursor-pointer  ${
            !isNotificationSlide ? "lg:hidden" : ""
          } sm:block hidden
            ${isVisible ? "" : "-translate-x-full"}
            will-change-transform`}
        />
        {/* biome-ignore lint/a11y/useSemanticElements: panel wraps interactive children (buttons/links), so it cannot itself be a <Button> */}
        <div
          className={`
            h-full flex flex-col
            md:space-y-4
            sm:pt-6 sm:pb-1 sm:ps-4
            pt-16 space-y-2`}
          onClick={stopPanelClickPropagation}
          onKeyDown={handlePanelKeyDown}
          role="button"
          tabIndex={0}
        >
          <div className="px-4 flex items-center gap-5">
            <div className="relative">
              <Bell active={true} />
              <span className="absolute bottom-1/2 left-1/2 px-1 bg-primary font-bold rounded-full text-txtWhite text-[12px]">
                {unreadCount}
              </span>
            </div>
            <h5>Thông báo</h5>
          </div>

          <div
            ref={scrollContainerRef}
            className={`flex-grow overflow-y-auto sm:pe-4 ${
              !isNotificationSlide ? "" : "scrollable-div"
            }`}
          >
            {notifications?.length === 0 && <p className="p-4">Bạn chưa có thông báo nào</p>}

            {old.length > 0 && (
              <div className="sm:space-y-0 space-y-1">
                <h6 className="px-4">Trước đó</h6>
                {old.map((noti) => (
                  <Noti key={noti.id} notification={noti as unknown as Notification} />
                ))}
              </div>
            )}

            {isLoading && (
              <div className="px-4 py-4 text-center">
                <p className="fs-sm opacity-60">Đang tải...</p>
              </div>
            )}

            {!hasMore && notifications && notifications.length > 0 && (
              <div className="px-4 py-4 text-center">
                <p className="fs-sm opacity-60">Đã hết thông báo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
