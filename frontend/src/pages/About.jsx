import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function About() {
  const navigate = useNavigate()

  return (
    <Box sx={{ width: '100%', overflow: 'hidden', mt: -8, mx: -3 }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '60vh', md: '75vh' },
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3)), url('/about-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          px: { xs: 3, sm: 6, md: 10 },
          textAlign: 'center',
        }}
      >
        <Box sx={{ maxWidth: '700px', zIndex: 1 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              mb: 2,
              letterSpacing: '0.05em',
            }}
          >
            About Xerjoff
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 300,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Where craftsmanship meets luxury
          </Typography>
        </Box>
      </Box>

      {/* Content Section */}
      <Box sx={{ py: 8, px: { xs: 3, sm: 6, md: 10 } }}>
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
            Our Story
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
            Xerjoff Perfume Store is dedicated to offering an exquisite range of luxury fragrances.
            Our collection features exclusive perfumes crafted by renowned artisans, blending rare
            ingredients and sophisticated scents. We strive to provide an exceptional shopping
            experience for perfume lovers, ensuring authenticity and elegance in every bottle.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/shop')}
            sx={{
              bgcolor: 'white',
              color: 'black',
              px: 5,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderRadius: 0,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              },
            }}
          >
            Explore Collection
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default About