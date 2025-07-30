import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Group from "@/models/Group"
import { getClientIP } from "@/lib/utils"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request) {
  try {
    await connectToDatabase()

    const { groupId, option } = await request.json()
    const clientIP = getClientIP(request)

    if (!groupId || !option) {
      return NextResponse.json({ error: "Group ID and option are required" }, { status: 400 })
    }

    const group = await Group.findById(groupId)
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    if (!group.isOpen) {
      return NextResponse.json({ error: "Voting is closed for this group" }, { status: 400 })
    }

    if (!group.options.includes(option)) {
      return NextResponse.json({ error: "Invalid option" }, { status: 400 })
    }

    // Check if user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user has already voted (by user ID)
    const hasVoted = group.votes.some((vote) => vote.userId && vote.userId.toString() === user._id.toString())
    if (hasVoted) {
      return NextResponse.json({ error: "You have already voted in this group" }, { status: 400 })
    }

    // Add vote with user ID
    group.votes.push({
      option,
      userId: user._id,
      ip: clientIP, // Keep IP for backup
      timestamp: new Date(),
    })

    await group.save()

    return NextResponse.json({
      success: true,
      message: "Vote recorded successfully",
    })
  } catch (error) {
    console.error("Error recording vote:", error)
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 })
  }
}
