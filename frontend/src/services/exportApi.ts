import { baseApi } from "./baseApi";

export const exportApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        exportDispatchManifest: builder.mutation<Blob, void>({
            query: () => ({
                url: "/export/dispatch-manifest",
                method: "GET",
                responseHandler: (response) => response.blob(),
            }),
        }),
        exportDeliveryReport: builder.mutation<Blob, void>({
            query: () => ({
                url: "/export/delivery-report",
                method: "GET",
                responseHandler: (response) => response.blob(),
            }),
        }),
        exportDispatchManifestPDF: builder.mutation<Blob, void>({
            query: () => ({
                url: "/export/dispatch-manifest-pdf",
                method: "GET",
                responseHandler: (response) => response.blob(),
            }),
        }),
        exportDeliveryReportPDF: builder.mutation<Blob, void>({
            query: () => ({
                url: "/export/delivery-report-pdf",
                method: "GET",
                responseHandler: (response) => response.blob(),
            }),
        }),
    }),
});

export const {
    useExportDispatchManifestMutation,
    useExportDeliveryReportMutation,
    useExportDispatchManifestPDFMutation,
    useExportDeliveryReportPDFMutation,
} = exportApi;
