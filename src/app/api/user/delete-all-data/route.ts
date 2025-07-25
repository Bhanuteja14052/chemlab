import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import { Experiment, UserProfile } from '@/models'

export async function DELETE() {
  try {
    // Get the authenticated user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Connect to database
    await connectDB()

    // Delete all user experiments
    await Experiment.deleteMany({ userId })

    // Delete user profile if exists
    await UserProfile.deleteOne({ userId })

    return NextResponse.json({ 
      success: true, 
      message: 'All user data deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting user data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
