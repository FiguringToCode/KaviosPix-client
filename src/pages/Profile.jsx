import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth } from '../redux/slices/authSlice'

const Profile = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { loading, user } = useSelector((state) => state.auth)

    useEffect(() => {
        const initialize = () => {
            dispatch(checkAuth())
            navigate('/albums', { replace: true })
        }
        initialize()
    }, [dispatch, navigate])

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div>Loading...</div>
            </div>
        )
    }

    return user
}

export default Profile