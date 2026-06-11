import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Contratos } from './pages/Contratos'
import { ContratoDetalhes } from './pages/ContratoDetalhes'
import { ContratoForm } from './pages/ContratoForm'
import { EmailProfissional } from './pages/EmailProfissional'
import { UploadManual } from './pages/UploadManual'
import { ComoFunciona } from './pages/ComoFunciona'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contratos" element={<Contratos />} />
            <Route path="/contratos/novo" element={<ContratoForm />} />
            <Route path="/contratos/:id/editar" element={<ContratoForm />} />
            <Route path="/contratos/:id" element={<ContratoDetalhes />} />
            <Route path="/email" element={<EmailProfissional />} />
            <Route path="/upload" element={<UploadManual />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
