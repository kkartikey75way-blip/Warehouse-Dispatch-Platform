import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "WAREHOUSE_MANAGER" | "DISPATCHER" | "DRIVER" | "ADMIN";

export interface User {
    id: string;
    _id?: string;
    email: string;
    role: UserRole;
    name?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
}


const loadAuthState = (): AuthState => {
    try {
        const serializedState = localStorage.getItem("authState");
        if (serializedState === null) {
            return {
                user: null,
                accessToken: null,
                isAuthenticated: false
            };
        }
        return JSON.parse(serializedState);
    } catch {
        return {
            user: null,
            accessToken: null,
            isAuthenticated: false
        };
    }
};


const saveAuthState = (state: AuthState) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem("authState", serializedState);
    } catch {
        // Silently ignore storage errors
    }
};

const initialState: AuthState = loadAuthState();

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.token;
            state.isAuthenticated = true;
            saveAuthState(state);
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            localStorage.removeItem("authState");
            localStorage.removeItem("refreshToken");
        }
    }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
