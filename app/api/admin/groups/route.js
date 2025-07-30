import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Group from "@/models/Group"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const authResult = await requireAuth("admin")
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    await connectToDatabase()

    const groups = await Group.find().populate("creatorId", "username email").sort({ createdAt: -1 })

    return NextResponse.json({ groups })
  } catch (error) {
    console.error("Error fetching admin groups:", error)
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 })
  }
}
