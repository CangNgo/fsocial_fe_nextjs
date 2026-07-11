import {
  AtSign,
  Bell,
  Heart,
  LogIn,
  MessageCircle,
  MessageSquare,
  MonitorSmartphone,
  Reply,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { NotificationType } from "@/shared/types/notification";

export const NOTIFICATION_ICONS: Record<NotificationType, LucideIcon> = {
  [NotificationType.LIKE_SINGLE]: Heart,
  [NotificationType.LIKE_MULTI]: Heart,
  [NotificationType.COMMENT_SINGLE]: MessageCircle,
  [NotificationType.COMMENT_MULTI]: MessageCircle,
  [NotificationType.COMMENT_REPLY]: Reply,
  [NotificationType.FOLLOW]: UserPlus,
  [NotificationType.MENTION]: AtSign,
  [NotificationType.MESSAGE]: MessageSquare,
  [NotificationType.SYSTEM]: Bell,
  [NotificationType.LOGIN]: LogIn,
  [NotificationType.LOGIN_NEW_DEVICE]: MonitorSmartphone,
};

export const getNotificationIcon = (type: NotificationType): LucideIcon =>
  NOTIFICATION_ICONS[type] ?? Bell;
