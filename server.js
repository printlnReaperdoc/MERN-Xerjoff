import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Chip, Rating, Alert, Paper
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import { useNavigate } from 'react-router-dom'
import { DataGrid } from '@mui/x-data-grid'

function Manage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ name: '', price: '', category: '', description: '', review: 0 })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [openForm, setOpenForm] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [userChecked, setUserChecked] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const navigate = useNavigate()

  const fetchProducts = () => {
    setLoading(true)
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products')
        return res.json()
      })
      .then(data => {
        console.log('Products fetched:', data)
        setProducts(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      setUnauthorized(true)
      setUserChecked(true)
      return
    }
    try {
      const user = JSON.parse(userStr)
      if (user.role_id === 2) {
        setUnauthorized(true)
        setUserChecked(true)
        return
      }
      setUserChecked(true)
    } catch {
      setUnauthorized(true)
      setUserChecked(true)
    }
  }, [navigate])

  useEffect(() => {
    if (unauthorized) {
      navigate('/forbidden')
    }
  }, [unauthorized, navigate])

  const handleOpenCreate = () => {
    setForm({ name: '', price: '', category: '', description: '', review: 0 })
    setEditingId(null)
    setImageFile(null)
    setImagePreview('')
    setOpenForm(true)
  }

  const handleOpenEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || '',
      review: product.review || 0
    })
    setEditingId(product._id)
    setImageFile(null)
    setImagePreview(product.image_path || '')
    setOpenForm(true)
  }

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess('')
    
    let image_path = form.image_path || '/public/uploads/sample.image.jpg'

    // Upload image first if there's a new file
    if (imageFile) {
      const formData = new FormData()
      formData.append('image', imageFile)
      
      try {
        const uploadRes = await fetch('/api/products/upload-image', {
          method: 'POST',
          body: formData,
        })
        const uploadData = await uploadRes.json()
        
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Image upload failed')
        }
        
        image_path = uploadData.image_path
        console.log('Image uploaded:', image_path)
      } catch (err) {
        console.error('Upload error:', err)
        setError('Image upload failed: ' + err.message)
        return
      }
    } else if (editingId) {
      // If editing and no new image, keep the old one
      const existingProduct = products.find(p => p._id === editingId)
      if (existingProduct?.image_path) {
        image_path = existingProduct.image_path
      }
    }

    // Create slug from name
    const slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const payload = {
      name: form.name,
      slug: slug,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      review: Number(form.review) || 0,
      image_path: image_path
    }

    console.log('Submitting payload:', payload)

    try {
      let response
      if (editingId) {
        response = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await response.json()
      console.log('Response:', data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save product')
      }

      setSuccess(editingId ? 'Product updated successfully!' : 'Product created successfully!')
      setOpenForm(false)
      setEditingId(null)
      fetchProducts()
    } catch (err) {
      console.error('Submit error:', err)
      setError(err.message)
    }
  }

  const handleOpenDelete = (id) => {
    setDeleteId(id)
    setOpenDelete(true)
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/products/${deleteId}`, { 
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product')
      }

      setSuccess('Product deleted successfully!')
      fetchProducts()
    } catch (err) {
      console.error('Delete error:', err)
      setError(err.message)
    } finally {
      setOpenDelete(false)
      setDeleteId(null)
    }
  }

  const handleToggleFeatured = async (id, currentFeaturedStatus) => {
    try {
      console.log('Toggle featured - ID:', id)
      console.log('Current status:', currentFeaturedStatus)
      console.log('Setting to:', !currentFeaturedStatus)
      
      const response = await fetch(`/api/products/${id}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !currentFeaturedStatus }),
      })

      const data = await response.json()
      console.log('Toggle response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update featured status')
      }

      setSuccess(!currentFeaturedStatus ? 'Product set as featured!' : 'Product unfeatured!')
      
      // Refresh products list to see updated featured status
      fetchProducts()
    } catch (err) {
      console.error('Toggle featured error:', err)
      setError('Error: ' + err.message)
    }
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return
    try {
      const response = await fetch('/api/products/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Bulk delete failed')
      setSuccess('Selected products deleted successfully!')
      setSelectedIds([])
      fetchProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!userChecked) return <main><Typography>Checking permissions...</Typography></main>
  if (loading) return <main><Typography>Loading...</Typography></main>
  if (error && !products.length) return <main><Typography color="error">Error: {error}</Typography></main>

  // DataGrid columns
  const columns = [
    {
      field: 'image_path',
      headerName: 'Image',
      width: 80,
      renderCell: (params) =>
        params.value ? (
          <img
            src={params.value}
            alt={params.row.name}
            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
          />
        ) : null,
      sortable: false,
      filterable: false,
    },
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'price', headerName: 'Price', width: 100, renderCell: (params) => `$${params.value}` },
    { field: 'category', headerName: 'Category', width: 120 },
    {
      field: 'review',
      headerName: 'Review',
      width: 120,
      renderCell: (params) => (
        <>
          <Rating value={(params.value || 0) / 2} readOnly precision={0.5} size="small" />
          <Typography variant="caption" sx={{ ml: 1 }}>
            {params.value || 0}/10
          </Typography>
        </>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'is_featured',
      headerName: 'Featured',
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Featured" color="primary" size="small" icon={<StarIcon />} />
        ) : (
          <Chip label="Not Featured" size="small" variant="outlined" />
        ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 220,
      renderCell: (params) => (
        <>
          <Button size="small" onClick={() => handleOpenEdit(params.row)}>Edit</Button>
          <IconButton
            color={params.row.is_featured ? 'warning' : 'default'}
            size="small"
            onClick={() => handleToggleFeatured(params.row._id, params.row.is_featured)}
            title={params.row.is_featured ? 'Unfeature Product' : 'Set as Featured'}
          >
            {params.row.is_featured ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
          <Button size="small" color="error" onClick={() => handleOpenDelete(params.row._id)}>Delete</Button>
        </>
      ),
      sortable: false,
      filterable: false,
    },
  ]

  return (
    <main>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Manage Products
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}
        onClick={handleOpenCreate}
      >
        Create Product
      </Button>

      <Button
        variant="contained"
        color="error"
        sx={{ mb: 2, ml: 2 }}
        disabled={!selectedIds.length}
        onClick={handleBulkDelete}
      >
        Bulk Delete
      </Button>

      <Box sx={{ height: 600, width: '100%', mb: 2 }}>
        <DataGrid
          rows={products.map(p => ({ ...p, id: p._id }))}
          columns={columns}
          checkboxSelection
          onRowSelectionModelChange={ids => setSelectedIds(ids)}
          rowSelectionModel={selectedIds}
          disableRowSelectionOnClick={false}
          loading={loading}
          getRowId={row => row._id}
        />
      </Box>

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Product' : 'Create Product'}</DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <TextField
              label="Price"
              type="number"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              required
            />
            <TextField
              label="Category"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              required
            />
            <TextField
              label="Description"
              multiline
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            <TextField
              label="Review Rating (0-10)"
              type="number"
              value={form.review}
              onChange={e => setForm({ ...form, review: e.target.value })}
              inputProps={{ min: 0, max: 10 }}
            />
            <Button variant="outlined" component="label" fullWidth>
              {imageFile ? imageFile.name : 'Upload Image'}
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </Button>
            {imagePreview && (
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} 
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">{editingId ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this product?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </main>
  )
}

export default Manage