import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import User from "@/models/User"
import { connectToDatabase } from "./mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function getCurrentUser() {
  try {
    await connectToDatabase()

    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return null
    }

    const user = await User.findById(decoded.userId).select("-password")
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function requireAuth(requiredRole = null) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Authentication required", status: 401 }
  }

  if (requiredRole && user.role !== requiredRole) {
    return { error: "Insufficient permissions", status: 403 }
  }

  return { user }
}
