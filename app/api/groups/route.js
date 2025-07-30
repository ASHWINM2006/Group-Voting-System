import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Group from "@/models/Group"
import { validateGroupData } from "@/lib/utils"
import { requireAuth } from "@/lib/auth"

export async function POST(request) {
  try {
    await connectToDatabase()

    const { title, description, options } = await request.json()

    // Validate input
    const errors = validateGroupData(title, description, options)
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 })
    }

    // Check if user is admin
    const authResult = await requireAuth("admin")
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult

    // Create new group
    const group = new Group({
      title: title.trim(),
      description: description.trim(),
      options: options.filter((opt) => opt.trim().length > 0),
      creatorId: user._id, // Use authenticated user ID
      votes: [],
      isOpen: true,
    })

    await group.save()

    return NextResponse.json({
      success: true,
      groupId: group._id.toString(),
      message: "Group created successfully",
    })
  } catch (error) {
    console.error("Error creating group:", error)
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 })
  }
}
