import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PersonIcon from '@mui/icons-material/Person'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'

function Header({ leftContent }) {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch {
      return null
    }
  })()

  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogout = () => {
    setShowConfirm(true)
  }

  const confirmLogout = () => {
    localStorage.removeItem('user')
    setShowConfirm(false)
    navigate('/')
    window.location.reload()
  }

  const cancelLogout = () => {
    setShowConfirm(false)
  }

  return (
    <>
      {/* Promotional Banner */}
      <Box
        sx={{
          bgcolor: 'black',
          color: 'white',
          textAlign: 'center',
          py: 1.5,
          fontSize: '0.85rem',
          fontWeight: 500,
          letterSpacing: '0.05em',
        }}
      >
        RECEIVE 15% OFF ORDERS CONTAINING ANY DARK SELECTION PERFUME UNTIL MIDNIGHT CET 6 NOVEMBER
      </Box>

      {/* Main Navigation */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'white',
          color: 'black',
          borderBottom: '3px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Left Section */}
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {leftContent}
            <Button
              color="inherit"
              component={Link}
              to="/about"
              sx={{
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                fontWeight: 500,
                letterSpacing: '0.1em',
                '&:hover': { bgcolor: 'transparent', opacity: 0.7 },
              }}
            >
              XERJOFF
            </Button>
            <Button
              color="inherit"
              sx={{
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                fontWeight: 500,
                letterSpacing: '0.1em',
                '&:hover': { bgcolor: 'transparent', opacity: 0.7 },
              }}
            >
              CASAMORATI
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/shop"
              sx={{
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                fontWeight: 500,
                letterSpacing: '0.1em',
                '&:hover': { bgcolor: 'transparent', opacity: 0.7 },
              }}
            >
              BOUTIQUES
            </Button>
          </Box>

          {/* Center Logo */}
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
              letterSpacing: '0.15em',
              fontSize: '1.8rem',
            }}
          >
            XERJOFF
          </Typography>

          {/* Right Section */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              color="inherit"
              sx={{
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                fontWeight: 500,
                letterSpacing: '0.1em',
                '&:hover': { bgcolor: 'transparent', opacity: 0.7 },
              }}
            >
              OUR WORLD
            </Button>
            <Button
              color="inherit"
              sx={{
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                fontWeight: 500,
                letterSpacing: '0.1em',
                '&:hover': { bgcolor: 'transparent', opacity: 0.7 },
              }}
            >
              JOURNAL
            </Button>

            <IconButton color="inherit" size="small">
              <SearchIcon />
            </IconButton>

            {user ? (
              <>
                <IconButton color="inherit" size="small" onClick={handleLogout}>
                  <PersonIcon />
                </IconButton>
                {user.role_id === 1 && (
                  <Button
                    variant="text"
                    onClick={() => navigate('/manage')}
                    sx={{
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      color: 'primary.main',
                    }}
                  >
                    Admin
                  </Button>
                )}
              </>
            ) : (
              <IconButton color="inherit" size="small" component={Link} to="/login">
                <PersonIcon />
              </IconButton>
            )}

            <IconButton color="inherit" size="small">
              <ShoppingBagIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showConfirm} onClose={cancelLogout}>
        <DialogTitle>Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmLogout} color="primary">
            Yes
          </Button>
          <Button onClick={cancelLogout} color="primary" autoFocus>
            No
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Header