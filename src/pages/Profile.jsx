import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth } from '../redux/slices/authSlice'
import { setToken } from '../utils/token'

const Profile = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { loading } = useSelector((state) => state.auth)

    useEffect(() => {
        const initialize = async () => {
            const urlParams = new URLSearchParams(window.location.search)
            const token = urlParams.get('token')

            if(token){
                setToken(token)
            }

            await dispatch(checkAuth())
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

    return null
}

export default Profile