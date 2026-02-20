import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { albumAPI } from '../services/api'
import { updateAlbum, shareAlbum, setCurrentAlbum } from '../redux/slices/albumsSlice'
import { fetchImages, uploadImage, toggleFavorite, addComment, deleteImage, clearImages } from '../redux/slices/imagesSlice'
import { 
    FaArrowLeft, FaUpload, FaStar, FaRegStar, FaComment, 
    FaTrash, FaShare, FaEdit 
} from 'react-icons/fa'
import '../css/AlbumDetail.css'

const AlbumDetail = () => {
    const { albumId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const { user } = useSelector((state) => state.auth)
    const { currentAlbum } = useSelector((state) => state.albums)
    const { images, loading, uploading } = useSelector((state) => state.images)
    
    const [selectedImage, setSelectedImage] = useState(null)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [shareEmails, setShareEmails] = useState('')
    const [newDescription, setNewDescription] = useState('')
    const [filter, setFilter] = useState('all')
    
    const [uploadData, setUploadData] = useState({
        file: null,
        tags: '',
        person: '',
        isFavorite: false
    })

    useEffect(() => {
        fetchAlbumDetails()
        dispatch(fetchImages({ albumId }))
        
        return () => {
            dispatch(clearImages())
        }
    }, [albumId, dispatch])

    const fetchAlbumDetails = async () => {
        try {
            const response = await albumAPI.getAlbum(albumId)
            dispatch(setCurrentAlbum(response.data.album))
            setNewDescription(response.data.album.description)
        } catch (error) {
            console.error('Error fetching album:', error)
            alert('Failed to load album')
            navigate('/albums')
        }
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file')
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB')
                return
            }
            setUploadData({ ...uploadData, file })
        }
    }

    const handleUploadImage = async (e) => {
        e.preventDefault()
        if (!uploadData.file) return

        const formData = new FormData()
        formData.append('file', uploadData.file)
        formData.append('tags', JSON.stringify(uploadData.tags.split(',').map(t => t.trim()).filter(Boolean)))
        formData.append('person', uploadData.person)
        formData.append('isFavorite', uploadData.isFavorite)

        try {
            await dispatch(uploadImage({ albumId, formData })).unwrap()
            setUploadData({ file: null, tags: '', person: '', isFavorite: false })
            setShowUploadModal(false)
            window.location.reload()
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Failed to upload image')
        }
    }

    const handleToggleFavorite = async (imageId, currentStatus) => {
        try {
            await dispatch(toggleFavorite({ 
                albumId, 
                imageId, 
                isFavorite: !currentStatus 
            })).unwrap()
            
            if (selectedImage?.imageId === imageId) {
                setSelectedImage({ ...selectedImage, isFavorite: !currentStatus })
            }
        } catch (error) {
            console.error('Error toggling favorite:', error)
        }
    }

    const handleAddComment = async (imageId, comment) => {
        if (!comment.trim()) return

        try {
            const result = await dispatch(addComment({ albumId, imageId, comment })).unwrap()
            if (selectedImage?.imageId === imageId) {
                setSelectedImage({ ...selectedImage, comments: result.comments })
            }
        } catch (error) {
            console.error('Error adding comment:', error)
        }
    }

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return

        try {
            await dispatch(deleteImage({ albumId, imageId })).unwrap()
            setSelectedImage(null)
        } catch (error) {
            console.error('Error deleting image:', error)
            alert('Failed to delete image')
        }
    }

    const handleShareAlbum = async (e) => {
        e.preventDefault()
        const emails = shareEmails.split(',').map(e => e.trim()).filter(Boolean)
        
        if (emails.length === 0) {
            alert('Please enter at least one email')
            return
        }

        try {
            await dispatch(shareAlbum({ albumId, emails })).unwrap()
            setShareEmails('')
            setShowShareModal(false)
            fetchAlbumDetails()
            alert('Album shared successfully!')
        } catch (error) {
            console.error('Error sharing album:', error)
            alert('Failed to share album')
        }
    }

    const handleUpdateDescription = async (e) => {
        e.preventDefault()
        try {
            await dispatch(updateAlbum({ albumId, data: { description: newDescription } })).unwrap()
            setShowEditModal(false)
        } catch (error) {
            console.error('Error updating album:', error)
            alert('Failed to update album')
        }
    }

    const filteredImages = filter === 'favorites' 
        ? images.filter(img => img.isFavorite)
        : images

    if (loading && images.length === 0) {
        return <div className="loading">Loading album...</div>
    }

    if (!currentAlbum) {
        return <div className="loading">Album not found</div>
    }

    const isOwner = currentAlbum.ownerId === user?.userId

    return (
        <div className="album-detail-container">
            <header className="album-header">
                <button className="back-btn" onClick={() => navigate('/albums')}>
                    <FaArrowLeft /> Back to Albums
                </button>
                <div className="album-info">
                    <h1>{currentAlbum.name}</h1>
                    <p>{currentAlbum.description || 'No description'}</p>
                    {currentAlbum.sharedWith && currentAlbum.sharedWith.length > 0 && (
                        <div className="shared-info">
                            Shared with: {currentAlbum.sharedWith.join(', ')}
                        </div>
                    )}
                </div>
                <div className="album-actions">
                    {isOwner && (
                        <>
                            <button onClick={() => setShowEditModal(true)}>
                                <FaEdit /> Edit
                            </button>
                            <button onClick={() => setShowShareModal(true)}>
                                <FaShare /> Share
                            </button>
                        </>
                    )}
                    <button onClick={() => setShowUploadModal(true)} className="upload-btn">
                        <FaUpload /> {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                </div>
            </header>

            <div className="filter-bar">
                <button 
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    All Images ({images.length})
                </button>
                <button 
                    className={filter === 'favorites' ? 'active' : ''}
                    onClick={() => setFilter('favorites')}
                >
                    <FaStar /> Favorites ({images.filter(img => img.isFavorite).length})
                </button>
            </div>

            {filteredImages.length === 0 ? (
                <div className="empty-state">
                    <p>No images {filter === 'favorites' ? 'in favorites' : 'yet'}</p>
                    {filter === 'all' && (
                        <button onClick={() => setShowUploadModal(true)}>
                            Upload Your First Image
                        </button>
                    )}
                </div>
            ) : (
                <div className="images-grid">
                    {filteredImages.map(image => (
                        <div 
                            key={image.imageId} 
                            className="image-card"
                            onClick={() => setSelectedImage(image)}
                        >
                            <img 
                                src={image.cloudinaryUrl} 
                                alt={image.name}
                            />
                            <div className="image-overlay">
                                <button
                                    className="favorite-btn"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleToggleFavorite(image.imageId, image.isFavorite)
                                    }}
                                >
                                    {image.isFavorite ? <FaStar /> : <FaRegStar />}
                                </button>
                                <div className="image-info">
                                    <span>{image.name}</span>
                                    {image.comments.length > 0 && (
                                        <span><FaComment /> {image.comments.length}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Upload Image</h2>
                        <form onSubmit={handleUploadImage}>
                            <div className="form-group">
                                <label>Select Image *</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    required
                                />
                                {uploadData.file && (
                                    <p className="file-name">{uploadData.file.name}</p>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    value={uploadData.tags}
                                    onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                                    placeholder="e.g., beach, sunset, vacation"
                                />
                            </div>
                            <div className="form-group">
                                <label>Person Name</label>
                                <input
                                    type="text"
                                    value={uploadData.person}
                                    onChange={(e) => setUploadData({ ...uploadData, person: e.target.value })}
                                    placeholder="Who's in this photo?"
                                />
                            </div>
                            <div className="form-group checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={uploadData.isFavorite}
                                        onChange={(e) => setUploadData({ ...uploadData, isFavorite: e.target.checked })}
                                    />
                                    Mark as favorite
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowUploadModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary" disabled={uploading}>
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Share Album</h2>
                        <form onSubmit={handleShareAlbum}>
                            <div className="form-group">
                                <label>Email Addresses (comma-separated)</label>
                                <textarea
                                    value={shareEmails}
                                    onChange={(e) => setShareEmails(e.target.value)}
                                    placeholder="email1@example.com, email2@example.com"
                                    rows="3"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowShareModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary">
                                    Share
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Description Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Edit Album Description</h2>
                        <form onSubmit={handleUpdateDescription}>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Enter album description"
                                    rows="4"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Image Detail Modal */}
            {selectedImage && (
                <ImageDetailModal
                    image={selectedImage}
                    albumId={albumId}
                    onClose={() => setSelectedImage(null)}
                    onToggleFavorite={handleToggleFavorite}
                    onAddComment={handleAddComment}
                    onDelete={handleDeleteImage}
                    isOwner={isOwner}
                />
            )}
        </div>
    )
}

const ImageDetailModal = ({ image, albumId, onClose, onToggleFavorite, onAddComment, onDelete, isOwner }) => {
    const [comment, setComment] = useState('')

    const handleSubmitComment = (e) => {
        e.preventDefault()
        onAddComment(image.imageId, comment)
        setComment('')
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="image-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                
                <div className="image-detail-content">
                    <div className="image-section">
                        <img 
                            src={image.cloudinaryUrl} 
                            alt={image.name} 
                        />
                    </div>
                    
                    <div className="details-section">
                        <div className="image-header">
                            <h3>{image.name}</h3>
                            <div className="image-actions">
                                <button 
                                    onClick={() => onToggleFavorite(image.imageId, image.isFavorite)}
                                    className={image.isFavorite ? 'active' : ''}
                                >
                                    {image.isFavorite ? <FaStar /> : <FaRegStar />}
                                </button>
                                {isOwner && (
                                    <button 
                                        onClick={() => {
                                            onDelete(image.imageId)
                                            onClose()
                                        }}
                                        className="delete"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        </div>

                        {image.person && (
                            <div className="image-meta">
                                <strong>Person:</strong> {image.person}
                            </div>
                        )}

                        {image.tags && image.tags.length > 0 && (
                            <div className="image-tags">
                                {image.tags.map((tag, idx) => (
                                    <span key={idx} className="tag">{tag}</span>
                                ))}
                            </div>
                        )}

                        <div className="image-meta">
                            <strong>Size:</strong> {(image.size / 1024).toFixed(2)} KB
                        </div>

                        <div className="image-meta">
                            <strong>Uploaded:</strong> {new Date(image.uploadedAt).toLocaleDateString()}
                        </div>

                        <div className="comments-section">
                            <h4>Comments</h4>
                            <div className="comments-list">
                                {image.comments && image.comments.length > 0 ? (
                                    image.comments.map((c, idx) => (
                                        <div key={idx} className="comment">
                                            <strong>{c.userEmail}:</strong>
                                            <p>{c.comment}</p>
                                            <span className="comment-date">
                                                {new Date(c.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-comments">No comments yet</p>
                                )}
                            </div>

                            <form onSubmit={handleSubmitComment} className="comment-form">
                                <input
                                    type="text"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add a comment..."
                                />
                                <button type="submit">Post</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AlbumDetail