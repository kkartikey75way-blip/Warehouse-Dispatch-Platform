import { baseApi } from "./baseApi";
import type { Conflict } from "../types";

export interface Warehouse {
    _id: string;
    name: string;
    code: string;
    capacity: number;
    currentLoad: number;
    location: {
        latitude: number;
        longitude: number;
    };
    status: 'online' | 'offline' | 'warning';
    lastHeartbeat?: string;
}

export const warehouseApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getWarehouses: builder.query<Warehouse[], void>({
            query: () => "/warehouses",
            transformResponse: (response: { success: boolean; data: Warehouse[] }) => response.data,
            providesTags: ["Warehouse"]
        }),
        getReturnRouting: builder.query<Warehouse, { sku: string; quantity: number }>({
            query: ({ sku, quantity }) => `/warehouses/return-routing?sku=${sku}&quantity=${quantity}`,
            transformResponse: (response: { success: boolean; data: Warehouse }) => response.data
        }),
        getConflicts: builder.query<Conflict[], void>({
            query: () => "/warehouses/conflicts",
            transformResponse: (response: { success: boolean; data: Conflict[] }) => response.data,
            providesTags: ["Warehouse"]
        }),
        reconcileConflict: builder.mutation<void, { conflictId: string; resolution: string }>({
            query: (body) => ({
                url: "/warehouses/conflicts/reconcile",
                method: "POST",
                body
            }),
            invalidatesTags: ["Warehouse"]
        })
    })
});

export const {
    useGetWarehousesQuery,
    useGetReturnRoutingQuery,
    useGetConflictsQuery,
    useReconcileConflictMutation
} = warehouseApi;
