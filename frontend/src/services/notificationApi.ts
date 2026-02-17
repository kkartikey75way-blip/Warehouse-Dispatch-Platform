import { baseApi } from "./baseApi";

export interface Notification {
    _id: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
}

export const notificationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<Notification[], void>({
            query: () => "/notifications",
            transformResponse: (response: { success: boolean; data: Notification[] }) => response.data,
            providesTags: ["Notification"]
        }),
        markNotificationRead: builder.mutation<Notification, string>({
            query: (id) => ({
                url: `/notifications/${id}/read`,
                method: "PATCH"
            }),
            transformResponse: (response: { success: boolean; data: Notification }) => response.data,
            invalidatesTags: ["Notification"]
        }),
        getUnreadCount: builder.query<number, void>({
            query: () => "/notifications/unread-count",
            transformResponse: (response: { success: boolean; data: { count: number } }) => response.data.count,
            providesTags: ["Notification"]
        }),
        markAllAsRead: builder.mutation<void, void>({
            query: () => ({
                url: "/notifications/mark-all-read",
                method: "PATCH"
            }),
            invalidatesTags: ["Notification"]
        })
    })
});

export const { useGetNotificationsQuery, useMarkNotificationReadMutation, useGetUnreadCountQuery, useMarkAllAsReadMutation } = notificationApi;
