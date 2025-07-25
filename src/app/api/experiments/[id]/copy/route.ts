import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import { Experiment } from '@/models'

export async function POST(
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
    const body = await request.json()
    const { newMode, newTitle } = body

    // Validate inputs
    if (!newMode || !newTitle) {
      return NextResponse.json({ error: 'New mode and title are required' }, { status: 400 })
    }

    if (!['play', 'practical'].includes(newMode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    // Connect to database
    await connectDB()

    // Find the original experiment
    const originalExperiment = await Experiment.findOne({
      _id: id,
      userId: userId
    })

    if (!originalExperiment) {
      return NextResponse.json({ error: 'Original experiment not found' }, { status: 404 })
    }

    // Create a copy with the new mode and title
    const copiedExperiment = new Experiment({
      userId,
      mode: newMode,
      title: newTitle,
      description: `Copied from ${originalExperiment.mode} mode: ${originalExperiment.title}`,
      elements: originalExperiment.elements,
      temperature: originalExperiment.temperature,
      pressure: originalExperiment.pressure,
      volume: originalExperiment.volume,
      weight: originalExperiment.weight,
      result: originalExperiment.result,
      isPublic: false,
      tags: [...(originalExperiment.tags || []), 'copied']
    })

    const savedExperiment = await copiedExperiment.save()

    return NextResponse.json({
      success: true,
      experiment: savedExperiment,
      message: `Experiment copied to ${newMode} mode successfully`
    })

  } catch (error) {
    console.error('Error copying experiment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
