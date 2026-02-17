import { baseApi } from "./baseApi";
import type { Shipment } from "../types";

export const shipmentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getShipments: builder.query<Shipment[], void>({
            query: () => "/shipments",
            transformResponse: (response: { success: boolean; data: Shipment[] }) => response.data,
            providesTags: ["Shipment"]
        }),
        getShipmentById: builder.query<Shipment, string>({
            query: (id) => `/shipments/${id}`,
            transformResponse: (response: { success: boolean; data: Shipment }) => response.data,
            providesTags: ["Shipment"]
        }),
        createShipment: builder.mutation<Shipment, Partial<Shipment>>({
            query: (body) => ({
                url: "/shipments",
                method: "POST",
                body
            }),
            transformResponse: (response: { success: boolean; data: Shipment }) => response.data,
            invalidatesTags: ["Shipment", "Analytics"]
        }),
        updateShipmentStatus: builder.mutation<Shipment, { id: string; status: string }>({
            query: ({ id, status }) => ({
                url: `/shipments/${id}/status`,
                method: "PATCH",
                body: { status }
            }),
            transformResponse: (response: { success: boolean; data: Shipment }) => response.data,
            invalidatesTags: ["Shipment", "Analytics"]
        }),
        acceptShipment: builder.mutation<Shipment, { shipmentId: string; driverId: string }>({
            query: ({ shipmentId, driverId }) => ({
                url: `/shipments/${shipmentId}/accept`,
                method: "PATCH",
                body: { driverId }
            }),
            transformResponse: (response: { success: boolean; data: Shipment }) => response.data,
            invalidatesTags: ["Shipment"]
        })
    })
});

export const {
    useGetShipmentsQuery,
    useGetShipmentByIdQuery,
    useCreateShipmentMutation,
    useUpdateShipmentStatusMutation,
    useAcceptShipmentMutation
} = shipmentApi;
