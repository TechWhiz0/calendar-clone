import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { EventProvider } from './contexts/EventContext'
import Login from './pages/Login'
import Calendar from './pages/Calendar'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <EventProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/calendar" replace />} />
          </Routes>
        </EventProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
