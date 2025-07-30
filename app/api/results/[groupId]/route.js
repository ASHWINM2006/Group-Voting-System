import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Group from "@/models/Group"

export async function GET(request, { params }) {
  try {
    await connectToDatabase()

    const { groupId } = params

    const group = await Group.findById(groupId)
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Calculate results
    const voteCounts = {}
    group.options.forEach((option) => {
      voteCounts[option] = 0
    })

    group.votes.forEach((vote) => {
      if (voteCounts.hasOwnProperty(vote.option)) {
        voteCounts[vote.option]++
      }
    })

    const results = group.options.map((option) => ({
      option,
      votes: voteCounts[option],
    }))

    // Sort by vote count (descending)
    results.sort((a, b) => b.votes - a.votes)

    return NextResponse.json({
      group: {
        _id: group._id,
        title: group.title,
        description: group.description,
        options: group.options,
        isOpen: group.isOpen,
        createdAt: group.createdAt,
      },
      results,
    })
  } catch (error) {
    console.error("Error fetching results:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}
