import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import albumsReducer from './slices/albumsSlice'
import imagesReducer from './slices/imagesSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        albums: albumsReducer,
        images: imagesReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['images/uploadImage/fulfilled'],
            },
        }),
})

export default store