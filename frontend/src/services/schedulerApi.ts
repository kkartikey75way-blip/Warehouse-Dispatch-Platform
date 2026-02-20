import { baseApi } from "./baseApi";

export interface Schedule {
    _id: string;
    name: string;
    type: 'DISPATCH_MANIFEST' | 'DELIVERY_REPORT';
    format: 'CSV' | 'PDF';
    cron: string;
    recipients: string[];
    lastRun?: string;
    nextRun?: string;
    active: boolean;
}

export const schedulerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSchedules: builder.query<Schedule[], void>({
            query: () => "/scheduler/schedules",
            transformResponse: (response: { success: boolean; data: Schedule[] }) => response.data,
            providesTags: ["Schedule"]
        }),
        createSchedule: builder.mutation<Schedule, Partial<Schedule>>({
            query: (body) => ({
                url: "/scheduler/schedules",
                method: "POST",
                body
            }),
            invalidatesTags: ["Schedule"]
        }),
        deleteSchedule: builder.mutation<void, string>({
            query: (id) => ({
                url: `/scheduler/schedules/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: ["Schedule"]
        }),
        runReportNow: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/scheduler/schedules/${id}/run`,
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
