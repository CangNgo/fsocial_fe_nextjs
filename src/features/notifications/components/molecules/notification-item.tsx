import { UserAvatar } from "@/shared/components/molecules/user-avatar";
import { cn } from "@/shared/lib/utils";
import { popupExpandNoti3DotStore, popupNotificationtStore } from "@/shared/stores/popup-store";
import { Notification, NotificationType } from "@/shared/types/notification";
import { timeAgo } from "@/shared/utils/convert-date-time";
import {
  AtSign,
  Bell,
  Heart,
  LogIn,
  MessageCircle,
  MessageCircleMore,
  Reply,
  UserRoundPlus
} from "lucide-react";
import Link from "next/link";

interface NotificationsItemProps {
  notification: Notification;
}

export const NotificationsItem = ({ notification }: NotificationsItemProps) => {
  const { idNotiShowing, setIdNotiShowing } = popupExpandNoti3DotStore();
  const setVisible = popupNotificationtStore((state) => state.setIsVisible);

  const open = () => setIdNotiShowing(notification.id);
  const close = () => setIdNotiShowing(null);

  const notiClicked = () => {
    close();
    // if (!notification.isRead) markAsRead();
    setVisible(false);
    // router.push(`${notification.deeplink}`);
  };

  function generateIconWithNotiType(type: NotificationType) {
    const getIconAndColor = () => {
      switch (type) {
        case NotificationType.LIKE_SINGLE:
        case NotificationType.LIKE_MULTI:
          return { Icon: Heart, bg: "bg-red-500" };
        case NotificationType.COMMENT_SINGLE:
        case NotificationType.COMMENT_MULTI:
          return { Icon: MessageCircle, bg: "bg-green-500" };
        case NotificationType.COMMENT_REPLY:
          return { Icon: Reply, bg: "bg-green-500" };
        case NotificationType.FOLLOW:
          return { Icon: UserRoundPlus, bg: "bg-blue-600" };
        case NotificationType.MENTION:
          return { Icon: AtSign, bg: "bg-purple-600" };
        case NotificationType.MESSAGE:
          return { Icon: MessageCircleMore, bg: "bg-blue-500" };
        case NotificationType.LOGIN:
          return { Icon: LogIn, bg: "bg-blue-600" };
        case NotificationType.SYSTEM:
        default:
          return { Icon: Bell, bg: "bg-gray-500" };
      }
    };

    const { Icon, bg } = getIconAndColor();

    return (
      <div
        className={cn(
          "flex absolute -bottom-0.5 -right-0.5 justify-stretch w-fit p-1 rounded-2xl",
          bg
        )}
      >
        <Icon width={16} height={16} className="text-white" />
      </div>
    );
  }

  return (
    <div
      className={`
        relative overflow-hidden ps-4 py-2 rounded-2xl flex justify-between
        ${idNotiShowing === notification.id ? "" : "hover:bg-gray-3light active:bg-gray-2light"}
        transition border border-outline-10 cursor-pointer mb-1`}
    >
      <div className={`flex items-center gap-2 ${notification.isRead && "opacity-60"}`} onClick={notiClicked}>
        <div className={`relative min-h-10`}>
          <Link href={`/profile?id=${notification.id}`}>
            <UserAvatar
              src={notification.actor.avatarUrl}
              displayName={notification.actor.displayName}
              className={cn("size-12")}
            />
          </Link>
          <div>
            {generateIconWithNotiType(notification.type)}
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-sm line-clamp-2">{notification.body}</p>
          <span className="text-xs text-muted-foreground">{timeAgo(notification.createdAt)}</span>
        </div>
      </div>
      <div
        className={`flex absolute top-0 h-full left-full bg-secondary ${idNotiShowing === notification.id && "-translate-x-full"
          } transition`}
      >
      </div>
    </div>
  );
};
