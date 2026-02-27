import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider, useDispatch, useSelector } from 'react-redux'
import store from './redux/store'
import { checkAuth } from './redux/slices/authSlice'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Albums from './pages/Albums'
import AlbumDetail from './pages/AlbumDetail'
// import './App.css'

function AppRoutes() {
    const dispatch = useDispatch()
    const { isAuthenticated, loading } = useSelector((state) => state.auth)

    useEffect(() => {
        // Check authentication on app load
        dispatch(checkAuth())
    }, [dispatch])

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.2em'
            }}>
                Loading...
            </div>
        )
    } else {

    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            
            <Route 
                path="/albums" 
                element={
                    <ProtectedRoute>
                        <Albums />
                    </ProtectedRoute>
                } 
            />
            
            <Route 
                path="/albums/:albumId" 
                element={
                    <ProtectedRoute>
                        <AlbumDetail />
                    </ProtectedRoute>
                } 
            />
            
            {/* Root path - redirect based on auth status */}
            <Route 
                path="/" 
                element={
                    isAuthenticated ? (
                        <Navigate to="/albums" replace />
                    ) : (
                        <Navigate to="/" replace />
                    )
                } 
            />
            
            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    ) }
}

function App() {
    return (
        <Provider store={store}>
            <Router>
                <AppRoutes />
            </Router>
        </Provider>
    )
}

export default App