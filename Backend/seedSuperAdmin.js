import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js"; // adjust path if needed
import bcrypt from "bcryptjs";

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await Admin.findOne({ email: "super@admin.com" });
    if (existing) {
      console.log("Super admin already exists.");
      process.exit(0);
    }
    
    // const hashedPassword = await bcrypt.hash("NIKKI123", 10);
    const superAdmin = await Admin.create({
      name: "Super Admin",
      email: "super@admin.com", 
      password: "NIKKI123",
      role: "super_admin",
    });

    console.log("✅ Super Admin created:", superAdmin.email);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding super admin:", err);
    process.exit(1);
  }
};

seedSuperAdmin();
