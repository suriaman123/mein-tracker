import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Sleep from './pages/Sleep'
import Water from './pages/Water'
import Study from './pages/Study'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sleep"
        element={
          <ProtectedRoute>
            <Sleep />
          </ProtectedRoute>
        }
      />
      <Route
        path="/water"
        element={
          <ProtectedRoute>
            <Water />
          </ProtectedRoute>
        }
      />
      <Route
        path="/study"
        element={
          <ProtectedRoute>
            <Study />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
