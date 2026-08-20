import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Sleep from './pages/Sleep'
import Water from './pages/Water'
import Study from './pages/Study'
import SleepHistory from './pages/SleepHistory'
import WaterHistory from './pages/WaterHistory'
import StudyHistory from './pages/StudyHistory'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function protect(element) {
  return <ProtectedRoute>{element}</ProtectedRoute>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={protect(<Dashboard />)} />
      <Route path="/sleep" element={protect(<Sleep />)} />
      <Route path="/water" element={protect(<Water />)} />
      <Route path="/study" element={protect(<Study />)} />
      <Route path="/sleep/history" element={protect(<SleepHistory />)} />
      <Route path="/water/history" element={protect(<WaterHistory />)} />
      <Route path="/study/history" element={protect(<StudyHistory />)} />
      <Route path="/profile" element={protect(<Profile />)} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
