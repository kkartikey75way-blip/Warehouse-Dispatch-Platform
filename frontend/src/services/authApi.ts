import { baseApi } from "./baseApi";
import type { User } from "../store/reducers/authReducer";

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role: string;
    zone: string;
}

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials
            })
        }),
        register: builder.mutation<User, RegisterRequest>({
            query: (userData) => ({
                url: "/auth/register",
                method: "POST",
                body: userData
            })
        }),
        refresh: builder.mutation<{ newAccess: string; newRefresh: string; user: User }, string>({
            query: (token) => ({
                url: "/auth/refresh",
                method: "POST",
                body: { refreshToken: token }
            })
        }),
        verifyEmail: builder.mutation<{ success: boolean; message: string }, string>({
            query: (token) => ({
                url: `/auth/verify-email?token=${token}`,
                method: "GET"
            })
        })
    })
});

export const { useLoginMutation, useRegisterMutation, useRefreshMutation, useVerifyEmailMutation } = authApi;
