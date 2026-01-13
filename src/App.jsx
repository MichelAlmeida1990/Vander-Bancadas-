import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import ProjectsSimple from './pages/ProjectsSimple'
import { AdminGuard } from './components/AdminGuard.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import Accessibility from './components/Accessibility'
import Analytics from './components/Analytics'
import { AdminDataProvider } from './context/AdminDataContext.jsx'
import StorageDiagnostic from './components/StorageDiagnostic'

function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin')
  
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', position: 'relative' }}>
        <Accessibility />
        <Analytics />
        {!isAdminRoute && <Navbar />}
        <AdminDataProvider>
          <StorageDiagnostic />
          <main id="main-content" style={{ flex: 1, width: '100%', position: 'relative' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/servicos" element={<Services />} />
              <Route path="/galeria" element={<Gallery />} />
              <Route path="/contato" element={<Contact />} />

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminGuard><Dashboard /></AdminGuard>} />
              <Route path="/admin/projects" element={<AdminGuard><ProjectsSimple /></AdminGuard>} />

              <Route path="/:hash" element={<Home />} />
            </Routes>
          </main>
        </AdminDataProvider>
        {!isAdminRoute && <Footer />}
      </div>
    </BrowserRouter>
  )
}

export default App
