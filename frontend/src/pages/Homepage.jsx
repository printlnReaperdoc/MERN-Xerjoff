import React, { useRef, useState, useEffect } from 'react'
import { Box, Typography, Button, Container } from '@mui/material'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { useNavigate } from 'react-router-dom'

function Homepage() {
  const heroRef = useRef(null)
  const navigate = useNavigate()
  const [featuredProduct, setFeaturedProduct] = useState(null)
  const [imageKey, setImageKey] = useState(Date.now())

  const API_URL = import.meta.env.VITE_API_URL || ""

  // Get user from localStorage
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch {
      return null
    }
  })()

  // Fetch featured product
  useEffect(() => {
    const fetchFeaturedProduct = async () => {
      try {
        console.log('Fetching featured product...')
        const response = await fetch(`${API_URL}/api/products/featured`)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Featured product data:', data)
          setFeaturedProduct(data)
          // Update image key to force re-render with new image
          setImageKey(Date.now())
        } else if (response.status === 404) {
          console.log('No featured product found')
          setFeaturedProduct(null)
        } else {
          console.error('Error fetching featured product:', response.status)
          setFeaturedProduct(null)
        }
      } catch (error) {
        console.error('Error fetching featured product:', error)
        setFeaturedProduct(null)
      }
    }
    fetchFeaturedProduct()
  }, [API_URL])

  // GSAP animation
  useGSAP(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.2 }
      )
    }
  }, [featuredProduct, imageKey])

  // Default featured content if no product is set
  const defaultHero = {
    title: 'DARK SELECTION',
    subtitle: 'SENSUAL SCENTS WITH AN AIR OF MYSTERY.',
    image: '/wallpaper.jpg',
    buttonText: 'DISCOVER'
  }

  // Get the correct image path
  const getImagePath = () => {
    if (featuredProduct?.image_path) {
      console.log('Featured image_path:', featuredProduct.image_path)
      return featuredProduct.image_path
    }
    return defaultHero.image
  }

  const heroData = featuredProduct || defaultHero

  return (
    <Box sx={{ width: '100%', overflow: 'hidden', mt: -8, mx: -3 }}>
      {/* Hero Section */}
      <Box
        ref={heroRef}
        key={imageKey}
        sx={{
          position: 'relative',
          height: { xs: '70vh', md: '85vh' },
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3)), url(${getImagePath()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'white',
          px: { xs: 3, sm: 6, md: 10 },
        }}
      >
        <Box sx={{ maxWidth: '600px', zIndex: 1 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', sm: '4rem', md: '5.5rem' },
              fontWeight: 700,
              lineHeight: 1.1,
              mb: 3,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            {featuredProduct?.name || heroData.title}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
              fontWeight: 300,
              lineHeight: 1.4,
              mb: 5,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {featuredProduct?.description || heroData.subtitle}
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate(featuredProduct ? `/product/${featuredProduct.slug}` : '/shop')}
            sx={{
              bgcolor: 'white',
              color: 'black',
              px: 5,
              py: 1.8,
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              borderRadius: 0,
              boxShadow: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              },
            }}
          >
            {featuredProduct ? 'VIEW PRODUCT' : heroData.buttonText}
          </Button>
        </Box>
      </Box>

      {/* Admin Section - Only visible to admins */}
      {user?.role_id === 1 && (
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Box
            sx={{
              bgcolor: 'background.paper',
              p: 4,
              borderRadius: 2,
              boxShadow: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Admin Controls
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Logged in as <strong>{user.name}</strong> ({user.role_id === 1 ? 'Admin' : 'Customer'})
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={() => navigate('/manage')}
                sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Manage Products
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/users')}
                sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Manage Users
              </Button>
            </Box>
          </Box>
        </Container>
      )}

      {/* About Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 600,
              mb: 3,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            About Xerjoff Perfume Store
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: '1.1rem',
              lineHeight: 1.8,
              color: 'text.secondary',
              mb: 5,
            }}
          >
            Xerjoff Perfume Store is your destination for luxurious and exclusive fragrances. 
            Discover a curated selection of premium perfumes crafted with the finest ingredients, 
            offering a unique olfactory experience for every scent enthusiast.
          </Typography>

          <Box
            sx={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              overflow: 'hidden',
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <iframe
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
              src="https://www.youtube.com/embed/aau-c8l5z9c"
              title="Xerjoff Perfume"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Homepage