import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import { Experiment } from '@/models'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the authenticated user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Connect to database
    await connectDB()

    // Find and delete the experiment (only if it belongs to the user)
    const deletedExperiment = await Experiment.findOneAndDelete({
      _id: id,
      userId: userId
    })

    if (!deletedExperiment) {
      return NextResponse.json({ error: 'Experiment not found or not authorized' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Experiment deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting experiment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the authenticated user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Connect to database
    await connectDB()

    // Find the experiment (only if it belongs to the user)
    const experiment = await Experiment.findOne({
      _id: id,
      userId: userId
    })

    if (!experiment) {
      return NextResponse.json({ error: 'Experiment not found or not authorized' }, { status: 404 })
    }

    return NextResponse.json(experiment)

  } catch (error) {
    console.error('Error fetching experiment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
