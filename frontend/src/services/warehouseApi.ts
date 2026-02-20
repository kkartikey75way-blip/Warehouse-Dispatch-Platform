import { baseApi } from "./baseApi";
import type { Conflict } from "../types";

export interface Warehouse {
    _id: string;
    name: string;
    code: string;
    capacity: number;
    currentLoad: number;
    location: string;
    status: 'online' | 'offline' | 'warning';
    lastHeartbeat?: string;
}

export interface InventoryItem {
    _id: string;
    sku: string;
    onHand: number;
    reserved: number;
    updatedAt: string;
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
        }),
        createWarehouse: builder.mutation<Warehouse, Partial<Warehouse>>({
            query: (body) => ({
                url: "/warehouses",
                method: "POST",
                body
            }),
            invalidatesTags: ["Warehouse"]
        }),
        deleteWarehouse: builder.mutation<void, string>({
            query: (id) => ({
                url: `/warehouses/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: ["Warehouse"]
        }),
        getWarehouseInventory: builder.query<InventoryItem[], string>({
            query: (code) => `/warehouses/${code}/inventory`,
            transformResponse: (response: { success: boolean; data: InventoryItem[] }) => response.data,
            providesTags: ["Warehouse"]
        })
    })
});

export const {
    useGetWarehousesQuery,
    useGetReturnRoutingQuery,
    useGetConflictsQuery,
    useReconcileConflictMutation,
    useCreateWarehouseMutation,
    useDeleteWarehouseMutation,
    useGetWarehouseInventoryQuery
} = warehouseApi;
