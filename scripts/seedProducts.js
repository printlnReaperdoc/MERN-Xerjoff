// seedProducts.js
import mongoose from "mongoose";

// MongoDB Atlas connection
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

// Perfume product list (50 items)
const perfumeItems = [
  { name: "Xerjoff Naxos", category: "Eau de Parfum" },
  { name: "Xerjoff Alexandria II", category: "Eau de Parfum" },
  { name: "Xerjoff Uden", category: "Eau de Parfum" },
  { name: "Xerjoff Erba Pura", category: "Eau de Parfum" },
  { name: "Xerjoff Kobe", category: "Eau de Parfum" },
  { name: "Xerjoff Mefisto", category: "Eau de Parfum" },
  { name: "Xerjoff Lira", category: "Eau de Parfum" },
  { name: "Xerjoff Casamorati 1888", category: "Eau de Parfum" },
  { name: "Xerjoff Accento", category: "Eau de Parfum" },
  { name: "Xerjoff More Than Words", category: "Eau de Parfum" },
  { name: "Xerjoff Ouverture", category: "Eau de Parfum" },
  { name: "Xerjoff Symphonium", category: "Eau de Parfum" },
  { name: "Xerjoff Italica", category: "Eau de Parfum" },
  { name: "Xerjoff Dama Bianca", category: "Eau de Parfum" },
  { name: "Xerjoff La Tosca", category: "Eau de Parfum" },
  { name: "Xerjoff Fiero", category: "Eau de Parfum" },
  { name: "Xerjoff Gran Ballo", category: "Eau de Parfum" },
  { name: "Xerjoff Bouquet Ideale", category: "Eau de Parfum" },
  { name: "Xerjoff Dolce Amalfi", category: "Eau de Parfum" },
  { name: "Xerjoff Dama Bianca", category: "Eau de Parfum" },
  { name: "Xerjoff Laylati", category: "Eau de Parfum" },
  { name: "Xerjoff Shooting Stars", category: "Eau de Parfum" },
  { name: "Xerjoff Cruz del Sur II", category: "Eau de Parfum" },
  { name: "Xerjoff Lua", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Renaissance", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Zefiro", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Naxos", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Decas", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Magos", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Regio", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 X", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Amber Star", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Star Musk", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Oud Stars", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Alexandria Orientale", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Alexandria III", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Alexandria IV", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Alexandria V", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Alexandria VI", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Alexandria VII", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Alexandria VIII", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Alexandria IX", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Alexandria X", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Alexandria XI", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Alexandria XII", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Alexandria XIII", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Alexandria XIV", category: "Eau de Parfum" },
  { name: "Xerjoff XJ 1861 Alexandria XV", category: "Eau de Parfum" },
];

// Make sure we have 50 total items
while (perfumeItems.length < 50) {
  perfumeItems.push(...perfumeItems);
}
const selectedPerfumes = perfumeItems.slice(0, 50);

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
    const products = selectedPerfumes.map(item => {
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
        description: `Luxurious ${item.name} (${item.category}) by Xerjoff. Experience the finest in perfumery.`,
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
