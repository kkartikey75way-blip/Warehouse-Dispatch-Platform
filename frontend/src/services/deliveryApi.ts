import { baseApi } from "./baseApi";

export interface Delivery {
    _id: string;
    shipmentId: string;
    driverId: string;
    status: string;
    proof?: {
        signatureUrl: string;
        photoUrl: string;
    };
    exception?: string;
    createdAt: string;
}

export const deliveryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        startDelivery: builder.mutation<Delivery, { shipmentId: string; driverId: string }>({
            query: ({ shipmentId, driverId }) => ({
                url: `/delivery/${shipmentId}/start`,
                method: "POST",
                body: { driverId }
            }),
            invalidatesTags: ["Dispatch", "Shipment", "Analytics", "Driver"]
        }),
        completeDelivery: builder.mutation<Delivery, { shipmentId: string; signatureUrl: string; photoUrl: string }>({
            query: ({ shipmentId, ...body }) => ({
                url: `/delivery/${shipmentId}/complete`,
                method: "PATCH",
                body
            }),
            invalidatesTags: ["Dispatch", "Shipment", "Analytics", "Driver"]
        }),
        reportException: builder.mutation<Delivery, { shipmentId: string; exception: string }>({
            query: ({ shipmentId, ...body }) => ({
                url: `/delivery/${shipmentId}/report-exception`,
                method: "PATCH",
                body
            }),
            invalidatesTags: ["Dispatch", "Shipment", "Analytics", "Driver"]
        })
    })
});

export const {
    useStartDeliveryMutation,
    useCompleteDeliveryMutation,
    useReportExceptionMutation
} = deliveryApi;
