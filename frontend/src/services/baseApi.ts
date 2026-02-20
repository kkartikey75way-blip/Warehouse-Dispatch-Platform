import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store/store";
import { logout, setCredentials } from "../store/reducers/authReducer";
import type { User } from "../store/reducers/authReducer";
import toast from "react-hot-toast";

const baseQuery = fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.accessToken;
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    }
});

const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {

        const refreshResult = await baseQuery(
            {
                url: "/auth/refresh",
                method: "POST",
                body: { refreshToken: localStorage.getItem("refreshToken") }
            },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            const data = refreshResult.data as { newAccess: string; newRefresh: string; user: User };

            api.dispatch(setCredentials({ user: data.user, token: data.newAccess }));
            localStorage.setItem("refreshToken", data.newRefresh);

            result = await baseQuery(args, api, extraOptions);
        } else {
            api.dispatch(logout());
        }
    }

    if (result.error && result.error.status !== 401) {
        let errorMessage = "An unexpected error occurred";

        if ("data" in result.error && result.error.data && typeof result.error.data === "object") {
            const errorData = result.error.data as { message?: string; error?: string };
            errorMessage = errorData.message || errorData.error || errorMessage;
        } else if ("error" in result.error && result.error.error) {
            errorMessage = result.error.error;
        }

        toast.error(errorMessage);
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({}),
    tagTypes: ["Shipment", "Driver", "Dispatch", "Notification", "Analytics", "Schedule", "Warehouse"],
    keepUnusedDataFor: 0,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true
});
