/**
 * Notification API service.
 * Notifications are stored in the YiAi `notifications` collection via the data service RPC.
 */
import { callService } from "@/api/modules/dataService";
import { queryDocuments, updateDocument, deleteDocument, countDocuments } from "@/api/modules/dataService";
import type { Notification, NotificationType } from "@/stores/modules/notification";

const COLLECTION = "notifications";
const NOTIFICATION_SERVICE = "services.notification.notification_service";

export interface NotificationQueryParams {
  page?: number;
  size?: number;
  type?: NotificationType | "all";
  read?: boolean;
  search?: string;
}

export function getNotifications(params: NotificationQueryParams = {}) {
  const { page = 1, size = 20, type, read, search } = params;
  const filter: Record<string, any> = {};
  if (type && type !== "all") filter.type = type;
  if (read !== undefined) filter.read = read;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
    ];
  }
  return queryDocuments<Notification>({
    cname: COLLECTION,
    filter,
    pageNum: page,
    pageSize: size,
    orderBy: "createdAt",
    orderType: "desc",
  });
}

export function markAsRead(notificationId: string) {
  return updateDocument(COLLECTION, notificationId, { read: true });
}

export function markAllAsRead() {
  return callService(NOTIFICATION_SERVICE, "mark_all_as_read", {});
}

export function deleteNotification(notificationId: string) {
  return deleteDocument(COLLECTION, notificationId);
}

export function getUnreadCount() {
  return countDocuments(COLLECTION, { read: false });
}

export function getPreferences() {
  return callService(NOTIFICATION_SERVICE, "get_preferences", {});
}

export function savePreferences(preferences: Record<string, unknown>) {
  return callService(NOTIFICATION_SERVICE, "save_preferences", { preferences });
}