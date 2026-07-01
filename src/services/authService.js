const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function login (email, password){
    try{
        console.log('authService: API_URL =', API_URL)
        const response_http = await fetch(
            `${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify(
                    {
                        email: email,
                        password: password
                    }
                )
            }
        )
        console.log('authService: response status', response_http.status)
        const response = await response_http.json()
        console.log('authService: response json', response)
        if (!response_http.ok) {
            throw new Error(response.message || 'Login failed')
        }
        return response
    }
    catch(error){
        console.error('authService error', error)
        throw error
    }
}

export async function register(payload){
    try{
        console.log('authService: register ->', API_URL + '/api/auth/register')
        const response_http = await fetch(
            `${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify(payload)
            }
        )
        const response = await response_http.json()
        console.log('authService: register status', response_http.status, response)
        if (!response_http.ok) {
            throw new Error(response.message || 'Register failed')
        }
        return response
    }
    catch(error){
        console.error('authService.register error', error)
        throw error
    }
}

export async function requestPasswordReset(email) {
    try {
        const response_http = await fetch(`${API_URL}/api/auth/request-password-reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        })
        const response = await response_http.json()
        if (!response_http.ok) {
            throw new Error(response.message || 'No se pudo enviar la solicitud')
        }
        return response
    } catch (error) {
        console.error('authService.requestPasswordReset error', error)
        throw error
    }
}

export async function resetPassword(resetToken, newPassword) {
    try {
        const response_http = await fetch(`${API_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ resetToken, newPassword })
        })
        const response = await response_http.json()
        if (!response_http.ok) {
            throw new Error(response.message || 'No se pudo restablecer la contraseña')
        }
        return response
    } catch (error) {
        console.error('authService.resetPassword error', error)
        throw error
    }
}

export async function logout() {
    try {
        const response_http = await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const response = await response_http.json()
        if (!response_http.ok) {
            throw new Error(response.message || 'Logout failed')
        }
        return response
    }
    catch (error) {
        console.error('authService.logout error', error)
        throw error
    }
}
