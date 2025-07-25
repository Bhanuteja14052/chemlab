import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import { Experiment } from '@/models'

export async function GET(request: Request) {
  try {
    // Get the authenticated user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') // 'play', 'practical', or null for all
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    // Connect to database
    await connectDB()

    // Build query
    const query: any = { userId }
    if (mode && (mode === 'play' || mode === 'practical')) {
      query.mode = mode
    }

    // Get experiments with pagination, sorted by creation date (newest first)
    const skip = (page - 1) * limit
    const experiments = await Experiment
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const totalCount = await Experiment.countDocuments(query)

    // Format the response
    const formattedExperiments = experiments.map((exp: any) => ({
      id: exp._id.toString(),
      mode: exp.mode,
      title: exp.title,
      description: exp.description,
      elements: exp.elements,
      result: exp.result,
      tags: exp.tags || [exp.mode === 'play' ? 'Play Mode' : 'Practical Mode'],
      createdAt: exp.createdAt,
      updatedAt: exp.updatedAt,
      parameters: {
        temperature: exp.temperature,
        pressure: exp.pressure,
        volume: exp.volume,
        weight: exp.weight
      }
    }))

    return NextResponse.json({
      success: true,
      experiments: formattedExperiments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: skip + experiments.length < totalCount
      }
    })

  } catch (error) {
    console.error('Error fetching experiment history:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch experiment history' 
    }, { status: 500 })
  }
}
