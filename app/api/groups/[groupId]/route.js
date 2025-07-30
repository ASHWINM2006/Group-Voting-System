import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Group from "@/models/Group"
import { getClientIP } from "@/lib/utils"
import { requireAuth } from "@/lib/auth"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    await connectToDatabase()

    const { groupId } = params
    const clientIP = getClientIP(request)

    const group = await Group.findById(groupId)
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Get current user
    const user = await getCurrentUser()
    let hasVoted = false
    let isCreator = false

    if (user) {
      // Check if user has already voted (by user ID)
      hasVoted = group.votes.some((vote) => vote.userId && vote.userId.toString() === user._id.toString())

      // Check if user is the creator
      isCreator = group.creatorId.toString() === user._id.toString()
    } else {
      // Fallback to IP check for non-authenticated users
      hasVoted = group.votes.some((vote) => vote.ip === clientIP)
    }

    return NextResponse.json({
      group: {
        _id: group._id,
        title: group.title,
        description: group.description,
        options: group.options,
        isOpen: group.isOpen,
        createdAt: group.createdAt,
        votes: group.votes,
      },
      hasVoted,
      isCreator,
    })
  } catch (error) {
    console.error("Error fetching group:", error)
    return NextResponse.json({ error: "Failed to fetch group" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectToDatabase()

    const { groupId } = params
    const { isOpen } = await request.json()
    const clientIP = getClientIP(request)

    // Check if user is admin and owns the group
    const authResult = await requireAuth("admin")
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const group = await Group.findById(groupId)
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Check if user owns this group
    if (group.creatorId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    group.isOpen = isOpen
    await group.save()

    return NextResponse.json({
      success: true,
      group: {
        _id: group._id,
        title: group.title,
        description: group.description,
        options: group.options,
        isOpen: group.isOpen,
        createdAt: group.createdAt,
        votes: group.votes,
      },
    })
  } catch (error) {
    console.error("Error updating group:", error)
    return NextResponse.json({ error: "Failed to update group" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase()

    const { groupId } = params
    const clientIP = getClientIP(request)

    // Check if user is admin and owns the group
    const authResult = await requireAuth("admin")
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const group = await Group.findById(groupId)
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Check if user owns this group
    if (group.creatorId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await Group.findByIdAndDelete(groupId)

    return NextResponse.json({ success: true, message: "Group deleted successfully" })
  } catch (error) {
    console.error("Error deleting group:", error)
    return NextResponse.json({ error: "Failed to delete group" }, { status: 500 })
  }
}
