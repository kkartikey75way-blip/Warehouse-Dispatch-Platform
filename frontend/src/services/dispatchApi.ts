import { baseApi } from "./baseApi";
import type { Dispatch } from "../types";

export const dispatchApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDispatches: builder.query<Dispatch[], void>({
            query: () => "/dispatch",
            providesTags: ["Dispatch"]
        }),
        autoAssignDispatch: builder.mutation<{ success: boolean; message: string }, void>({
            query: () => ({
                url: "/dispatch/auto-assign",
                method: "POST"
            }),
            invalidatesTags: ["Dispatch", "Shipment", "Analytics", "Driver"]
        }),
        assignDispatch: builder.mutation<Dispatch, { shipmentId: string; driverId: string }>({
            query: (body) => ({
                url: "/dispatch",
                method: "POST",
                body
            }),
            invalidatesTags: ["Dispatch", "Shipment", "Analytics", "Driver"]
        }),
        groupShipments: builder.mutation<{ success: boolean; message: string; batchId: string }, { shipmentIds: string[] }>({
            query: (body) => ({
                url: "/dispatch/batch",
                method: "POST",
                body
            }),
            invalidatesTags: ["Shipment"]
        }),
        assignBatch: builder.mutation<{ success: boolean; message: string }, { batchId: string; driverId: string }>({
            query: (body) => ({
                url: "/dispatch/assign-batch",
                method: "POST",
                body
            }),
            invalidatesTags: ["Dispatch", "Shipment", "Driver"]
        })
    })
});

export const {
    useGetDispatchesQuery,
    useAutoAssignDispatchMutation,
    useAssignDispatchMutation,
    useGroupShipmentsMutation,
    useAssignBatchMutation
} = dispatchApi;
