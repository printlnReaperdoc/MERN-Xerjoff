// seedProducts.js
import mongoose from "mongoose";

// MongoDB connection
const MONGO_URI = "mongodb+srv://axistheminecraftexpert:0829@cluster0.rzoaucu.mongodb.net/Xerjoff_MDB?retryWrites=true&w=majority";

// Product schema
const productSchema = new mongoose.Schema({
  name: String,
  slug: String, // added slug
  description: String,
  price: Number,
  category: String,
  review: Number, // out of 10
  image_path: String, // added image_path
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

// Example product list (will expand/repeat to reach 50)
const merchItems = [
  // Hololive
  { name: "Gawr Gura Plushie", category: "Plushie" },
  { name: "Houshou Marine Figure", category: "Figure" },
  { name: "Shirakami Fubuki Keychain", category: "Keychain" },
  { name: "Usada Pekora Hoodie", category: "Apparel" },
  { name: "Minato Aqua Mug", category: "Merchandise" },
  // BanG Dream!
  { name: "Kasumi Toyama Guitar Pick", category: "Music" },
  { name: "Ran Mitake Acrylic Stand", category: "Figure" },
  { name: "Yukina Minato T-shirt", category: "Apparel" },
  { name: "Aya Maruyama Badge Set", category: "Badge" },
  { name: "Eve Wakamiya Poster", category: "Poster" },
  // D4DJ
  { name: "Rinku Aimoto Figure", category: "Figure" },
  { name: "Maho Akashi DJ Cap", category: "Apparel" },
  { name: "Rei Togetsu Phone Case", category: "Merchandise" },
  { name: "Kyoko Yamate Sticker Pack", category: "Sticker" },
  { name: "Muni Ohnaruto Hoodie", category: "Apparel" },
  // Love Live!
  { name: "Honoka Kousaka Plushie", category: "Plushie" },
  { name: "Nico Yazawa T-shirt", category: "Apparel" },
  { name: "Umi Sonoda Notebook", category: "Stationery" },
  { name: "Chika Takami Keychain", category: "Keychain" },
  { name: "Riko Sakurauchi Poster", category: "Poster" },
];

// Make sure we have 50 total items
while (merchItems.length < 50) {
  merchItems.push(...merchItems);
}
const selectedMerch = merchItems.slice(0, 50);

// Function to generate random values
const randomPrice = () => (Math.floor(Math.random() * 50) + 10) * 100; // 1000–6000
const randomReview = () => (Math.floor(Math.random() * 10) + 1); // 1–10

// Slug generator
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .trim()
    .replace(/\s+/g, "-"); // replace spaces with -

// Main seeding function
const seedProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB ✅");

    // Clear old products (optional)
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Track used slugs for uniqueness
    const slugCount = {};

    // Prepare product data
    const products = selectedMerch.map(item => {
      let baseSlug = slugify(item.name);
      let slug = baseSlug;

      // Ensure uniqueness
      if (slugCount[baseSlug]) {
        slug = `${baseSlug}-${slugCount[baseSlug]}`;
        slugCount[baseSlug]++;
      } else {
        slugCount[baseSlug] = 1;
      }

      return {
        name: item.name,
        slug,
        description: `Official ${item.name} from ${item.category}. Perfect for fans and collectors!`,
        price: randomPrice(),
        category: item.category,
        review: randomReview(),
        image_path: "sample.image.jpg",
      };
    });

    // Insert products
    await Product.insertMany(products);
    console.log("✅ Successfully seeded 50 products with unique slugs!");

    process.exit();
  } catch (err) {
    console.error("Error seeding products:", err);
    process.exit(1);
  }
};

seedProducts();