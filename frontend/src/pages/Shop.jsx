import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Slider from '@mui/material/Slider'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'

function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalImage, setModalImage] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [review, setReview] = useState(0)
  const [reviewQuery, setReviewQuery] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [tempReview, setTempReview] = useState(0)
  const [tempCategory, setTempCategory] = useState("")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [tempPriceRange, setTempPriceRange] = useState([0, 1000])
  const loader = useRef(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    let url = `/api/products?page=${page}&limit=12`
    if (query) url += `&name=${encodeURIComponent(query)}`
    if (reviewQuery !== null) url += `&review=${reviewQuery}`
    if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`
    if (priceRange[0] !== 0 || priceRange[1] !== 1000) {
      url += `&minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}`
    }

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products')
        return res.json()
      })
      .then(data => {
        if (page === 1) {
          setProducts(data.products || data)
          // Extract unique categories
          const uniqueCategories = [...new Set((data.products || data).map(product => product.category))]
          setCategories(uniqueCategories)
        } else {
          setProducts(prev => [...prev, ...(data.products || data)])
        }
        setHasMore(data.products ? data.products.length > 0 : data.length > 0)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [query, page, reviewQuery, selectedCategory, priceRange])

  useEffect(() => {
    setProducts([])
    setPage(1)
    setHasMore(true)
  }, [query, reviewQuery])

  const handleObserver = useCallback((entries) => {
    const target = entries[0]
    if (target.isIntersecting && hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }, [hasMore, loading])

  useEffect(() => {
    const option = { root: null, rootMargin: '100px', threshold: 0 }
    const observer = new window.IntersectionObserver(handleObserver, option)
    if (loader.current) observer.observe(loader.current)
    return () => { if (loader.current) observer.unobserve(loader.current) }
  }, [handleObserver])

  const handleSearch = (e) => {
    e.preventDefault()
    setQuery(search)
  }

  const handleApplyFilters = () => {
    setReviewQuery(tempReview)
    setSelectedCategory(tempCategory)
    setPriceRange(tempPriceRange)
  }

  const handleResetFilters = () => {
    setTempReview(0)
    setReview(0)
    setReviewQuery(null)
    setTempCategory("")
    setSelectedCategory("")
    setTempPriceRange([0, 1000])
    setPriceRange([0, 1000])
  }

  const filteredProducts = reviewQuery !== null
    ? products.filter(product => Number(product.review) === Number(reviewQuery))
    : products

  if (loading && page === 1) return (
    <main>
      <h4>Shop Page</h4>
      <p>Loading...</p>
    </main>
  )

  if (error) return (
    <main>
      <h4>Shop Page</h4>
      <p style={{ color: 'red' }}>Error: {error}</p>
    </main>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: 280,
        padding: 16,
        borderRight: '1px solid #ccc',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        <h3>Filters</h3>
        <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
          <TextField
            fullWidth
            type="text"
            placeholder="Search by product name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            style={{ marginBottom: 10 }}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mb: 1 }}>
            Search
          </Button>
          <Button variant="outlined" fullWidth onClick={handleResetFilters}>
            Reset
          </Button>
        </form>

        <div style={{ marginBottom: 20 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={tempCategory}
              label="Category"
              onChange={(e) => setTempCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Price Range filter */}
        <div style={{ marginBottom: 20 }}>
          <Typography variant="subtitle1">Price Range</Typography>
          <Typography variant="body2">
            ${tempPriceRange[0]} - ${tempPriceRange[1]}
          </Typography>
          <Slider
            value={tempPriceRange}
            onChange={(_, newValue) => setTempPriceRange(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={1000}
            step={10}
            sx={{ mb: 2 }}
          />
        </div>

        {/* Rating filter */}
        <div>
          <Typography variant="subtitle1">Review Rating</Typography>
          <Typography variant="body2">Rating: {tempReview}</Typography>
          <Slider
            value={tempReview}
            min={0}
            max={10}
            step={1}
            marks
            valueLabelDisplay="auto"
            onChange={(_, val) => {
              setTempReview(val)
              setReview(val)
            }}
            sx={{ mb: 2 }}
          />
        </div>

        {/* Filter buttons */}
        <div style={{ marginTop: 20 }}>
          <Button 
            variant="contained" 
            onClick={handleApplyFilters} 
            fullWidth 
            sx={{ mb: 1 }}
          >
            Apply All Filters
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleResetFilters} 
            fullWidth
          >
            Reset All Filters
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flexGrow: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          borderBottom: '1px solid #ccc',
          position: 'sticky',
          top: 0,
          background: '#fff'
        }}>
          <h2>Shop Page</h2>
        </div>

        {/* Product Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
          padding: 16
        }}>
          {filteredProducts.length === 0 ? (
            <Typography>No products found.</Typography>
          ) : (
            filteredProducts.map(product => (
              <Card key={product._id} sx={{ width: 240, textAlign: 'center' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={product.image_path}
                  alt={product.name}
                  sx={{ objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => {
                    setModalImage(product.image_path)
                    setModalOpen(true)
                  }}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    component={Link}
                    to={`/product/${product.slug}`}
                    sx={{ textDecoration: 'none', color: 'primary.main', display: 'block', mb: 1 }}
                  >
                    {product.name}
                  </Typography>
                  <Typography variant="body2">{product.description}</Typography>
                  <Typography variant="body2" color="text.secondary">Category: {product.category}</Typography>
                  <Typography variant="body2" color="text.secondary">Price: ${product.price}</Typography>
                  <Typography variant="body2" color="text.secondary">Review: {product.review}</Typography>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div ref={loader} />
        {loading && page > 1 && <Typography>Loading more...</Typography>}
        {!hasMore && products.length > 0 && <Typography>No more products.</Typography>}

        {/* Image Modal */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <IconButton
              onClick={() => setModalOpen(false)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'gray',
                background: 'rgba(255,255,255,0.7)'
              }}
            >
              <CloseIcon />
            </IconButton>
            {modalImage && (
              <img
                src={modalImage}
                alt="Product"
                style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }}
              />
            )}
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default Shop
