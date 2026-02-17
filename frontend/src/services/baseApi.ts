import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store/store";
import { logout, setCredentials } from "../store/reducers/authReducer";
import type { User } from "../store/reducers/authReducer";

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
    return result;
};

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({}),
    tagTypes: ["Shipment", "Driver", "Dispatch", "Notification", "Analytics"],
    keepUnusedDataFor: 0, 
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true
});
