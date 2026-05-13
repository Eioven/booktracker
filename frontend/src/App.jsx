import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import LibraryPage from './pages/Library/LibraryPage'
import BookPage from './pages/Library/BookPage'
import GoalsPage from './pages/Goals/GoalsPage'
import StatsPage from './pages/Stats/StatsPage'
import ProfilePage from './pages/Profile/ProfilePage'

const PrivatePage = ({ children }) => (
  <ProtectedRoute>
    <Layout>
      {children}
    </Layout>
  </ProtectedRoute>
)

const App = () => {
  return (
    <Routes>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/" element={
        <PrivatePage><DashboardPage /></PrivatePage>
      } />

      <Route path="/library" element={
        <PrivatePage><LibraryPage /></PrivatePage>
      } />

      <Route path="/library/:id" element={
        <PrivatePage><BookPage /></PrivatePage>
      } />

      <Route path="/goals" element={
        <PrivatePage><GoalsPage /></PrivatePage>
      } />

      <Route path="/stats" element={
        <PrivatePage><StatsPage /></PrivatePage>
      } />

      <Route path="/profile" element={
        <PrivatePage><ProfilePage /></PrivatePage>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default App
