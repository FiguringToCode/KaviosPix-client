import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { albumAPI } from '../../services/api'

// Async thunks
export const fetchAlbums = createAsyncThunk(
    'albums/fetchAlbums',
    async (_, { rejectWithValue }) => {
        try {
            const response = await albumAPI.getAllAlbums()
            return response.data.albums
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch albums')
        }
    }
)

export const createAlbum = createAsyncThunk(
    'albums/createAlbum',
    async (albumData, { rejectWithValue }) => {
        try {
            const response = await albumAPI.createAlbum(albumData)
            return response.data.album
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create album')
        }
    }
)

export const updateAlbum = createAsyncThunk(
    'albums/updateAlbum',
    async ({ albumId, data }, { rejectWithValue }) => {
        try {
            const response = await albumAPI.updateAlbum(albumId, data)
            return response.data.album
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update album')
        }
    }
)

export const shareAlbum = createAsyncThunk(
    'albums/shareAlbum',
    async ({ albumId, emails }, { rejectWithValue }) => {
        try {
            const response = await albumAPI.shareAlbum(albumId, emails)
            return { albumId, sharedWith: response.data.sharedWith }
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to share album')
        }
    }
)

export const deleteAlbum = createAsyncThunk(
    'albums/deleteAlbum',
    async (albumId, { rejectWithValue }) => {
        try {
            await albumAPI.deleteAlbum(albumId)
            return albumId
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete album')
        }
    }
)

// Albums slice
const albumsSlice = createSlice({
    name: 'albums',
    initialState: {
        albums: [],
        currentAlbum: null,
        loading: false,
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        setCurrentAlbum: (state, action) => {
            state.currentAlbum = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Albums
            .addCase(fetchAlbums.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAlbums.fulfilled, (state, action) => {
                state.albums = action.payload
                state.loading = false
                state.error = null
            })
            .addCase(fetchAlbums.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Create Album
            .addCase(createAlbum.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createAlbum.fulfilled, (state, action) => {
                state.albums.unshift(action.payload)
                state.loading = false
                state.error = null
            })
            .addCase(createAlbum.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Update Album
            .addCase(updateAlbum.fulfilled, (state, action) => {
                const index = state.albums.findIndex(a => a.albumId === action.payload.albumId)
                if (index !== -1) {
                    state.albums[index] = { ...state.albums[index], ...action.payload }
                }
                if (state.currentAlbum?.albumId === action.payload.albumId) {
                    state.currentAlbum = { ...state.currentAlbum, ...action.payload }
                }
            })
            .addCase(updateAlbum.rejected, (state, action) => {
                state.error = action.payload
            })
            // Share Album
            .addCase(shareAlbum.fulfilled, (state, action) => {
                const index = state.albums.findIndex(a => a.albumId === action.payload.albumId)
                if (index !== -1) {
                    state.albums[index].sharedWith = action.payload.sharedWith
                }
                if (state.currentAlbum?.albumId === action.payload.albumId) {
                    state.currentAlbum.sharedWith = action.payload.sharedWith
                }
            })
            .addCase(shareAlbum.rejected, (state, action) => {
                state.error = action.payload
            })
            // Delete Album
            .addCase(deleteAlbum.fulfilled, (state, action) => {
                state.albums = state.albums.filter(a => a.albumId !== action.payload)
                if (state.currentAlbum?.albumId === action.payload) {
                    state.currentAlbum = null
                }
            })
            .addCase(deleteAlbum.rejected, (state, action) => {
                state.error = action.payload
            })
    }
})

export const { clearError, setCurrentAlbum } = albumsSlice.actions
export default albumsSlice.reducer