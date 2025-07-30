// Demo Users Seeding Script
// Run this to create demo users in your MongoDB database

import { connectToDatabase } from "../lib/mongodb.js"
import User from "../models/User.js"

async function seedDemoUsers() {
  try {
    await connectToDatabase()

    // Check if demo users already exist
    const existingAdmin = await User.findOne({ email: "admin@demo.com" })
    const existingUser = await User.findOne({ email: "user@demo.com" })

    if (!existingAdmin) {
      const adminUser = new User({
        username: "admin",
        email: "admin@demo.com",
        password: "password123",
        role: "admin",
      })
      await adminUser.save()
      console.log("Demo admin user created: admin@demo.com / password123")
    } else {
      console.log("Demo admin user already exists")
    }

    if (!existingUser) {
      const regularUser = new User({
        username: "user",
        email: "user@demo.com",
        password: "password123",
        role: "user",
      })
      await regularUser.save()
      console.log("Demo regular user created: user@demo.com / password123")
    } else {
      console.log("Demo regular user already exists")
    }

    console.log("Demo users seeding completed!")
  } catch (error) {
    console.error("Error seeding demo users:", error)
  }
}

seedDemoUsers()
