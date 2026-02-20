import { baseApi } from "./baseApi";

export interface POD {
    podId: string;
    shipmentId: string;
    deliveredAt: string;
    gps: {
        latitude: number;
        longitude: number;
        accuracy?: number;
    };
    hasSignature: boolean;
    hasPhoto: boolean;
    recipientName?: string;
    disputeStatus: string;
    disputeWorkflow: Array<{
        action: string;
        performedBy: string;
        performedAt: string;
        notes?: string;
    }>;
}

export const proofOfDeliveryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPOD: builder.query<POD, string>({
            query: (shipmentId) => `/pod/${shipmentId}`,
            transformResponse: (response: { success: boolean; data: POD }) => response.data,
            providesTags: (_result, _error, id) => [{ type: "Shipment", id }, "Analytics"]
        }),
        raiseDispute: builder.mutation<POD, { shipmentId: string; reason: string }>({
            query: ({ shipmentId, reason }) => ({
                url: `/pod/${shipmentId}/dispute`,
                method: "POST",
                body: { reason }
            }),
            transformResponse: (response: { success: boolean; data: POD }) => response.data,
            invalidatesTags: (_result, _error, { shipmentId }) => [{ type: "Shipment", id: shipmentId }, "Analytics"]
        }),
        advanceDispute: builder.mutation<POD, { shipmentId: string; action: string; resolution?: string; notes?: string }>({
            query: ({ shipmentId, ...body }) => ({
                url: `/pod/${shipmentId}/dispute/advance`,
                method: "PATCH",
                body
            }),
            transformResponse: (response: { success: boolean; data: POD }) => response.data,
            invalidatesTags: (_result, _error, { shipmentId }) => [{ type: "Shipment", id: shipmentId }, "Analytics"]
        })
    })
});

export const {
    useGetPODQuery,
    useRaiseDisputeMutation,
    useAdvanceDisputeMutation
} = proofOfDeliveryApi;
