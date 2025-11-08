const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  image_path: { type: String, required: true },
  price: { type: Number, required: true },
  review: { type: Number, default: 0 },
  description: { type: String, required: true }
});

module.exports = mongoose.model('Product', productSchema);
