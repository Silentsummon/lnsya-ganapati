import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAppStore } from './store/appStore'
import Home from './pages/Home'
import Updates from './pages/Updates'
import Roles from './pages/Roles'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function TopNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const isLanding = location.pathname === '/'
  const isLoggedIn = !!localStorage.getItem('userRole')

  const items = [
    { path: '/', label: 'Home' },
    { path: '/updates', label: 'Updates' },
    { path: '/roles', label: 'Team Access' },
  ]
  if (isLoggedIn) items.push({ path: '/dashboard', label: 'Dashboard' })

  return (
    <div className="topnav">
      <button
        className={`menu-btn ${isLanding ? 'dim' : ''}`}
        onClick={() => isLanding ? navigate('/roles') : setOpen(o => !o)}
      >
        <span className="menu-line" />
        <span className="menu-line" />
        <span className="menu-line" />
      </button>
      {open && !isLanding && (
        <div className="menu-panel">
          {items.map(item => (
            <button
              key={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => { navigate(item.path); setOpen(false) }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const { init, loading } = useAppStore()

  useEffect(() => { init() }, [])

  if (loading) {
    return (
      <>
        <div className="bg-wrap" />
        <div className="bg-overlay" />
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#fca366'}}>Loading...</div>
      </>
    )
  }

  return (
    <BrowserRouter>
      <div className="bg-wrap" />
      <div className="bg-overlay" />
      <TopNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/president-pin" element={<Login role="president" />} />
        <Route path="/treasurer-pin" element={<Login role="treasurer" />} />
        <Route path="/volunteer" element={<Dashboard forcedRole="volunteer" />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
