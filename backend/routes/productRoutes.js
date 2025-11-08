const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get max price
router.get('/max-price', async (req, res) => {
  try {
    const maxPrice = await Product.findOne().sort('-price').select('price');
    res.json({ maxPrice: maxPrice ? maxPrice.price : 1000 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products with filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let query = {};

    // Name filter
    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: 'i' };
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Review filter
    if (req.query.review) {
      query.review = parseInt(req.query.review);
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseInt(req.query.maxPrice);
    }

    const products = await Product.find(query)
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      page,
      hasMore: products.length === limit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ...existing routes...

module.exports = router;
