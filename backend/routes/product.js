const express = require('express')
const router = express.Router()
const db = require('../db/db.js') // Adjust path based on your db file location
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { config } = require('process')

// ==================== MULTER CONFIGURATION ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'))
    }
  }
})

// ==================== MIDDLEWARE ====================
// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  const userId = req.headers['user-id']
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  req.userId = userId
  next()
}

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT role_id FROM users WHERE id = ?', [req.userId])
    if (rows.length === 0 || rows[0].role_id !== 1) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' })
    }
    next()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ==================== PUBLIC ROUTES ====================

// GET all products (public - for shop page)
router.get('/products', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET single product by slug (public)
router.get('/products/:slug', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE slug = ?', [req.params.slug])
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET featured product (public - for homepage)
router.get('/products/featured/current', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE is_featured = 1 LIMIT 1'
    )
    
    if (rows.length > 0) {
      res.json(rows[0])
    } else {
      res.status(404).json({ message: 'No featured product set' })
    }
  } catch (error) {
    console.error('Error fetching featured product:', error)
    res.status(500).json({ error: error.message })
  }
})

// ==================== ADMIN ROUTES ====================

// CREATE product (admin only)
router.post('/products', isAuthenticated, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body
    
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' })
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    // Check if slug already exists
    const [existing] = await db.query('SELECT id FROM products WHERE slug = ?', [slug])
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Product with similar name already exists' })
    }

    const imagePath = req.file ? req.file.filename : 'sample.image.jpg'

    const [result] = await db.query(
      'INSERT INTO products (name, slug, description, price, stock, category, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, slug, description || '', price, stock || 0, category || '', imagePath]
    )

    res.status(201).json({
      id: result.insertId,
      name,
      slug,
      description,
      price,
      stock,
      category,
      image: imagePath
    })
  } catch (error) {
    console.error('Error creating product:', error)
    res.status(500).json({ error: error.message })
  }
})

// UPDATE product (admin only)
router.put('/products/:id', isAuthenticated, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, price, stock, category } = req.body

    // Get existing product
    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const product = existing[0]

    // Generate new slug if name changed
    let slug = product.slug
    if (name && name !== product.name) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      
      // Check if new slug conflicts with another product
      const [slugCheck] = await db.query('SELECT id FROM products WHERE slug = ? AND id != ?', [slug, id])
      if (slugCheck.length > 0) {
        return res.status(400).json({ error: 'Product with similar name already exists' })
      }
    }

    // Handle image update
    let imagePath = product.image
    if (req.file) {
      // Delete old image if it exists and is not default
      if (product.image && product.image !== 'sample.image.jpg') {
        const oldImagePath = path.join('uploads', product.image)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }
      imagePath = req.file.filename
    }

    await db.query(
      'UPDATE products SET name = ?, slug = ?, description = ?, price = ?, stock = ?, category = ?, image = ? WHERE id = ?',
      [
        name || product.name,
        slug,
        description !== undefined ? description : product.description,
        price !== undefined ? price : product.price,
        stock !== undefined ? stock : product.stock,
        category !== undefined ? category : product.category,
        imagePath,
        id
      ]
    )

    res.json({ 
      message: 'Product updated successfully',
      id,
      name: name || product.name,
      slug,
      image: imagePath
    })
  } catch (error) {
    console.error('Error updating product:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE product (admin only)
router.delete('/products/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Get product to delete image
    const [rows] = await db.query('SELECT image FROM products WHERE id = ?', [id])
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const product = rows[0]

    // Delete image file if it exists and is not default
    if (product.image && product.image !== 'sample.image.jpg') {
      const imagePath = path.join('uploads', product.image)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    await db.query('DELETE FROM products WHERE id = ?', [id])

    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ error: error.message })
  }
})

// SET/UNSET featured product (admin only) - FIXED VERSION
router.patch('/products/:id/featured', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { is_featured } = req.body

    // Check if product exists
    const [rows] = await db.query('SELECT id FROM products WHERE id = ?', [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    if (is_featured) {
      // Unfeatured all products first
      await db.query('UPDATE products SET is_featured = 0')
      // Then set the new featured product
      await db.query('UPDATE products SET is_featured = 1 WHERE id = ?', [id])
    } else {
      // Just unfeatured this product
      await db.query('UPDATE products SET is_featured = 0 WHERE id = ?', [id])
    }

    res.json({ 
      message: is_featured ? 'Product set as featured' : 'Product unfeatured',
      is_featured: is_featured ? 1 : 0
    })
  } catch (error) {
    console.error('Error updating featured status:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router