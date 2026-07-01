import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginScreen } from './screens/LoginScreen/LoginScreen.jsx'
import { RegisterScreen } from './screens/RegisterScreen/RegisterScreen.jsx'
import { HomeScreen } from './screens/HomeScreen/HomeScreen.jsx'
import { RequestPasswordResetScreen } from './screens/RequestPasswordResetScreen/RequestPasswordResetScreen.jsx'
import { ResetPasswordScreen } from './screens/ResetPasswordScreen/ResetPasswordScreen.jsx'


const App = () => {
  return (
    <Routes>
      <Route 
          path='/login'
          element={<LoginScreen/>}
      />
      <Route
        path='/register'
        element={<RegisterScreen/>}
      />
      <Route 
        path='/home'
        element={<HomeScreen/>}
      />
      <Route 
        path='/request-password-reset'
        element={<RequestPasswordResetScreen/>}
      />
      <Route 
        path='/reset-password/:token'
        element={<ResetPasswordScreen/>}
      />
      <Route 
        path='/'
        element={<LoginScreen/>}
      />
      <Route 
        path='/*'
        element={<Navigate to={'/home'} />}
      />
    </Routes>
  )
}

export default App