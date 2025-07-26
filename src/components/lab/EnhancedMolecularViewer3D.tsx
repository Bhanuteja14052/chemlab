'use client'

import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, Text } from '@react-three/drei'
import * as THREE from 'three'
import { RotateCcw, AlertTriangle, CheckCircle, XCircle, Info, Download, Eye, EyeOff, Image, Box } from 'lucide-react'
import { geminiAI } from '@/lib/gemini'
import ClientOnly from '@/components/common/ClientOnly'

interface Atom {
  element: string
  position: [number, number, number]
  color: string
  radius: number
  bonds: number[]
  hybridization?: string
  formalCharge?: number
}

interface Bond {
  start: [number, number, number]
  end: [number, number, number]
  type: 'single' | 'double' | 'triple' | 'aromatic'
  length: number
  startAtomIndex: number
  endAtomIndex: number
}

interface MolecularData {
  name: string
  formula: string
  atoms: Atom[]
  bonds: Bond[]
  geometry: string
  isValid: boolean
  source: 'ai' | 'generated' | 'fallback' | 'pubchem'
  errors?: string[]
  validation: {
    atomCount: { expected: number; actual: number; isCorrect: boolean }
    bondAngles: Array<{ atoms: [number, number, number]; expected: number; actual: number; deviation: number }>
    bondLengths: Array<{ atoms: [number, number]; expected: number; actual: number; deviation: number }>
    geometry: { expected: string; actual: string; isCorrect: boolean }
    hybridization: { [atomIndex: number]: { expected: string; actual: string; isCorrect: boolean } }
  }
}

interface EnhancedMolecularViewer3DProps {
  compound: Array<{ element: string; molecules: number; weight: number }> | string
  reactionResult?: any
  onDataExport?: (data: any) => void
  showValidation?: boolean
  mode?: '2D' | '3D'
}

// Enhanced Molecule3D component with accurate rendering
const Molecule3D: React.FC<{ molecularData: MolecularData }> = ({ molecularData }) => {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (groupRef.current && molecularData.atoms.length > 1) {
      // Center the molecule at origin
      const avgPosition = molecularData.atoms.reduce(
        (acc, atom) => [
          acc[0] + atom.position[0],
          acc[1] + atom.position[1],
          acc[2] + atom.position[2]
        ],
        [0, 0, 0]
      ).map(sum => sum / molecularData.atoms.length)
      
      groupRef.current.position.set(-avgPosition[0], -avgPosition[1], -avgPosition[2])
    }
  }, [molecularData])

  return (
    <group ref={groupRef}>
      {/* Render Atoms */}
      {molecularData.atoms.map((atom, index) => (
        <group key={index} position={atom.position}>
          <Sphere args={[atom.radius, 32, 32]}>
            <meshPhongMaterial 
              color={atom.color} 
              shininess={100}
              specular={0x222222}
            />
          </Sphere>
          
          {/* Atom label */}
          <Text
            position={[0, atom.radius + 0.3, 0]}
            fontSize={0.3}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            {atom.element}
            {atom.formalCharge !== 0 && atom.formalCharge !== undefined && 
              (atom.formalCharge > 0 ? `+${atom.formalCharge}` : `${atom.formalCharge}`)}
          </Text>
          
          {/* Hybridization label */}
          {atom.hybridization && (
            <Text
              position={[0, -atom.radius - 0.3, 0]}
              fontSize={0.2}
              color="blue"
              anchorX="center"
              anchorY="middle"
            >
              {atom.hybridization}
            </Text>
          )}
        </group>
      ))}

      {/* Render Bonds */}
      {molecularData.bonds.map((bond, index) => {
        const start = new THREE.Vector3(...bond.start)
        const end = new THREE.Vector3(...bond.end)
        const direction = end.clone().sub(start)
        const length = direction.length()
        const center = start.clone().add(end).multiplyScalar(0.5)
        
        // Calculate rotation
        const up = new THREE.Vector3(0, 1, 0)
        const axis = up.clone().cross(direction.normalize())
        const angle = Math.acos(up.dot(direction.normalize()))

        return (
          <group key={index} position={center.toArray()}>
            <mesh rotation={[angle, 0, 0]}>
              <cylinderGeometry args={[
                bond.type === 'single' ? 0.05 : 
                bond.type === 'double' ? 0.04 : 0.03, 
                bond.type === 'single' ? 0.05 : 
                bond.type === 'double' ? 0.04 : 0.03, 
                length, 
                8
              ]} />
              <meshPhongMaterial 
                color={bond.type === 'single' ? '#666666' : 
                       bond.type === 'double' ? '#444444' : '#222222'} 
              />
            </mesh>
            
            {/* Double/Triple bond additional cylinders */}
            {bond.type === 'double' && (
              <mesh position={[0.1, 0, 0]} rotation={[angle, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.04, length, 8]} />
                <meshPhongMaterial color="#444444" />
              </mesh>
            )}
            
            {bond.type === 'triple' && (
              <>
                <mesh position={[0.08, 0, 0]} rotation={[angle, 0, 0]}>
                  <cylinderGeometry args={[0.03, 0.03, length, 8]} />
                  <meshPhongMaterial color="#222222" />
                </mesh>
                <mesh position={[-0.08, 0, 0]} rotation={[angle, 0, 0]}>
                  <cylinderGeometry args={[0.03, 0.03, length, 8]} />
                  <meshPhongMaterial color="#222222" />
                </mesh>
              </>
            )}
          </group>
        )
      })}
    </group>
  )
}

const EnhancedMolecularViewer3D: React.FC<EnhancedMolecularViewer3DProps> = ({ 
  compound, 
  reactionResult, 
  onDataExport, 
  showValidation = true,
  mode = '3D'
}) => {
  const [molecularData, setMolecularData] = useState<MolecularData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRotating, setIsRotating] = useState(true)
  const [viewMode, setViewMode] = useState<'2D' | '3D'>(mode)
  const [pubchemImage, setPubchemImage] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    generateAccurateMolecularStructure()
  }, [compound, reactionResult])

  const generateAccurateMolecularStructure = async () => {
    setLoading(true)
    setError(null)
    setImageError(false)

    try {
      let formulaToAnalyze = ''
      
      if (typeof compound === 'string') {
        formulaToAnalyze = compound
      } else if (reactionResult?.chemicalFormula) {
        formulaToAnalyze = reactionResult.chemicalFormula
      } else if (Array.isArray(compound) && compound.length > 0) {
        // Generate a simple formula from elements
        formulaToAnalyze = compound.map(c => c.element).join('')
      }

      if (!formulaToAnalyze) {
        throw new Error('No valid formula to analyze')
      }

      // Clean the formula for analysis
      const cleanFormula = formulaToAnalyze.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (match) => {
        const map: { [key: string]: string } = {
          '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
          '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'
        }
        return map[match] || match
      })

      console.log('Generating molecular structure for:', cleanFormula)

      // Try to get PubChem 2D image as fallback - try compound name first, then formula
      try {
        let pubchemUrl = null
        
        // Try compound name first if available
        if (reactionResult?.compoundName) {
          pubchemUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(reactionResult.compoundName)}/PNG`
          try {
            const response = await fetch(pubchemUrl, { method: 'HEAD' })
            if (response.ok) {
              setPubchemImage(pubchemUrl)
            } else {
              throw new Error('Compound name not found')
            }
          } catch {
            // Try with formula instead
            pubchemUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(cleanFormula)}/PNG`
            setPubchemImage(pubchemUrl)
          }
        } else {
          // Use formula directly
          pubchemUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(cleanFormula)}/PNG`
          setPubchemImage(pubchemUrl)
        }
      } catch (e) {
        console.log('Could not load PubChem image')
        setPubchemImage(null)
      }

      try {
        // Attempt to get molecular structure from AI
        const structureData = await geminiAI.getMolecularStructure(cleanFormula)
        
        if (structureData && structureData.structure) {
          const validatedData = await validateMolecularStructure(structureData.structure, cleanFormula)
          
          if (validatedData.validation.atomCount.isCorrect) {
            setMolecularData(validatedData)
            setError(null)
          } else {
            // Atom count mismatch - use 2D fallback
            console.log('Atom count mismatch detected, using 2D fallback')
            setViewMode('2D')
            setMolecularData(null)
            if (!pubchemImage) {
              setError('Molecular structure validation failed. No accurate 3D model available.')
            }
          }
        } else {
          throw new Error('No structure data received')
        }
      } catch (structureError) {
        console.log('AI structure generation failed, using 2D fallback:', structureError)
        
        // Generate fallback 2D structure
        const fallbackData = generateFallback2DStructure(cleanFormula)
        if (fallbackData) {
          setMolecularData(fallbackData)
          setViewMode('2D')
        } else if (!pubchemImage) {
          setError('Could not generate molecular structure. No reliable data available.')
        }
      }

    } catch (err: any) {
      console.error('Error generating molecular structure:', err)
      setError(err.message || 'Failed to generate molecular structure')
      setMolecularData(null)
    } finally {
      setLoading(false)
    }
  }

  const validateMolecularStructure = async (structure: any, formula: string): Promise<MolecularData> => {
    const expectedAtomCount = countAtomsInFormula(formula)
    const actualAtomCount = structure.atoms?.length || 0
    
    return {
      name: structure.name || `${formula} Molecule`,
      formula: formula,
      atoms: structure.atoms || [],
      bonds: structure.bonds || [],
      geometry: structure.geometry || 'unknown',
      isValid: expectedAtomCount === actualAtomCount,
      source: structure.source || 'ai',
      validation: {
        atomCount: {
          expected: expectedAtomCount,
          actual: actualAtomCount,
          isCorrect: expectedAtomCount === actualAtomCount
        },
        bondAngles: structure.bondAngles || [],
        bondLengths: structure.bondLengths || [],
        geometry: {
          expected: structure.expectedGeometry || structure.geometry,
          actual: structure.geometry,
          isCorrect: true
        },
        hybridization: structure.hybridization || {}
      }
    }
  }

  const countAtomsInFormula = (formula: string): number => {
    const matches = formula.match(/[A-Z][a-z]?\d*/g) || []
    let totalAtoms = 0
    
    for (const match of matches) {
      const count = parseInt(match.match(/\d+/)?.[0] || '1')
      totalAtoms += count
    }
    
    return totalAtoms
  }

  const generateFallback2DStructure = (formula: string): MolecularData | null => {
    // Simple fallback for common molecules
    const knownMolecules: { [key: string]: MolecularData } = {
      'H2O': {
        name: 'Water',
        formula: 'H2O',
        atoms: [
          { element: 'O', position: [0, 0, 0], color: '#ff0000', radius: 0.3, bonds: [1, 2] },
          { element: 'H', position: [0.8, 0.6, 0], color: '#ffffff', radius: 0.2, bonds: [0] },
          { element: 'H', position: [-0.8, 0.6, 0], color: '#ffffff', radius: 0.2, bonds: [0] }
        ],
        bonds: [
          { start: [0, 0, 0], end: [0.8, 0.6, 0], type: 'single', length: 0.96, startAtomIndex: 0, endAtomIndex: 1 },
          { start: [0, 0, 0], end: [-0.8, 0.6, 0], type: 'single', length: 0.96, startAtomIndex: 0, endAtomIndex: 2 }
        ],
        geometry: 'bent',
        isValid: true,
        source: 'fallback',
        validation: {
          atomCount: { expected: 3, actual: 3, isCorrect: true },
          bondAngles: [],
          bondLengths: [],
          geometry: { expected: 'bent', actual: 'bent', isCorrect: true },
          hybridization: {}
        }
      },
      'CO2': {
        name: 'Carbon Dioxide',
        formula: 'CO2',
        atoms: [
          { element: 'C', position: [0, 0, 0], color: '#000000', radius: 0.3, bonds: [1, 2] },
          { element: 'O', position: [1.2, 0, 0], color: '#ff0000', radius: 0.3, bonds: [0] },
          { element: 'O', position: [-1.2, 0, 0], color: '#ff0000', radius: 0.3, bonds: [0] }
        ],
        bonds: [
          { start: [0, 0, 0], end: [1.2, 0, 0], type: 'double', length: 1.16, startAtomIndex: 0, endAtomIndex: 1 },
          { start: [0, 0, 0], end: [-1.2, 0, 0], type: 'double', length: 1.16, startAtomIndex: 0, endAtomIndex: 2 }
        ],
        geometry: 'linear',
        isValid: true,
        source: 'fallback',
        validation: {
          atomCount: { expected: 3, actual: 3, isCorrect: true },
          bondAngles: [],
          bondLengths: [],
          geometry: { expected: 'linear', actual: 'linear', isCorrect: true },
          hybridization: {}
        }
      }
    }

    return knownMolecules[formula] || null
  }

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === '2D' ? '3D' : '2D')
  }, [])

  const downloadStructure = useCallback(async () => {
    try {
      if (viewMode === '3D' && molecularData) {
        // Download 3D structure as JSON
        const structureData = {
          ...molecularData,
          exportedAt: new Date().toISOString(),
          format: '3D_JSON'
        }
        
        const blob = new Blob([JSON.stringify(structureData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${molecularData.formula}_3D_structure.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else if (viewMode === '2D' && pubchemImage) {
        // Download 2D image
        try {
          const response = await fetch(pubchemImage)
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${molecularData?.formula || 'molecule'}_2D_structure.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        } catch (e) {
          console.error('Failed to download 2D image:', e)
        }
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }, [viewMode, molecularData, pubchemImage])
        formulaToAnalyze = reactionResult.chemicalFormula
      } else if (Array.isArray(compound) && compound.length > 0) {
        // Create simple formula from elements
        formulaToAnalyze = compound.map(c => 
          c.molecules > 1 ? `${c.element}${c.molecules}` : c.element
        ).join('')
      }

      if (!formulaToAnalyze) {
        throw new Error('No valid formula to analyze')
      }

      console.log('Getting molecular structure for:', formulaToAnalyze)
      
      // Get enhanced molecular structure from Gemini
      const structureData = await geminiAI.getMolecularStructure(formulaToAnalyze)
      
      // Validate and convert to our format
      const validatedData = validateAndConvertStructure(structureData, formulaToAnalyze)
      
      setMolecularData(validatedData)
      
    } catch (err: any) {
      console.error('Error generating molecular structure:', err)
      setError(err.message || 'Failed to generate molecular structure')
      
      // Generate fallback structure
      const fallbackData = generateFallbackStructure()
      setMolecularData(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  const validateAndConvertStructure = (structureData: any, formula: string): MolecularData => {
    const expectedAtomCount = countAtomsInFormula(formula)
    const actualAtomCount = structureData.atoms?.length || 0
    
    // Convert atoms format
    const atoms: Atom[] = (structureData.atoms || []).map((atom: any, index: number) => ({
      element: atom.element,
      position: atom.position || [0, 0, 0],
      color: getElementColor(atom.element),
      radius: getElementRadius(atom.element),
      bonds: atom.bonds || [],
      hybridization: structureData.hybridization?.[index.toString()],
      formalCharge: atom.formalCharge || 0
    }))

    // Convert bonds format
    const bonds: Bond[] = (structureData.bonds || []).map((bond: any) => ({
      start: atoms[bond.atoms[0]]?.position || [0, 0, 0],
      end: atoms[bond.atoms[1]]?.position || [1, 0, 0],
      type: bond.type || 'single',
      length: bond.length || 1.5,
      startAtomIndex: bond.atoms[0],
      endAtomIndex: bond.atoms[1]
    }))

    // Validation checks
    const validation = {
      atomCount: {
        expected: expectedAtomCount,
        actual: actualAtomCount,
        isCorrect: Math.abs(expectedAtomCount - actualAtomCount) <= 1 // Allow small variance
      },
      bondAngles: validateBondAngles(structureData.bondAngles || [], atoms),
      bondLengths: validateBondLengths(bonds),
      geometry: {
        expected: structureData.vseprData?.geometry || 'unknown',
        actual: structureData.geometry || 'unknown',
        isCorrect: structureData.vseprData?.geometry === structureData.geometry
      },
      hybridization: validateHybridization(structureData.hybridization || {}, atoms)
    }

    return {
      name: reactionResult?.compoundName || formula,
      formula: formula,
      atoms,
      bonds,
      geometry: structureData.geometry || 'unknown',
      isValid: validation.atomCount.isCorrect && validation.geometry.isCorrect,
      source: 'gemini',
      validation
    }
  }

  const countAtomsInFormula = (formula: string): number => {
    const matches = formula.match(/[A-Z][a-z]?\d*/g) || []
    return matches.reduce((total, match) => {
      const numberMatch = match.match(/\d+/)
      const count = numberMatch ? parseInt(numberMatch[0]) : 1
      return total + count
    }, 0)
  }

  const validateBondAngles = (expectedAngles: any[], atoms: Atom[]) => {
    return expectedAngles.map(angleData => ({
      atoms: angleData.atoms,
      expected: angleData.angle,
      actual: calculateActualBondAngle(angleData.atoms, atoms),
      deviation: Math.abs(angleData.angle - calculateActualBondAngle(angleData.atoms, atoms))
    }))
  }

  const calculateActualBondAngle = (atomIndices: [number, number, number], atoms: Atom[]): number => {
    if (atomIndices.some(i => i >= atoms.length)) return 0
    
    const [a, b, c] = atomIndices.map(i => new THREE.Vector3(...atoms[i].position))
    const v1 = a.sub(b).normalize()
    const v2 = c.sub(b).normalize()
    const angle = Math.acos(v1.dot(v2)) * (180 / Math.PI)
    return Math.round(angle * 10) / 10 // Round to 1 decimal place
  }

  const validateBondLengths = (bonds: Bond[]) => {
    return bonds.map(bond => {
      const expectedLength = getStandardBondLength(bond.type)
      return {
        atoms: [bond.startAtomIndex, bond.endAtomIndex] as [number, number],
        expected: expectedLength,
        actual: bond.length,
        deviation: Math.abs(expectedLength - bond.length)
      }
    })
  }

  const validateHybridization = (hybridizationData: any, atoms: Atom[]) => {
    const result: any = {}
    atoms.forEach((atom, index) => {
      const expected = getExpectedHybridization(atom.element, atom.bonds.length)
      const actual = hybridizationData[index.toString()] || 'unknown'
      result[index] = {
        expected,
        actual,
        isCorrect: expected === actual
      }
    })
    return result
  }

  const getElementColor = (element: string): string => {
    const colors: {[key: string]: string} = {
      'H': '#ffffff', 'C': '#404040', 'N': '#3050f8', 'O': '#ff0d0d',
      'F': '#90e050', 'S': '#ffff30', 'P': '#ff8000', 'Cl': '#1ff01f',
      'Br': '#a62929', 'I': '#940094'
    }
    return colors[element] || '#cccccc'
  }

  const getElementRadius = (element: string): number => {
    const radii: {[key: string]: number} = {
      'H': 0.3, 'C': 0.4, 'N': 0.35, 'O': 0.32, 'F': 0.28,
      'S': 0.5, 'P': 0.45, 'Cl': 0.47, 'Br': 0.52, 'I': 0.58
    }
    return radii[element] || 0.4
  }

  const getStandardBondLength = (bondType: string): number => {
    const lengths = {
      'single': 1.54,
      'double': 1.34,
      'triple': 1.20,
      'aromatic': 1.40
    }
    return lengths[bondType as keyof typeof lengths] || 1.54
  }

  const getExpectedHybridization = (element: string, bondCount: number): string => {
    if (element === 'C') {
      if (bondCount === 4) return 'sp3'
      if (bondCount === 3) return 'sp2'
      if (bondCount === 2) return 'sp'
    }
    if (element === 'N') {
      if (bondCount === 3) return 'sp3'
      if (bondCount === 2) return 'sp2'
    }
    if (element === 'O') {
      if (bondCount === 2) return 'sp3'
    }
    return 'unknown'
  }

  const generateFallbackStructure = (): MolecularData => {
    return {
      name: 'Unknown Compound',
      formula: 'Unknown',
      atoms: [{
        element: 'C',
        position: [0, 0, 0],
        color: '#404040',
        radius: 0.4,
        bonds: []
      }],
      bonds: [],
      geometry: 'unknown',
      isValid: false,
      source: 'fallback',
      validation: {
        atomCount: { expected: 1, actual: 1, isCorrect: false },
        bondAngles: [],
        bondLengths: [],
        geometry: { expected: 'unknown', actual: 'unknown', isCorrect: false },
        hybridization: {}
      }
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Generating molecular structure...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {view2D ? '2D' : '3D'} Molecular Structure
          {molecularData && (
            <span className="ml-2 text-sm text-gray-600">
              ({molecularData.formula})
            </span>
          )}
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView2D(!view2D)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Eye className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          
          {onDataExport && molecularData && (
            <button
              onClick={() => onDataExport(molecularData)}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Validation Panel */}
      {showValidation && molecularData && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center">
            <Info className="h-4 w-4 mr-1" />
            Structure Validation
          </h4>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center">
              {molecularData.validation.atomCount.isCorrect ? 
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" /> :
                <XCircle className="h-3 w-3 text-red-500 mr-1" />
              }
              <span>Atom Count: {molecularData.validation.atomCount.actual}/{molecularData.validation.atomCount.expected}</span>
            </div>
            
            <div className="flex items-center">
              {molecularData.validation.geometry.isCorrect ? 
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" /> :
                <XCircle className="h-3 w-3 text-red-500 mr-1" />
              }
              <span>Geometry: {molecularData.geometry}</span>
            </div>
            
            <div className="flex items-center">
              <Info className="h-3 w-3 text-blue-500 mr-1" />
              <span>Bonds: {molecularData.bonds.length}</span>
            </div>
            
            <div className="flex items-center">
              <Info className="h-3 w-3 text-blue-500 mr-1" />
              <span>Source: {molecularData.source}</span>
            </div>
          </div>
        </div>
      )}

  // Export data callback
  useEffect(() => {
    if (onDataExport && molecularData) {
      onDataExport({
        structure: molecularData,
        formula: molecularData.formula,
        atoms: molecularData.atoms.length,
        bonds: molecularData.bonds.length,
        isValid: molecularData.isValid
      })
    }
  }, [molecularData, onDataExport])

  return (
    <ClientOnly fallback={
      <div className="bg-white rounded-lg border p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <div className="bg-white rounded-lg border p-4">
        {/* Header with controls */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Molecular Structure Analysis</h3>
          
          <div className="flex items-center space-x-2">
            {/* Toggle 2D/3D View */}
            <button
              onClick={toggleViewMode}
              className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              title={`Switch to ${viewMode === '2D' ? '3D' : '2D'} view`}
            >
              {viewMode === '2D' ? (
                <>
                  <Box className="h-4 w-4 mr-1" />
                  <span>3D</span>
                </>
              ) : (
                <>
                  <Image className="h-4 w-4 mr-1" />
                  <span>2D</span>
                </>
              )}
            </button>
            
            {/* Download Button */}
            <button
              onClick={downloadStructure}
              className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
              title="Download structure"
              disabled={!molecularData && !pubchemImage}
            >
              <Download className="h-4 w-4 mr-1" />
              <span>Download</span>
            </button>
            
            {/* Auto-rotate toggle for 3D */}
            {viewMode === '3D' && (
              <button
                onClick={() => setIsRotating(!isRotating)}
                className={`flex items-center px-3 py-1 rounded-md transition-colors ${
                  isRotating ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                }`}
                title="Toggle auto-rotation"
              >
                <RotateCcw className={`h-4 w-4 mr-1 ${isRotating ? 'animate-spin' : ''}`} />
                <span>Rotate</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Generating molecular structure...</p>
            </div>
          </div>
        )}

        {/* Validation panel */}
        {!loading && showValidation && molecularData && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Validation Results</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                {molecularData.validation.atomCount.isCorrect ? 
                  <CheckCircle className="h-3 w-3 text-green-500 mr-1" /> : 
                  <XCircle className="h-3 w-3 text-red-500 mr-1" />
                }
                <span>Atoms: {molecularData.validation.atomCount.actual}/{molecularData.validation.atomCount.expected}</span>
              </div>
              
              <div className="flex items-center">
                {molecularData.validation.geometry.isCorrect ? 
                  <CheckCircle className="h-3 w-3 text-green-500 mr-1" /> : 
                  <XCircle className="h-3 w-3 text-red-500 mr-1" />
                }
                <span>Geometry: {molecularData.geometry}</span>
              </div>
              
              <div className="flex items-center">
                <Info className="h-3 w-3 text-blue-500 mr-1" />
                <span>Bonds: {molecularData.bonds.length}</span>
              </div>
              
              <div className="flex items-center">
                <Info className="h-3 w-3 text-blue-500 mr-1" />
                <span>Analysis: {molecularData.source === 'ai' ? 'Generated' : 'Database'}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3D/2D Viewer */}
        <div className="h-64 bg-gray-50 rounded-lg overflow-hidden border">
          {!loading && error && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600 max-w-xs">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && viewMode === '2D' && (
            <div className="h-full flex items-center justify-center">
              {pubchemImage && !imageError ? (
                <img 
                  src={pubchemImage}
                  alt="2D molecular structure"
                  className="max-h-full max-w-full object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="text-center">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <div className="text-lg mb-2">{molecularData?.formula || 'Molecule'}</div>
                  <div className="text-sm text-gray-600">2D structure representation</div>
                  {molecularData && (
                    <div className="mt-2 text-xs">
                      Atoms: {molecularData.atoms.map((atom, i) => (
                        <span key={i} className="mr-2 px-1 py-0.5 bg-gray-200 rounded">
                          {atom.element}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!loading && !error && viewMode === '3D' && molecularData && molecularData.isValid && (
            <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} intensity={0.8} />
              <pointLight position={[-10, -10, -10]} intensity={0.3} />
              
              <Suspense fallback={null}>
                <Molecule3D molecularData={molecularData} />
              </Suspense>
              
              <OrbitControls 
                enablePan={true} 
                enableZoom={true} 
                enableRotate={true}
                autoRotate={isRotating}
                autoRotateSpeed={2}
              />
            </Canvas>
          )}

          {!loading && !error && (!molecularData || !molecularData.isValid) && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No proper molecular structure available</p>
                <p className="text-xs text-gray-500 mt-1">
                  Atom count validation failed or structure could not be generated
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Molecular Information */}
        {!loading && molecularData && (
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div><span className="font-medium">Formula:</span> {molecularData.formula}</div>
            <div><span className="font-medium">Atoms:</span> {molecularData.atoms.length}</div>
            <div><span className="font-medium">Bonds:</span> {molecularData.bonds.length}</div>
            <div><span className="font-medium">Geometry:</span> {molecularData.geometry}</div>
          </div>
        )}
      </div>
    </ClientOnly>
  )
}

export default EnhancedMolecularViewer3D
