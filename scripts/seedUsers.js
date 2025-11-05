// seedUsers.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// MongoDB Atlas connection
const MONGO_URI = "mongodb+srv://axistheminecraftexpert:0829@cluster0.rzoaucu.mongodb.net/Xerjoff_MDB?retryWrites=true&w=majority";

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  status_id: Number,
  role_id: Number,
  profileImage: { type: String, default: "defaultuserpic.png" },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// Example character names from Hololive, BanG Dream!, D4DJ, Love Live!
const characterNames = [
  // Hololive
  "Gawr Gura", "Houshou Marine", "Shirakami Fubuki", "Minato Aqua", "Tokino Sora",
  "Amane Kanata", "Kiryu Coco", "Usada Pekora", "Inugami Korone", "Natsuiro Matsuri",
  // BanG Dream!
  "Kasumi Toyama", "Ran Mitake", "Aya Maruyama", "Kokoro Tsurumaki", "Rinko Shirokane",
  "Hina Hikawa", "Yukina Minato", "Arisa Ichigaya", "Saya Yamabuki", "Eve Wakamiya",
  // D4DJ
  "Rinku Aimoto", "Maho Akashi", "Muni Ohnaruto", "Rei Togetsu",
  "Kyoko Yamate", "Shinobu Inuyose", "Haruna Kasuga", "Tsubaki Aoyagi",
  "Miiko Takeshita", "Esora Shimizu",
  // Love Live!
  "Honoka Kousaka", "Umi Sonoda", "Kotori Minami", "Eli Ayase", "Nico Yazawa",
  "Chika Takami", "Riko Sakurauchi", "You Watanabe", "Ruby Kurosawa", "Dia Kurosawa",
  "Ayumu Uehara", "Kasumi Nakasu", "Setsuna Yuki", "Karin Asaka", "Ai Miyashita"
];

// Ensure we have at least 50 names (repeat if needed)
while (characterNames.length < 50) {
  characterNames.push(...characterNames);
}
const selectedNames = characterNames.slice(0, 50);

// Main seeding function
const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB ✅");

    // Clear old users (optional)
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Hash password "0829"
    const hashedPassword = await bcrypt.hash("0829", 10);

    // Prepare users
    const users = selectedNames.map((name, index) => {
      const email = name.toLowerCase().replace(/[^a-z0-9]/g, "") + "@example.com";

      // Default role_id 2, status_id 1
      let role_id = 2;
      let status_id = 1;

      if (index === 0) {
        role_id = 1; // 1st user: role_id 1
      } else if (index === 1) {
        role_id = 2;
        status_id = 2; // 2nd user: role_id 2, status_id 2
      }

      return {
        name,
        email,
        password: hashedPassword,
        role_id,
        status_id,
        profileImage: "defaultuserpic.png",
      };
    });

    // Insert users
    await User.insertMany(users);
    console.log("✅ Successfully seeded 50 users!");

    process.exit();
  } catch (err) {
    console.error("Error seeding users:", err);
    process.exit(1);
  }
};

seedUsers();
