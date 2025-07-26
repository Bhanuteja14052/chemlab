import { NextRequest, NextResponse } from 'next/server'
import { generatePossibleCompounds } from '@/utils/compoundPrediction'
import { ElementSpec } from '@/types/chemistry'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { elements } = body

    // Validate input
    if (!elements || !Array.isArray(elements)) {
      return NextResponse.json({ error: 'Elements array is required' }, { status: 400 })
    }

    // Convert elements to ElementSpec format if needed
    const elementSpecs: ElementSpec[] = elements.map((element: any) => {
      if (typeof element === 'string') {
        return { element, molecules: 1, weight: 1 }
      }
      return element
    })

    // Generate possible compounds
    const possibleCompounds = generatePossibleCompounds(elementSpecs)

    return NextResponse.json({
      success: true,
      compounds: possibleCompounds,
      count: possibleCompounds.length
    })

  } catch (error) {
    console.error('Error generating possible compounds:', error)
    return NextResponse.json(
      { error: 'Failed to generate possible compounds' },
      { status: 500 }
    )
  }
}
