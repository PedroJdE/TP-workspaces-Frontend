import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useForm from '../../hooks/useForm'
import { login } from '../../services/authService'
import { AuthContext } from '../../context/AuthContext'
import './LoginScreen.css'

export const LoginScreen = () => {

    const initial_form_state = {
        email: '',
        password: ''
    }

    const { login: setAuthToken } = useContext(AuthContext)
    const navigate = useNavigate()
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    async function onSubmit (formData){
        setError(null)
        setLoading(true)
        try{
            console.log("un usuario intento iniciar sesion", formData)
            const res = await login(formData.email, formData.password)
            // Guardar token en localStorage si existe
            if (res && res.data && res.data.access_token) {
                setAuthToken(res.data.access_token)
            }
            // En caso de exito, redirigir a home
            navigate('/home')
        }
        catch(err){
            setError(err.message || 'Error al iniciar sesión')
        }
        finally{
            setLoading(false)
        }
    }

    const {formState, handleChange, handleSubmit} = useForm(initial_form_state, onSubmit)


    return (
        <div className="login-container">
            <div className="login-wrapper">
                <div className="login-card">
                    <div className="login-header">
                        <h1>Bienvenido</h1>
                        <p>Inicia sesión en tu cuenta</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input 
                                id='email' 
                                name='email' 
                                type='email' 
                                placeholder="tu@email.com"
                                value={formState.email} 
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <input 
                                id='password' 
                                name='password' 
                                type={formState.showPassword ? 'text' : 'password'} 
                                placeholder="••••••••"
                                value={formState.password} 
                                onChange={handleChange}
                            />
                        </div>

                        <div className="show-password">
                            <label>
                                <input 
                                    type="checkbox" 
                                    name="showPassword" 
                                    checked={formState.showPassword}
                                    onChange={handleChange}
                                />
                                Mostrar contraseña
                            </label>
                        </div>

                        <button type="submit" className="login-submit" disabled={loading}>{loading ? 'Ingresando...' : 'Iniciar sesión'}</button>
                        {error && <div className="form-message form-error">{error}</div>}
                    </form>

                    <div className="restart-password">
                        <p>¿Olvidaste tu contraseña? <Link to={'/request-password-reset'}>Restablecer contraseña</Link></p>
                    </div>

                    <div className="login-footer">
                        <p>¿No tienes cuenta? <Link to={'/register'}>Regístrate aquí</Link></p>
                    </div>
                </div>
            </div>
        </div>
    )
}