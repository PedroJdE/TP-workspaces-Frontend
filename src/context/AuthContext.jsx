import { jwtDecode } from "jwt-decode"
import { createContext, useEffect, useState } from "react"



export const AuthContext = createContext({
    isLogged: false,
    authToken: null,
    userData: null,
    login: () => { },
    logout: () => { }
})

export const AUTH_TOKEN_LOCALSTORAGE_KEY = 'auth_token'


export const AuthContextProvider = ({ children }) => {

    const [authToken, setAuthToken] = useState(localStorage.getItem(AUTH_TOKEN_LOCALSTORAGE_KEY))
    const [isLogged, setIsLogged] = useState(Boolean(authToken))
    const [userData, setUserData] = useState(null)

    function login(token) {
        localStorage.setItem(AUTH_TOKEN_LOCALSTORAGE_KEY, token)
        setAuthToken(token)
        setIsLogged(true)
    }

    function logout() {
        localStorage.removeItem(AUTH_TOKEN_LOCALSTORAGE_KEY)
        setAuthToken(null)
        setIsLogged(false)
        setUserData(null)
    }

    function loadUserSession() {
        if (authToken) {
            const payload = jwtDecode(authToken)
            setUserData({
                email: payload.email,
                fecha_creacion: payload.fecha_creacion,
                id: payload.id,
                nombre: payload.nombre
            })
        } else {
            setUserData(null)
        }
    }

    useEffect(
        () => {
            loadUserSession()
        },
        [authToken]
    )

    const providerValues = {
        isLogged,
        authToken,
        userData,
        login,
        logout
    }
    return (
        <AuthContext.Provider value={
            providerValues
        }>
            {children}
        </AuthContext.Provider>
    )
}