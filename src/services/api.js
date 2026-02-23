import axios from 'axios'
import { getToken } from '../utils/token'

const API_BASE_URL = `${import.meta.env.VITE_SERVER_BASE_URL}`

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

api.interceptors.request.use(
    (config) => {
        const token = getToken()
        if(token){
            config.headers.Authorization = `Bearer ${token}`
        }
        config.withCredentials = true
        return config
    }
)


// Auth APIs
export const authAPI = {
    getProfile: () => api.get('/user/profile'),
    verifyToken: () => api.get('/auth/verify'),
    logout: () => api.post('/auth/logout'),
    loginWithGoogle: () => {
        window.location.href = `${API_BASE_URL}/auth/google`
    }
}

// Album APIs
export const albumAPI = {
    createAlbum: (data) => api.post('/albums', data),
    getAllAlbums: () => api.get('/albums'),
    getAlbum: (albumId) => api.get(`/albums/${albumId}`),
    updateAlbum: (albumId, data) => api.post(`/albums/${albumId}`, data),
    shareAlbum: (albumId, emails) => api.post(`/albums/${albumId}/share`, { emails }),
    deleteAlbum: (albumId) => api.delete(`/albums/${albumId}`)
}

// Image APIs
export const imageAPI = {
    uploadImage: (albumId, formData) => {
        return api.post(`/images/${albumId}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
    getImages: (albumId, tags = null) => {
        const url = tags ? `/images/${albumId}/images?tags=${tags}` : `/albums/${albumId}/images`
        return api.get(url)
    },
    getFavoriteImages: (albumId) => api.get(`/images/${albumId}/images/favorites`),
    toggleFavorite: (albumId, imageId, isFavorite) => 
        api.put(`/images/${albumId}/images/${imageId}/favorite`, { isFavorite }),
    addComment: (albumId, imageId, comment) => 
        api.post(`/images/${albumId}/images/${imageId}/comments`, { comment }),
    deleteImage: (albumId, imageId) => api.delete(`/images/${albumId}/images/${imageId}`),
    // Images now come with cloudinaryUrl from the API response - no need for separate file endpoint
    getImageUrl: (image) => image.cloudinaryUrl
}

export default api
