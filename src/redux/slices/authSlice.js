import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../services/api.js'

// Async thunks
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const verifyResponse = await authAPI.verifyToken()
            if (verifyResponse.data.valid) {
                const profileResponse = await authAPI.getProfile()
                return profileResponse.data.user
            }
            return rejectWithValue('Token invalid')
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Authentication failed')
        }
    }
)

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authAPI.logout()
            return null
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Logout failed')
        }
    }
)

// Auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isAuthenticated: false,
        loading: true,
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        setUser: (state, action) => {
            state.user = action.payload
            state.isAuthenticated = !!action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            // Check Auth
            .addCase(checkAuth.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.user = action.payload
                state.isAuthenticated = true
                state.loading = false
                state.error = null
            })
            .addCase(checkAuth.rejected, (state, action) => {
                state.user = null
                state.isAuthenticated = false
                state.loading = false
                state.error = action.payload
            })
            // Logout
            .addCase(logout.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null
                state.isAuthenticated = false
                state.loading = false
                state.error = null
            })
            .addCase(logout.rejected, (state, action) => {
                state.user = null
                state.isAuthenticated = false
                state.loading = false
                state.error = action.payload
            })
    }
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer