import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import { Experiment } from '@/models'

export async function POST(request: Request) {
  try {
    // Get the authenticated user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()
    const {
      mode,
      title,
      description,
      elements,
      temperature,
      pressure,
      volume,
      weight,
      result
    } = body

    // Validate required fields
    if (!mode || !title || !elements || !result) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Connect to database
    await connectDB()

    // Create new experiment
    const experiment = new Experiment({
      userId,
      mode,
      title,
      description: description || `${mode === 'play' ? 'Play Mode' : 'Practical Mode'} experiment: ${elements.map((el: any) => 
        typeof el === 'string' ? el : `${el.molecules}×${el.element}`
      ).join(' + ')}`,
      elements: elements.map((el: any) => typeof el === 'string' ? el : el.element),
      temperature,
      pressure,
      volume,
      weight,
      result: {
        compoundName: result.compoundName,
        chemicalFormula: result.chemicalFormula,
        color: result.color,
        state: result.state,
        safetyWarnings: result.safetyWarnings || [],
        explanation: result.explanation,
        reactionEquation: result.reactionEquation,
        finalTemperature: result.temperature,
        finalPressure: result.pressure
      },
      tags: [mode === 'play' ? 'Play Mode' : 'Practical Mode'],
      isPublic: false
    })

    // Save to database
    await experiment.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Experiment saved to journal successfully!',
      experimentId: experiment._id
    })

  } catch (error) {
    console.error('Error saving experiment:', error)
    return NextResponse.json({ 
      error: 'Failed to save experiment to journal' 
    }, { status: 500 })
  }
}
