import { baseApi } from "./baseApi";

export interface Schedule {
    id: string;
    name: string;
    type: 'dispatch_manifest' | 'delivery_report';
    format: 'CSV' | 'PDF';
    cronExpression: string;
    timezone: string;
    recipientEmails: string[];
    createdAt?: string;
    lastRunAt?: string;
    nextRunAt?: string;
    isActive: boolean;
}

export const schedulerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSchedules: builder.query<Schedule[], void>({
            query: () => "/reports/schedules",
            transformResponse: (response: { success: boolean; data: Schedule[] }) => response.data,
            providesTags: ["Schedule"]
        }),
        createSchedule: builder.mutation<Schedule, Partial<Schedule>>({
            query: (body) => ({
                url: "/reports/schedules",
                method: "POST",
                body
            }),
            invalidatesTags: ["Schedule"]
        }),
        deleteSchedule: builder.mutation<void, string>({
            query: (id) => ({
                url: `/reports/schedules/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: ["Schedule"]
        }),
        runReportNow: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/reports/schedules/${id}/run`,
                method: "POST"
            }),
            invalidatesTags: ["Schedule"]
        })
    })
});

export const {
    useGetSchedulesQuery,
    useCreateScheduleMutation,
    useDeleteScheduleMutation,
    useRunReportNowMutation
} = schedulerApi;
