import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useForm from '../../hooks/useForm'
import { register } from '../../services/authService'
import './RegisterScreen.css'

export const RegisterScreen = () => {
    const initial_form_state = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    }

    const navigate = useNavigate()
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [loading, setLoading] = useState(false)

    async function onSubmit(formData) {
        setError(null)
        setSuccess(null)
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }
        setLoading(true)
        try{
            const payload = {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                password: formData.password
            }
            const res = await register(payload)
            setSuccess('Cuenta creada. Redirigiendo al login...')
            setTimeout(() => navigate('/login'), 1200)
        }
        catch(err){
            setError(err.message || 'Error al registrarse')
        }
        finally{
            setLoading(false)
        }
    }

    const { formState, handleChange, handleSubmit } = useForm(initial_form_state, onSubmit)

    return (
        <div className="register-container">
            <div className="register-wrapper">
                <div className="register-card">
                    <div className="register-header">
                        <h1>Crear Cuenta</h1>
                        <p>Únete a nuestra comunidad hoy</p>
                    </div>

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">Nombre</label>
                                <input 
                                    id='firstName' 
                                    name='firstName' 
                                    type='text' 
                                    placeholder="Juan"
                                    value={formState.firstName} 
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="lastName">Apellido</label>
                                <input 
                                    id='lastName' 
                                    name='lastName' 
                                    type='text' 
                                    placeholder="Pérez"
                                    value={formState.lastName} 
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group full">
                            <label htmlFor="email">Email</label>
                            <input 
                                id='email' 
                                name='email' 
                                type='email' 
                                placeholder="tu@email.com"
                                value={formState.email} 
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">Contraseña</label>
                                <input 
                                    id='password' 
                                    name='password' 
                                    type='password' 
                                    placeholder="••••••••"
                                    value={formState.password} 
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                                <input 
                                    id='confirmPassword' 
                                    name='confirmPassword' 
                                    type='password' 
                                    placeholder="••••••••"
                                    value={formState.confirmPassword} 
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group full">
                            <div className="checkbox-group">
                                <input 
                                    id='acceptTerms' 
                                    name='acceptTerms' 
                                    type='checkbox' 
                                    checked={formState.acceptTerms} 
                                    onChange={handleChange}
                                    required
                                />
                                <label htmlFor="acceptTerms">Acepto los términos y condiciones</label>
                            </div>
                        </div>

                        <button type="submit" className="register-submit" disabled={loading}>{loading ? 'Creando...' : 'Crear Cuenta'}</button>
                        {error && <div className="form-message form-error">{error}</div>}
                        {success && <div className="form-message form-success">{success}</div>}
                    </form>

                    <div className="register-footer">
                        <p>¿Ya tienes cuenta? <Link to={'/login'}>Inicia sesión aquí</Link></p>
                    </div>
                </div>
            </div>
        </div>
    )
}