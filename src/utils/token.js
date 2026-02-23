export const setToken = (token) => {
    if(token) {
        localStorage.setItem('jwt_token', token)
    }
}

export const getToken = () => {
    return localStorage.getItem('jwt_token')
}

export const clearToken = () => {
    localStorage.removeItem('jwt_token')
}