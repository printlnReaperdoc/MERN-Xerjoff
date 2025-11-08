import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { CssBaseline, IconButton } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useMemo, useState, useEffect } from 'react'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'

import Header from './components/Header'
import Footer from './components/Footer'
import Homepage from './pages/Homepage'
import About from './pages/About'
import Contact from './pages/Contact'
import Shop from './pages/Shop'
import Login from './pages/Login'
import Register from './pages/Register'
import Product from './pages/Product'
import Manage from './pages/Manage'
import Forbidden from './pages/Forbidden'
import Users from './pages/ManageUsers'
import Sales from './pages/Sales'
import './App.css'

function AppContent() {
  const location = useLocation()
  const isHomepage = location.pathname === '/'

  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light')

  useEffect(() => {
    localStorage.setItem('themeMode', mode)
  }, [mode])

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
        typography: { fontFamily: "'CustomFont', 'Segoe UI', sans-serif" },
      }),
    [mode]
  )

  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'))

  const modeToggleButton = (
    <IconButton onClick={toggleMode} color="inherit" sx={{ ml: 1 }}>
      {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header leftContent={modeToggleButton} />

      {!isHomepage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            backgroundImage: 'url(/Xerjoff.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: mode === 'dark' ? 'brightness(0.6)' : 'brightness(1)',
            pointerEvents: 'none',
          }}
        />
      )}

      <main
        style={{
          minHeight: '100vh',
          paddingTop: '120px',
          paddingBottom: '40px',
          position: 'relative',
          zIndex: 1,
          margin: '0 auto',
          maxWidth: isHomepage || location.pathname === '/shop' ? '100%' : '960px', // 👈 allow Shop to be full width
          backgroundColor: isHomepage ? 'transparent' : theme.palette.background.paper,
          borderRadius: isHomepage ? 0 : 12,
          boxShadow: isHomepage ? 'none' : theme.shadows[3],
        }}
      >
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/manage" element={<Manage />} />
          <Route path="/users" element={<Users />} />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="/sales" element={<Sales />} />
        </Routes>
      </main>

      <Footer />
    </ThemeProvider>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
