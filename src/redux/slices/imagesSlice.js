import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { imageAPI } from '../../services/api'

// Async thunks
export const fetchImages = createAsyncThunk(
    'images/fetchImages',
    async ({ albumId, tags }, { rejectWithValue }) => {
        try {
            const response = await imageAPI.getImages(albumId, tags)
            return response.data.images
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch images')
        }
    }
)

export const uploadImage = createAsyncThunk(
    'images/uploadImage',
    async ({ albumId, formData }, { rejectWithValue }) => {
        try {
            const response = await imageAPI.uploadImage(albumId, formData)
            return response.data.image
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to upload image')
        }
    }
)

export const toggleFavorite = createAsyncThunk(
    'images/toggleFavorite',
    async ({ albumId, imageId, isFavorite }, { rejectWithValue }) => {
        try {
            const response = await imageAPI.toggleFavorite(albumId, imageId, isFavorite)
            return { imageId, isFavorite: response.data.isFavorite }
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update favorite')
        }
    }
)

export const addComment = createAsyncThunk(
    'images/addComment',
    async ({ albumId, imageId, comment }, { rejectWithValue }) => {
        try {
            const response = await imageAPI.addComment(albumId, imageId, comment)
            return { imageId, comments: response.data.comments }
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to add comment')
        }
    }
)

export const deleteImage = createAsyncThunk(
    'images/deleteImage',
    async ({ albumId, imageId }, { rejectWithValue }) => {
        try {
            await imageAPI.deleteImage(albumId, imageId)
            return imageId
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete image')
        }
    }
)

// Images slice
const imagesSlice = createSlice({
    name: 'images',
    initialState: {
        images: [],
        loading: false,
        uploading: false,
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearImages: (state) => {
            state.images = []
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Images
            .addCase(fetchImages.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchImages.fulfilled, (state, action) => {
                state.images = action.payload
                state.loading = false
                state.error = null
            })
            .addCase(fetchImages.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Upload Image
            .addCase(uploadImage.pending, (state) => {
                state.uploading = true
                state.error = null
            })
            .addCase(uploadImage.fulfilled, (state, action) => {
                state.images.unshift(action.payload)
                state.uploading = false
                state.error = null
            })
            .addCase(uploadImage.rejected, (state, action) => {
                state.uploading = false
                state.error = action.payload
            })
            // Toggle Favorite
            .addCase(toggleFavorite.fulfilled, (state, action) => {
                const index = state.images.findIndex(img => img.imageId === action.payload.imageId)
                if (index !== -1) {
                    state.images[index].isFavorite = action.payload.isFavorite
                }
            })
            .addCase(toggleFavorite.rejected, (state, action) => {
                state.error = action.payload
            })
            // Add Comment
            .addCase(addComment.fulfilled, (state, action) => {
                const index = state.images.findIndex(img => img.imageId === action.payload.imageId)
                if (index !== -1) {
                    state.images[index].comments = action.payload.comments
                }
            })
            .addCase(addComment.rejected, (state, action) => {
                state.error = action.payload
            })
            // Delete Image
            .addCase(deleteImage.fulfilled, (state, action) => {
                state.images = state.images.filter(img => img.imageId !== action.payload)
            })
            .addCase(deleteImage.rejected, (state, action) => {
                state.error = action.payload
            })
    }
})

export const { clearError, clearImages } = imagesSlice.actions
export default imagesSlice.reducer