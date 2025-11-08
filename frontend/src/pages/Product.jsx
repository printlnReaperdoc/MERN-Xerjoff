import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Button from '@mui/material/Button'

function Product() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openImg, setOpenImg] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/products/slug/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found')
        return res.json()
      })
      .then(data => {
        setProduct(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [slug])

  if (loading) return (
    <main style={{ textAlign: 'center', padding: '2rem' }}>
      <Typography variant="h4">Product</Typography>
      <Typography>Loading...</Typography>
    </main>
  )

  if (error) return (
    <main style={{ textAlign: 'center', padding: '2rem' }}>
      <Typography variant="h4">Product</Typography>
      <Typography color="error">Error: {error}</Typography>
    </main>
  )

  if (!product) return (
    <main style={{ textAlign: 'center', padding: '2rem' }}>
      <Typography variant="h4">Product</Typography>
      <Typography>Product not found.</Typography>
    </main>
  )

  // Compute image src
  const imgSrc = product.image_path && !product.image_path.startsWith('/') ? `/${product.image_path}` : product.image_path

  return (
    <main style={{ textAlign: 'center', padding: '2rem' }}>
      <Button
        component={Link}
        to="/shop"
        variant="outlined"
        sx={{ mb: 4 }}
      >
        Back to Shop
      </Button>

      {/* Display product info without Card */}
      <div>
        <img
          src={imgSrc}
          alt={product.name}
          style={{ maxWidth: '90%', height: 'auto', cursor: 'pointer', marginBottom: '1rem' }}
          onClick={() => setOpenImg(true)}
        />
        <Typography variant="h5" gutterBottom>{product.name}</Typography>
        <Typography variant="body1">{product.description}</Typography>
        <Typography variant="body2" color="text.secondary">Category: {product.category}</Typography>
        <Typography variant="body2" color="text.secondary">Price: ${product.price}</Typography>
        <Typography variant="body2" color="text.secondary">Review: {product.review} / 10</Typography>
      </div>

      <Dialog open={openImg} onClose={() => setOpenImg(false)} maxWidth="md">
        <IconButton
          aria-label="close"
          onClick={() => setOpenImg(false)}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'white', zIndex: 1 }}
        >
          <CloseIcon />
        </IconButton>
        <img
          src={imgSrc}
          alt={product.name}
          style={{ maxWidth: '90vw', maxHeight: '80vh', display: 'block', margin: 'auto', background: '#222' }}
        />
      </Dialog>
    </main>
  )
}

export default Product
