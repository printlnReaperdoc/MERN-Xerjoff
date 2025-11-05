import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from frontend/public for image access
app.use('/public', express.static(path.join(process.cwd(), '../frontend/public')));

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(process.cwd(), '../frontend/public/uploads');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// Product model
const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  price: Number,
  category: String,
  review: Number,
  image_path: String,
  is_featured: { type: Boolean, default: false },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// User model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  status_id: Number,
  role_id: Number,
  profileImage: { type: String, default: "defaultuserpic.png" },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// ==================== MIDDLEWARE ====================
const isAuthenticated = (req, res, next) => {
  const userId = req.headers['user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.userId = userId;
  next();
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role_id !== 1) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== GENERAL ROUTES ====================
app.get("/api", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// ==================== PRODUCT ROUTES ====================

// GET featured product (PUBLIC - for homepage) - MUST BE FIRST!
app.get('/api/products/featured', async (req, res) => {
  try {
    const product = await Product.findOne({ is_featured: true });
    
    if (!product) {
      return res.status(404).json({ message: 'No featured product set' });
    }
    
    res.json(product);
  } catch (err) {
    console.error('Error fetching featured product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET product by slug
app.get('/api/products/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all products (with optional name filter)
app.get('/api/products', async (req, res) => {
  try {
    const { name } = req.query;
    let filter = {};
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload image endpoint
app.post('/api/products/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const image_path = `/public/uploads/${req.file.filename}`;
  res.json({ image_path });
});

// Create product (ADMIN ONLY)
app.post('/api/products', async (req, res) => {
  try {
    const { name, slug, description, price, category, image_path } = req.body;
    const product = new Product({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      price,
      category,
      review: 0,
      image_path,
      is_featured: false,
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product (ADMIN ONLY)
app.put('/api/products/:id', async (req, res) => {
  try {
    const { name, slug, description, price, category, review, image_path } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        price,
        category,
        review,
        image_path,
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product (ADMIN ONLY)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// SET/UNSET featured product (ADMIN ONLY)
app.patch('/api/products/:id/featured', async (req, res) => {
  try {
    const { is_featured } = req.body;

    // Check if product exists
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (is_featured) {
      // Unfeatured all products first (only one can be featured)
      await Product.updateMany({}, { is_featured: false });
    }

    // Set featured status for this product
    product.is_featured = is_featured;
    await product.save();

    res.json({ 
      message: is_featured ? 'Product set as featured' : 'Product unfeatured',
      product
    });
  } catch (err) {
    console.error('Error updating featured status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== USER ROUTES ====================

// Register route
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, status_id, role_id, profileImage } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, status_id, role_id, profileImage });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.status_id === 2) {
      return res.status(403).json({ error: 'User is deactivated' });
    }
    res.json({ 
      message: 'Login successful', 
      user: { 
        id: user._id,
        name: user.name, 
        email: user.email, 
        status_id: user.status_id, 
        role_id: user.role_id,
        profileImage: user.profileImage || 'defaultuserpic.png'
      } 
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout route
app.post('/api/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

// Upload profile image endpoint
app.post('/api/upload-profile-image', upload.single('profileImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ filename: `uploads/${req.file.filename}` });
});

// Serve uploaded profile images
app.use('/uploads', express.static(path.join(process.cwd(), '../frontend/public/uploads')));

// GET all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email, status_id, role_id, profileImage, password } = req.body;

    let updateFields = { name, email, status_id, role_id, profileImage };

    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));