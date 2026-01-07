import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Accessibility from './components/Accessibility'
import Analytics from './components/Analytics'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import ProjectsSimple from './pages/ProjectsSimple'

function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin')
  
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', position: 'relative' }}>
        <Accessibility />
        <Analytics />
        <Navbar />
        <main id="main-content" style={{ flex: 1, width: '100%', position: 'relative' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/servicos" element={<Services />} />
            <Route path="/galeria" element={<Gallery />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/projects" element={<ProjectsSimple />} />
            <Route path="/:hash" element={<Home />} />
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </BrowserRouter>
  )
}

export default App
