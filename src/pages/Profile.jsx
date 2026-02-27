import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth } from '../redux/slices/authSlice'

const Profile = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user, loading, isAutheticated } = useSelector((state) => state.auth)

    useEffect(() => {
            dispatch(checkAuth())
    }, [dispatch])

    useEffect(() => {
        if(!loading){
            if(isAutheticated && user){
                navigate('/albums', { replace: true })
            } else {
                navigate('/', { replace: true })
            }
        }
    }, [loading, isAutheticated, user, navigate])

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

    return null
}

export default Profile