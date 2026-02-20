import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAlbums, createAlbum, deleteAlbum } from '../redux/slices/albumsSlice'
import { logout } from '../redux/slices/authSlice'
import { FaPlus, FaFolder, FaShare, FaTrash } from 'react-icons/fa'
import '../css/Albums.css'

const Albums = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const { albums, loading } = useSelector((state) => state.albums)
    
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newAlbum, setNewAlbum] = useState({ name: '', description: '' })

    useEffect(() => {
        dispatch(fetchAlbums())
    }, [dispatch])

    const handleCreateAlbum = async (e) => {
        e.preventDefault()
        if (!newAlbum.name.trim()) return

        try {
            await dispatch(createAlbum(newAlbum)).unwrap()
            setNewAlbum({ name: '', description: '' })
            setShowCreateModal(false)
        } catch (error) {
            console.error('Error creating album:', error)
            alert('Failed to create album')
        }
    }

    const handleDeleteAlbum = async (albumId, albumName) => {
        if (!window.confirm(`Are you sure you want to delete "${albumName}"? This will delete all images in the album.`)) {
            return
        }

        try {
            await dispatch(deleteAlbum(albumId)).unwrap()
        } catch (error) {
            console.error('Error deleting album:', error)
            alert('Failed to delete album')
        }
    }

    const handleLogout = async () => {
        await dispatch(logout())
        navigate('/login')
    }

    if (loading) {
        return <div className="loading">Loading albums...</div>
    }

    return (
        <div className="albums-container">
            <header className="albums-header">
                <div className="header-left">
                    <h1>📷 KaviosPix</h1>
                </div>
                <div className="header-right">
                    {user && (
                        <div className="user-info">
                            {user.picture && <img src={user.picture} alt={user.name} />}
                            <span>{user.name}</span>
                            <button onClick={handleLogout} className="logout-btn">Logout</button>
                        </div>
                    )}
                </div>
            </header>

            <div className="albums-content">
                <div className="albums-actions">
                    <h2>My Albums</h2>
                    <button 
                        className="create-album-btn"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <FaPlus /> Create Album
                    </button>
                </div>

                {albums.length === 0 ? (
                    <div className="empty-state">
                        <FaFolder size={64} />
                        <h3>No albums yet</h3>
                        <p>Create your first album to start organizing your photos</p>
                    </div>
                ) : (
                    <div className="albums-grid">
                        {albums.map(album => (
                            <div 
                                key={album.albumId} 
                                className="album-card"
                            >
                                <div 
                                    className="album-card-content"
                                    onClick={() => navigate(`/albums/${album.albumId}`)}
                                >
                                    <FaFolder className="album-icon" />
                                    <h3>{album.name}</h3>
                                    <p>{album.description || 'No description'}</p>
                                    {album.sharedWith && album.sharedWith.length > 0 && (
                                        <div className="shared-badge">
                                            <FaShare /> Shared with {album.sharedWith.length}
                                        </div>
                                    )}
                                </div>
                                {album.ownerId === user?.userId && (
                                    <div className="album-actions">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteAlbum(album.albumId, album.name)
                                            }}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Create New Album</h2>
                        <form onSubmit={handleCreateAlbum}>
                            <div className="form-group">
                                <label>Album Name *</label>
                                <input
                                    type="text"
                                    value={newAlbum.name}
                                    onChange={(e) => setNewAlbum({ ...newAlbum, name: e.target.value })}
                                    placeholder="Enter album name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={newAlbum.description}
                                    onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
                                    placeholder="Enter album description (optional)"
                                    rows="3"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary">
                                    Create Album
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Albums