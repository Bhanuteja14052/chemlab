import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { geminiAI, ChemicalReactionParams } from '@/lib/gemini'
import connectDB from '@/lib/mongodb'
import { Experiment } from '@/models'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user (temporarily disabled for testing)
    const { userId } = await auth()
    // Temporarily allow unauthenticated access for testing
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Parse request body
    const body = await request.json()
    const { elements, temperature, pressure, volume, weight, mode, title } = body

    // Validate input
    if (!elements || !Array.isArray(elements) || elements.length === 0) {
      return NextResponse.json({ error: 'Elements array is required' }, { status: 400 })
    }

    if (!mode || !['play', 'practical'].includes(mode)) {
      return NextResponse.json({ error: 'Valid mode (play/practical) is required' }, { status: 400 })
    }

    // Prepare reaction parameters
    const reactionParams: ChemicalReactionParams = {
      elements,
      mode,
      ...(mode === 'practical' && {
        temperature: temperature || 25,
        pressure: pressure || 1,
        volume: volume || 100,
        weight: weight || 10
      })
    }

    // Get AI prediction
    const result = await geminiAI.predictReaction(reactionParams)

    // Save experiment to database
    await connectDB()
    
    // Convert ElementSpec array to string array for database storage
    const elementNames = Array.isArray(elements) && elements.length > 0 && typeof elements[0] === 'object'
      ? elements.map((spec: any) => spec.element)
      : elements;
    
    const experiment = new Experiment({
      userId,
      mode,
      title: title || `${elementNames.join(' + ')} Reaction`,
      elements: elementNames,
      temperature: reactionParams.temperature,
      pressure: reactionParams.pressure,
      volume: reactionParams.volume,
      weight: reactionParams.weight,
      result: {
        compoundName: result.compoundName,
        chemicalFormula: result.chemicalFormula,
        color: result.color,
        state: result.state,
        safetyWarnings: result.safetyWarnings,
        explanation: result.explanation,
        reactionEquation: result.reactionEquation,
        finalTemperature: result.temperature,
        finalPressure: result.pressure
      }
    })

    await experiment.save()

    // Return the prediction result
    return NextResponse.json({
      success: true,
      experimentId: experiment._id,
      result
    })

  } catch (error) {
    console.error('Error in reaction prediction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
