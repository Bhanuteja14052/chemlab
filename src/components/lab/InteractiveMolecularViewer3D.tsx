'use client'

import React, { useState, useEffect, Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Text, Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { RotateCcw, Eye, EyeOff, Download, Maximize2 } from 'lucide-react'
import ClientOnly from '@/components/common/ClientOnly'

interface ReactionResult {
  compoundName: string
  chemicalFormula: string
  color: string
  state: string
  safetyWarnings: string[]
  explanation: string
  reactionEquation?: string
  temperature?: number
  pressure?: number
}

interface ElementSpec {
  element: string
  molecules: number
  weight: number
}

interface Atom {
  element: string
  position: [number, number, number]
  color: string
  radius: number
  bonds: number[]
  id: number
  // Enhanced AI properties
  formalCharge?: number
  hybridization?: string
}

interface Bond {
  atoms: [number, number]
  type: 'single' | 'double' | 'triple'
  length: number
  color: string
  // Enhanced AI properties
  strength?: string | number
  polarity?: string
}

interface MolecularData {
  atoms: Atom[]
  bonds: Bond[]
  formula: string
  name: string
  geometry: string
  isValid: boolean
  source: string
  // Enhanced AI properties
  hybridization?: string
  polarity?: string
  molecularWeight?: string | number
  dipoleMoment?: string | number
  bondAngles?: Array<{
    atoms: string[]
    angle: number
    description?: string
  }>
  properties?: {
    dipole_moment?: string | number
    boiling_point?: string | number
    melting_point?: string | number
    solubility?: string
    state_at_room_temp?: string
  }
  safetyInfo?: {
    hazard_level?: string
    safety_precautions?: string[]
    toxicity?: string
  }
}

interface InteractiveMolecularViewer3DProps {
  compound: ElementSpec[]
  reactionResult?: ReactionResult | null
  onDataExport?: (data: any) => void
  isLoading?: boolean
  className?: string
  isDarkTheme?: boolean
}

// CPK Color Standard for atoms
const atomColors: Record<string, string> = {
  'H': '#FFFFFF',   // Hydrogen - White
  'C': '#000000',   // Carbon - Black  
  'N': '#3050F8',   // Nitrogen - Blue
  'O': '#FF0D0D',   // Oxygen - Red
  'S': '#FFFF30',   // Sulfur - Yellow
  'Cl': '#1FF01F',  // Chlorine - Green
  'Na': '#AB5CF2',  // Sodium - Violet
  'Mg': '#8AFF00',  // Magnesium - Green
  'Ca': '#3DFF00',  // Calcium - Green
  'Fe': '#E06633',  // Iron - Orange
  'F': '#90E050',   // Fluorine - Light Green
  'P': '#FF8000',   // Phosphorus - Orange
  'Br': '#A62929',  // Bromine - Dark Red
  'I': '#940094',   // Iodine - Violet
  'default': '#FF69B4' // Default - Pink
}

// Atomic radii for visualization (scaled down for better appearance)
const atomicRadii: Record<string, number> = {
  'H': 0.15,
  'C': 0.35,
  'N': 0.32,
  'O': 0.30,
  'S': 0.50,
  'Cl': 0.45,
  'Na': 0.80,
  'Mg': 0.70,
  'Ca': 0.85,
  'Fe': 0.60,
  'F': 0.25,
  'P': 0.50,
  'Br': 0.55,
  'I': 0.65,
  'default': 0.40
}

const getElementColor = (element: string): string => {
  return atomColors[element] || atomColors.default
}

const getElementRadius = (element: string): number => {
  return atomicRadii[element] || atomicRadii.default
}

// Enhanced 3D Atom Component with hover effects and selection
function Atom3D({ atom, onClick, isSelected }: { 
  atom: Atom; 
  onClick: () => void; 
  isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.3 : isSelected ? 1.2 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  return (
    <group position={atom.position}>
      <Sphere
        ref={meshRef}
        args={[atom.radius, 32, 32]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={atom.color} 
          metalness={0.2}
          roughness={0.3}
          transparent={isSelected}
          opacity={isSelected ? 0.8 : 1}
          emissive={hovered ? atom.color : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </Sphere>
      
      {/* Atom label */}
      <Text
        position={[0, atom.radius + 0.4, 0]}
        fontSize={0.3}
        color={hovered || isSelected ? '#ffffff' : '#000000'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {atom.element}
      </Text>
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <ringGeometry args={[atom.radius + 0.2, atom.radius + 0.3, 32]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}

// Enhanced Bond Component with realistic bond representation
function Bond3D({ bond, atoms }: { bond: Bond; atoms: Atom[] }) {
  const atom1 = atoms[bond.atoms[0]]
  const atom2 = atoms[bond.atoms[1]]
  
  if (!atom1 || !atom2) return null

  const start = new THREE.Vector3(...atom1.position)
  const end = new THREE.Vector3(...atom2.position)
  const direction = end.clone().sub(start)
  const length = direction.length()
  const middle = start.clone().add(direction.clone().multiplyScalar(0.5))
  
  // Bond colors based on type - enhanced for better visibility
  const bondColor = bond.type === 'single' ? '#505050' : 
                   bond.type === 'double' ? '#707070' : '#909090'
  
  // Bond thickness based on type - enhanced for better visibility
  const bondRadius = bond.type === 'single' ? 0.08 : 
                    bond.type === 'double' ? 0.10 : 0.12

  const up = new THREE.Vector3(0, 1, 0)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction.normalize())

  if (bond.type === 'single') {
    return (
      <mesh position={middle.toArray()} quaternion={quaternion}>
        <cylinderGeometry args={[bondRadius, bondRadius, length, 16]} />
        <meshStandardMaterial 
          color={bondColor} 
          metalness={0.1} 
          roughness={0.4} 
          emissive={bondColor}
          emissiveIntensity={0.1}
        />
      </mesh>
    )
  } else if (bond.type === 'double') {
    // Create two parallel cylinders for double bond
    const perpendicular = new THREE.Vector3(1, 0, 0)
    if (Math.abs(direction.normalize().dot(perpendicular)) > 0.9) {
      perpendicular.set(0, 0, 1)
    }
    perpendicular.cross(direction).normalize().multiplyScalar(0.15)
    
    return (
      <group>
        <mesh position={middle.clone().add(perpendicular).toArray()} quaternion={quaternion}>
          <cylinderGeometry args={[bondRadius * 0.8, bondRadius * 0.8, length, 12]} />
          <meshStandardMaterial 
            color={bondColor} 
            metalness={0.1} 
            roughness={0.4} 
            emissive={bondColor}
            emissiveIntensity={0.1}
          />
        </mesh>
        <mesh position={middle.clone().sub(perpendicular).toArray()} quaternion={quaternion}>
          <cylinderGeometry args={[bondRadius * 0.8, bondRadius * 0.8, length, 12]} />
          <meshStandardMaterial 
            color={bondColor} 
            metalness={0.1} 
            roughness={0.4} 
            emissive={bondColor}
            emissiveIntensity={0.1}
          />
        </mesh>
      </group>
    )
  } else if (bond.type === 'triple') {
    // Create three parallel cylinders for triple bond
    const perpendicular1 = new THREE.Vector3(1, 0, 0)
    if (Math.abs(direction.normalize().dot(perpendicular1)) > 0.9) {
      perpendicular1.set(0, 0, 1)
    }
    perpendicular1.cross(direction).normalize().multiplyScalar(0.2)
    const perpendicular2 = direction.clone().cross(perpendicular1).normalize().multiplyScalar(0.2)
    
    return (
      <group>
        <mesh position={middle.toArray()} quaternion={quaternion}>
          <cylinderGeometry args={[bondRadius * 0.7, bondRadius * 0.7, length, 12]} />
          <meshStandardMaterial 
            color={bondColor} 
            metalness={0.1} 
            roughness={0.4} 
            emissive={bondColor}
            emissiveIntensity={0.1}
          />
        </mesh>
        <mesh position={middle.clone().add(perpendicular1).toArray()} quaternion={quaternion}>
          <cylinderGeometry args={[bondRadius * 0.6, bondRadius * 0.6, length, 8]} />
          <meshStandardMaterial 
            color={bondColor} 
            metalness={0.1} 
            roughness={0.4} 
            emissive={bondColor}
            emissiveIntensity={0.1}
          />
        </mesh>
        <mesh position={middle.clone().sub(perpendicular1).toArray()} quaternion={quaternion}>
          <cylinderGeometry args={[bondRadius * 0.6, bondRadius * 0.6, length, 8]} />
          <meshStandardMaterial 
            color={bondColor} 
            metalness={0.1} 
            roughness={0.4} 
            emissive={bondColor}
            emissiveIntensity={0.1}
          />
        </mesh>
      </group>
    )
  }

  return null
}

// Enhanced 3D Scene Component with professional lighting
function MolecularScene({ 
  molecularData, 
  onAtomClick, 
  selectedAtomId,
  isRotating 
}: { 
  molecularData: MolecularData | null
  onAtomClick: (atom: Atom) => void
  selectedAtomId: number | null
  isRotating: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current && isRotating) {
      groupRef.current.rotation.y += 0.005
    }
  })

  if (!molecularData || !molecularData.atoms || molecularData.atoms.length === 0) {
    return (
      <Html center>
        <div className="text-center p-6 bg-white rounded-xl shadow-lg border">
          <div className="text-gray-600 text-sm mb-2">
            ⚛️ No molecular structure available
          </div>
          <div className="text-gray-400 text-xs">
            Add elements to generate 3D structure
          </div>
        </div>
      </Html>
    )
  }

  return (
    <>
      {/* Professional Lighting Setup */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4080ff" />
      <spotLight 
        position={[0, 10, 0]} 
        intensity={0.4} 
        angle={Math.PI / 4}
        penumbra={0.5}
      />
      
      <group ref={groupRef}>
        {/* Render Atoms with enhanced visuals */}
        {molecularData.atoms.map((atom) => (
          <Atom3D
            key={`atom-${atom.id}`}
            atom={atom}
            onClick={() => onAtomClick(atom)}
            isSelected={selectedAtomId === atom.id}
          />
        ))}
        
        {/* Render Bonds with realistic appearance */}
        {molecularData.bonds.map((bond, index) => (
          <Bond3D
            key={`bond-${index}`}
            bond={bond}
            atoms={molecularData.atoms}
          />
        ))}
      </group>
    </>
  )
}

// Enhanced molecular structure generation with proper VSEPR geometry and AI-powered bond analysis
const generateAdvancedMolecularStructure = async (compound: ElementSpec[], formula: string): Promise<MolecularData> => {
  const atoms: Atom[] = []
  const bonds: Bond[] = []
  let atomIdCounter = 0

  try {
    // First, try predefined accurate structures
    const predefinedStructure = getPredefinedMolecularStructure(formula)
    if (predefinedStructure) {
      return predefinedStructure
    }

    // For complex molecules, use AI-powered geometry generation
    const aiStructure = await generateAIAssistedStructure(compound, formula)
    if (aiStructure) {
      return aiStructure
    }

    // Fallback to geometry-based generation
    return generateGeometryBasedStructure(compound, formula)
    
  } catch (error) {
    console.warn('Error generating molecular structure:', error)
    return generateFallbackStructure(compound, formula)
  }
}

// Get predefined molecular structures for common compounds
const getPredefinedMolecularStructure = (formula: string): MolecularData | null => {
  const structures: Record<string, MolecularData> = {
    'H2O': createWaterStructure(),
    'H₂O': createWaterStructure(),
    'CO2': createCO2Structure(),
    'CO₂': createCO2Structure(),
    'CH4': createMethaneStructure(),
    'CH₄': createMethaneStructure(),
    'NH3': createAmmoniaStructure(),
    'NH₃': createAmmoniaStructure(),
    'NaCl': createSodiumChlorideStructure(),
    'HCl': createHydrogenChlorideStructure(),
    'H2SO4': createSulfuricAcidStructure(),
    'H₂SO₄': createSulfuricAcidStructure(),
    'O2': createOxygenStructure(),
    'O₂': createOxygenStructure(),
    'N2': createNitrogenStructure(),
    'N₂': createNitrogenStructure()
  }
  
  return structures[formula] || null
}

// AI-assisted structure generation using Gemini API
const generateAIAssistedStructure = async (compound: ElementSpec[], formula: string): Promise<MolecularData | null> => {
  try {
    // Create properly numbered atom list for AI analysis
    const atomList: string[] = []
    const elementCounts: Record<string, number> = {}
    
    compound.forEach(spec => {
      elementCounts[spec.element] = spec.molecules
    })
    
    // Generate proper numbering like Ca, Cl1, Cl2
    Object.entries(elementCounts).forEach(([element, count]) => {
      if (count === 1) {
        atomList.push(element)
      } else {
        for (let i = 1; i <= count; i++) {
          atomList.push(`${element}${i}`)
        }
      }
    })

    const prompt = `As a chemistry expert, analyze the molecular structure for the compound ${formula} with numbered atoms.

Please provide COMPLETE and ACCURATE molecular structure data in VALID JSON format. I need:

1. **Molecular Geometry**: Use VSEPR theory to determine the correct 3D shape
2. **Precise 3D Coordinates**: Calculate exact positions in Angstroms
3. **Bond Information**: Only bonds between different atoms (NO Cl-Cl bonds in CCl4!)
4. **Chemical Properties**: Basic molecular properties

Use this EXACT numbering system:
- For ${formula}: ${atomList.map((atom, index) => {
      const element = atom.replace(/\d+/, '')
      const elementCount = atomList.filter(a => a.replace(/\d+/, '') === element).length
      if (elementCount === 1) {
        return element
      } else {
        const elementIndex = atomList.slice(0, index + 1).filter(a => a.replace(/\d+/, '') === element).length
        return `${element}${elementIndex}`
      }
    }).join(', ')}

CRITICAL: For compounds like CCl4, carbon is in the center bonded to 4 chlorines. Do NOT create Cl-Cl bonds!

Return ONLY a valid JSON object with this exact structure:

{
  "name": "compound name (e.g., Carbon Tetrachloride)",
  "formula": "${formula}",
  "geometry": "exact VSEPR geometry (tetrahedral for CCl4)",
  "hybridization": "orbital hybridization (sp3 for CCl4)",
  "polarity": "polar or nonpolar",
  "molecular_weight": "molecular weight in g/mol",
  "atoms": [
    {
      "id": "C",
      "element": "C",
      "position": [0, 0, 0],
      "formal_charge": 0,
      "bonds": ["Cl1", "Cl2", "Cl3", "Cl4"]
    },
    {
      "id": "Cl1", 
      "element": "Cl",
      "position": [1.77, 1.77, 1.77],
      "formal_charge": 0,
      "bonds": ["C"]
    }
  ],
  "bonds": [
    {
      "from": "C",
      "to": "Cl1",
      "type": "single",
      "length": "1.77"
    },
    {
      "from": "C", 
      "to": "Cl2",
      "type": "single",
      "length": "1.77"
    }
  ],
  "properties": {
    "dipole_moment": "dipole moment in Debye",
    "boiling_point": "boiling point in Celsius", 
    "melting_point": "melting point in Celsius",
    "state_at_room_temp": "solid, liquid, or gas"
  }
}

CRITICAL REQUIREMENTS:
- For CCl4: Carbon at center (0,0,0), 4 chlorines at tetrahedral positions
- Bond only central atom to surrounding atoms (C-Cl bonds ONLY, no Cl-Cl bonds)
- Use realistic bond lengths (C-Cl: 1.77Å, C-H: 1.09Å, O-H: 0.96Å, etc.)
- Tetrahedral geometry for CCl4 with 109.5° bond angles
- Include ALL atoms from the formula: ${formula}
- Ensure the structure is chemically valid and stable
- Use the exact numbering system specified above
- Return ONLY the JSON object, no additional text

Formula to analyze: ${formula}`

    console.log('🤖 Requesting comprehensive molecular data from Gemini AI...')
    console.log('Formula:', formula, 'Atoms:', atomList.join(', '))

    const response = await fetch('/api/molecular-structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })

    if (response.ok) {
      const data = await response.json()
      console.log('🤖 Gemini AI Response received:', data)
      
      if (data.success && data.prediction) {
        // Try to parse JSON from AI response
        let aiData
        try {
          // First try to parse the entire response as JSON
          aiData = JSON.parse(data.prediction)
        } catch {
          // If that fails, try to extract JSON from the response
          const jsonMatch = data.prediction.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            aiData = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('No valid JSON found in AI response')
          }
        }
        
        console.log('✅ Successfully parsed AI molecular data:', aiData)
        
        // Validate the AI data structure
        if (aiData.atoms && aiData.bonds && Array.isArray(aiData.atoms)) {
          const molecularStructure = convertAIDataToMolecularStructure(aiData, formula)
          console.log('🔬 Generated molecular structure:', molecularStructure)
          return molecularStructure
        } else {
          console.warn('⚠️ Invalid AI data structure:', aiData)
          return null
        }
      }
    } else {
      console.error('❌ Gemini API request failed:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('❌ AI structure generation failed:', error)
  }
  
  return null
}

// Convert AI response to MolecularData format
const convertAIDataToMolecularStructure = (aiData: any, formula: string): MolecularData => {
  const atoms: Atom[] = []
  const bonds: Bond[] = []
  const atomMap: Record<string, number> = {}

  console.log('🔄 Converting AI data to molecular structure...')
  console.log('AI Data:', aiData)

  try {
    // Create atoms with enhanced data
    aiData.atoms.forEach((aiAtom: any, index: number) => {
      const element = aiAtom.element || aiAtom.symbol || 'C'
      const position = aiAtom.position || [index * 2, 0, 0]
      
      atoms.push({
        element: element,
        position: position as [number, number, number],
        color: getElementColor(element),
        radius: getElementRadius(element),
        bonds: [],
        id: index,
        // Additional properties from AI
        formalCharge: aiAtom.formal_charge || 0,
        hybridization: aiAtom.hybridization || 'unknown'
      })
      atomMap[aiAtom.id] = index
      
      console.log(`✅ Created atom ${index}: ${element} at [${position.join(', ')}]`)
    })

    // Create bonds with enhanced data
    if (aiData.bonds && Array.isArray(aiData.bonds)) {
      aiData.bonds.forEach((aiBond: any, bondIndex: number) => {
        const startIndex = atomMap[aiBond.from]
        const endIndex = atomMap[aiBond.to]
        
        if (startIndex !== undefined && endIndex !== undefined) {
          const bondType = aiBond.type || 'single'
          const bondLength = parseFloat(aiBond.length) || 1.5
          const bondColor = getBondColor(bondType)
          
          bonds.push({
            atoms: [startIndex, endIndex],
            type: bondType as 'single' | 'double' | 'triple',
            length: bondLength,
            color: bondColor,
            // Additional properties from AI
            strength: aiBond.strength || 'unknown',
            polarity: aiBond.polarity || 'unknown'
          })
          
          atoms[startIndex].bonds.push(endIndex)
          atoms[endIndex].bonds.push(startIndex)
          
          console.log(`✅ Created ${bondType} bond ${bondIndex}: ${aiBond.from} → ${aiBond.to} (${bondLength}Å)`)
        } else {
          console.warn(`⚠️ Invalid bond: ${aiBond.from} → ${aiBond.to}`)
        }
      })
    }

    // Extract additional molecular information
    const molecularData: MolecularData = {
      atoms,
      bonds,
      formula,
      name: aiData.name || formula,
      geometry: aiData.geometry || 'unknown',
      isValid: true,
      source: 'AI-Generated',
      // Enhanced data from AI
      hybridization: aiData.hybridization || 'unknown',
      polarity: aiData.polarity || 'unknown',
      molecularWeight: aiData.molecular_weight || 'unknown',
      dipoleMoment: aiData.properties?.dipole_moment || 'unknown',
      bondAngles: aiData.bond_angles || [],
      properties: aiData.properties || {},
      safetyInfo: aiData.safety_info || {}
    }

    console.log('🎉 Successfully converted AI data to molecular structure')
    console.log('Final structure:', molecularData)
    
    return molecularData

  } catch (error) {
    console.error('❌ Error converting AI data:', error)
    
    // Fallback structure
    return {
      atoms: [{
        element: 'C',
        position: [0, 0, 0],
        color: getElementColor('C'),
        radius: getElementRadius('C'),
        bonds: [],
        id: 0
      }],
      bonds: [],
      formula,
      name: formula,
      geometry: 'unknown',
      isValid: false,
      source: 'AI-Fallback'
    }
  }
}

// Helper function to get bond color based on type
const getBondColor = (bondType: string): string => {
  switch (bondType) {
    case 'single': return '#666666'
    case 'double': return '#888888'
    case 'triple': return '#aaaaaa'
    case 'aromatic': return '#4CAF50'
    default: return '#666666'
  }
}

// Geometry-based structure generation for different molecular shapes
const generateGeometryBasedStructure = (compound: ElementSpec[], formula: string): MolecularData => {
  const totalAtoms = compound.reduce((sum, spec) => sum + spec.molecules, 0)
  
  if (totalAtoms === 2) {
    return generateLinearGeometry(compound, formula)
  } else if (totalAtoms === 3) {
    return generateTriatomicGeometry(compound, formula)
  } else if (totalAtoms === 4) {
    return generateTetrahedralGeometry(compound, formula)
  } else if (totalAtoms === 5) {
    return generateTrigonalBipyramidalGeometry(compound, formula)
  } else if (totalAtoms === 6) {
    return generateOctahedralGeometry(compound, formula)
  } else {
    return generateComplexGeometry(compound, formula)
  }
}

// Linear geometry (2 atoms)
const generateLinearGeometry = (compound: ElementSpec[], formula: string): MolecularData => {
  const atoms: Atom[] = []
  const bonds: Bond[] = []
  let atomId = 0
  
  const bondLength = 1.5
  compound.forEach((spec, specIndex) => {
    for (let i = 0; i < spec.molecules; i++) {
      atoms.push({
        element: spec.element,
        position: [specIndex * bondLength, 0, 0],
        color: getElementColor(spec.element),
        radius: getElementRadius(spec.element),
        bonds: [],
        id: atomId++
      })
    }
  })
  
  if (atoms.length === 2) {
    bonds.push({
      atoms: [0, 1],
      type: 'single',
      length: bondLength,
      color: '#666666'
    })
    atoms[0].bonds.push(1)
    atoms[1].bonds.push(0)
  }
  
  return {
    atoms,
    bonds,
    formula,
    name: formula,
    geometry: 'linear',
    isValid: true,
    source: 'Geometry-Based'
  }
}

// Triatomic geometry (3 atoms) - bent or linear
const generateTriatomicGeometry = (compound: ElementSpec[], formula: string): MolecularData => {
  const atoms: Atom[] = []
  const bonds: Bond[] = []
  let atomId = 0
  
  // Assume bent geometry (like H2O) with 104.5° angle
  const bondLength = 1.2
  const angle = (104.5 * Math.PI) / 180
  
  let atomIndex = 0
  compound.forEach(spec => {
    for (let i = 0; i < spec.molecules; i++) {
      let position: [number, number, number]
      
      if (atomIndex === 0) {
        position = [0, 0, 0] // Central atom
      } else if (atomIndex === 1) {
        position = [bondLength, 0, 0]
      } else {
        position = [bondLength * Math.cos(angle), bondLength * Math.sin(angle), 0]
      }
      
      atoms.push({
        element: spec.element,
        position,
        color: getElementColor(spec.element),
        radius: getElementRadius(spec.element),
        bonds: [],
        id: atomId++
      })
      atomIndex++
    }
  })
  
  // Create bonds from central atom to others
  if (atoms.length >= 3) {
    bonds.push(
      {
        atoms: [0, 1],
        type: 'single',
        length: bondLength,
        color: '#666666'
      },
      {
        atoms: [0, 2],
        type: 'single',
        length: bondLength,
        color: '#666666'
      }
    )
    atoms[0].bonds.push(1, 2)
    atoms[1].bonds.push(0)
    atoms[2].bonds.push(0)
  }
  
  return {
    atoms,
    bonds,
    formula,
    name: formula,
    geometry: 'bent',
    isValid: true,
    source: 'Geometry-Based'
  }
}

// Tetrahedral geometry (4 atoms)
const generateTetrahedralGeometry = (compound: ElementSpec[], formula: string): MolecularData => {
  const atoms: Atom[] = []
  const bonds: Bond[] = []
  let atomId = 0
  
  const bondLength = 1.5
  const tetrahedralPositions: [number, number, number][] = [
    [0, 0, 0], // Central atom
    [bondLength, bondLength, bondLength],
    [-bondLength, -bondLength, bondLength],
    [-bondLength, bondLength, -bondLength]
  ]
  
  let posIndex = 0
  compound.forEach(spec => {
    for (let i = 0; i < spec.molecules; i++) {
      atoms.push({
        element: spec.element,
        position: tetrahedralPositions[posIndex] || [posIndex * bondLength, 0, 0],
        color: getElementColor(spec.element),
        radius: getElementRadius(spec.element),
        bonds: [],
        id: atomId++
      })
      posIndex++
    }
  })
  
  // Create bonds from central atom to others
  if (atoms.length >= 4) {
    for (let i = 1; i < atoms.length; i++) {
      bonds.push({
        atoms: [0, i],
        type: 'single',
        length: bondLength,
        color: '#666666'
      })
      atoms[0].bonds.push(i)
      atoms[i].bonds.push(0)
    }
  }
  
  return {
    atoms,
    bonds,
    formula,
    name: formula,
    geometry: 'tetrahedral',
    isValid: true,
    source: 'Geometry-Based'
  }
}

// Trigonal bipyramidal geometry (5 atoms)
const generateTrigonalBipyramidalGeometry = (compound: ElementSpec[], formula: string): MolecularData => {
  const atoms: Atom[] = []
  const bonds: Bond[] = []
  let atomId = 0
  
  const bondLength = 1.6
  const positions: [number, number, number][] = [
    [0, 0, 0], // Central atom
    [bondLength, 0, 0], // Equatorial
    [-bondLength * 0.5, bondLength * 0.866, 0], // Equatorial
    [-bondLength * 0.5, -bondLength * 0.866, 0], // Equatorial
    [0, 0, bondLength] // Axial
  ]
  
  let posIndex = 0
  compound.forEach(spec => {
    for (let i = 0; i < spec.molecules; i++) {
      atoms.push({
        element: spec.element,
        position: positions[posIndex] || [posIndex * bondLength, 0, 0],
        color: getElementColor(spec.element),
        radius: getElementRadius(spec.element),
        bonds: [],
        id: atomId++
      })
      posIndex++
    }
  })
  
  // Create bonds from central atom to others
  if (atoms.length >= 5) {
    for (let i = 1; i < atoms.length; i++) {
      bonds.push({
        atoms: [0, i],
        type: 'single',
        length: bondLength,
        color: '#666666'
      })
      atoms[0].bonds.push(i)
      atoms[i].bonds.push(0)
    }
  }
  
  return {
    atoms,
    bonds,
    formula,
    name: formula,
    geometry: 'trigonal_bipyramidal',
    isValid: true,
    source: 'Geometry-Based'
  }
}

// Octahedral geometry (6 atoms)
const generateOctahedralGeometry = (compound: ElementSpec[], formula: string): MolecularData => {
  const atoms: Atom[] = []
  const bonds: Bond[] = []
  let atomId = 0
  
  const bondLength = 1.7
  const positions: [number, number, number][] = [
    [0, 0, 0], // Central atom
    [bondLength, 0, 0], // +X
    [-bondLength, 0, 0], // -X
    [0, bondLength, 0], // +Y
    [0, -bondLength, 0], // -Y
    [0, 0, bondLength] // +Z
  ]
  
  let posIndex = 0
  compound.forEach(spec => {
    for (let i = 0; i < spec.molecules; i++) {
      atoms.push({
        element: spec.element,
        position: positions[posIndex] || [posIndex * bondLength, 0, 0],
        color: getElementColor(spec.element),
        radius: getElementRadius(spec.element),
        bonds: [],
        id: atomId++
      })
      posIndex++
    }
  })
  
  // Create bonds from central atom to others
  if (atoms.length >= 6) {
    for (let i = 1; i < atoms.length; i++) {
      bonds.push({
        atoms: [0, i],
        type: 'single',
        length: bondLength,
        color: '#666666'
      })
      atoms[0].bonds.push(i)
      atoms[i].bonds.push(0)
    }
  }
  
  return {
    atoms,
    bonds,
    formula,
    name: formula,
    geometry: 'octahedral',
    isValid: true,
    source: 'Geometry-Based'
  }
}

// Complex geometry for larger molecules
const generateComplexGeometry = (compound: ElementSpec[], formula: string): MolecularData => {
  const atoms: Atom[] = []
  const bonds: Bond[] = []
  let atomId = 0
  
  const baseRadius = 2.0
  let totalAtoms = 0
  
  compound.forEach(spec => {
    totalAtoms += spec.molecules
  })
  
  let currentAtom = 0
  compound.forEach((spec, specIndex) => {
    for (let i = 0; i < spec.molecules; i++) {
      const angle = (currentAtom * 2 * Math.PI) / totalAtoms
      const radius = baseRadius + specIndex * 0.5
      const height = (currentAtom % 3 - 1) * 0.8
      
      atoms.push({
        element: spec.element,
        position: [
          radius * Math.cos(angle),
          radius * Math.sin(angle),
          height
        ],
        color: getElementColor(spec.element),
        radius: getElementRadius(spec.element),
        bonds: [],
        id: atomId++
      })
      currentAtom++
    }
  })
  
  // Create bonds between nearby atoms
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const distance = Math.sqrt(
        Math.pow(atoms[i].position[0] - atoms[j].position[0], 2) +
        Math.pow(atoms[i].position[1] - atoms[j].position[1], 2) +
        Math.pow(atoms[i].position[2] - atoms[j].position[2], 2)
      )
      
      if (distance < 3.5) {
        bonds.push({
          atoms: [i, j],
          type: 'single',
          length: distance,
          color: '#666666'
        })
        atoms[i].bonds.push(j)
        atoms[j].bonds.push(i)
      }
    }
  }
  
  return {
    atoms,
    bonds,
    formula,
    name: formula,
    geometry: 'complex',
    isValid: true,
    source: 'Geometry-Based'
  }
}

// Fallback structure generation
const generateFallbackStructure = (compound: ElementSpec[], formula: string): MolecularData => {
  const atoms: Atom[] = []
  let atomId = 0
  
  compound.forEach((spec, index) => {
    for (let i = 0; i < spec.molecules; i++) {
      atoms.push({
        element: spec.element,
        position: [index * 2 + i * 0.5, 0, 0],
        color: getElementColor(spec.element),
        radius: getElementRadius(spec.element),
        bonds: [],
        id: atomId++
      })
    }
  })
  
  return {
    atoms,
    bonds: [],
    formula,
    name: formula,
    geometry: 'linear',
    isValid: false,
    source: 'Fallback'
  }
}

// Predefined structure creation functions
const createWaterStructure = (): MolecularData => ({
  atoms: [
    { element: 'O', position: [0, 0, 0], color: getElementColor('O'), radius: getElementRadius('O'), bonds: [1, 2], id: 0 },
    { element: 'H', position: [0.96, 0.77, 0], color: getElementColor('H'), radius: getElementRadius('H'), bonds: [0], id: 1 },
    { element: 'H', position: [0.96, -0.77, 0], color: getElementColor('H'), radius: getElementRadius('H'), bonds: [0], id: 2 }
  ],
  bonds: [
    { atoms: [0, 1], type: 'single', length: 0.96, color: '#666666' },
    { atoms: [0, 2], type: 'single', length: 0.96, color: '#666666' }
  ],
  formula: 'H2O',
  name: 'Water',
  geometry: 'bent',
  isValid: true,
  source: 'Predefined'
})

const createCO2Structure = (): MolecularData => ({
  atoms: [
    { element: 'C', position: [0, 0, 0], color: getElementColor('C'), radius: getElementRadius('C'), bonds: [1, 2], id: 0 },
    { element: 'O', position: [-1.16, 0, 0], color: getElementColor('O'), radius: getElementRadius('O'), bonds: [0], id: 1 },
    { element: 'O', position: [1.16, 0, 0], color: getElementColor('O'), radius: getElementRadius('O'), bonds: [0], id: 2 }
  ],
  bonds: [
    { atoms: [0, 1], type: 'double', length: 1.16, color: '#888888' },
    { atoms: [0, 2], type: 'double', length: 1.16, color: '#888888' }
  ],
  formula: 'CO2',
  name: 'Carbon Dioxide',
  geometry: 'linear',
  isValid: true,
  source: 'Predefined'
})

const createMethaneStructure = (): MolecularData => ({
  atoms: [
    { element: 'C', position: [0, 0, 0], color: getElementColor('C'), radius: getElementRadius('C'), bonds: [1, 2, 3, 4], id: 0 },
    { element: 'H', position: [1.09, 1.09, 1.09], color: getElementColor('H'), radius: getElementRadius('H'), bonds: [0], id: 1 },
    { element: 'H', position: [-1.09, -1.09, 1.09], color: getElementColor('H'), radius: getElementRadius('H'), bonds: [0], id: 2 },
    { element: 'H', position: [-1.09, 1.09, -1.09], color: getElementColor('H'), radius: getElementRadius('H'), bonds: [0], id: 3 },
    { element: 'H', position: [1.09, -1.09, -1.09], color: getElementColor('H'), radius: getElementRadius('H'), bonds: [0], id: 4 }
  ],
  bonds: [
    { atoms: [0, 1], type: 'single', length: 1.09, color: '#666666' },
    { atoms: [0, 2], type: 'single', length: 1.09, color: '#666666' },
    { atoms: [0, 3], type: 'single', length: 1.09, color: '#666666' },
    { atoms: [0, 4], type: 'single', length: 1.09, color: '#666666' }
  ],
  formula: 'CH4',
  name: 'Methane',
  geometry: 'tetrahedral',
  isValid: true,
  source: 'Predefined'
})

const createAmmoniaStructure = (): MolecularData => ({
  atoms: [
    { element: 'N', position: [0, 0, 0], color: getElementColor('N'), radius: getElementRadius('N'), bonds: [1, 2, 3], id: 0 },
    { element: 'H', position: [1.01, 0, 0.33], color: getElementColor('H'), radius: getElementRadius('H'), bonds: [0], id: 1 },
    { element: 'H', position: [-0.505, 0.875, 0.33], color: getElementColor('H'), radius: getElementRadius('H'), bonds: [0], id: 2 },
    { element: 'H', position: [-0.505, -0.875, 0.33], color: getElementColor('H'), radius: getElementRadius('H'), bonds: [0], id: 3 }
  ],
  bonds: [
    { atoms: [0, 1], type: 'single', length: 1.01, color: '#666666' },
    { atoms: [0, 2], type: 'single', length: 1.01, color: '#666666' },
    { atoms: [0, 3], type: 'single', length: 1.01, color: '#666666' }
  ],
  formula: 'NH3',
  name: 'Ammonia',
  geometry: 'trigonal_pyramidal',
  isValid: true,
  source: 'Predefined'
})

const createSodiumChlorideStructure = (): MolecularData => ({
  atoms: [
    { element: 'Na', position: [-1.2, 0, 0], color: getElementColor('Na'), radius: getElementRadius('Na'), bonds: [1], id: 0 },
    { element: 'Cl', position: [1.2, 0, 0], color: getElementColor('Cl'), radius: getElementRadius('Cl'), bonds: [0], id: 1 }
  ],
  bonds: [
    { atoms: [0, 1], type: 'single', length: 2.4, color: '#999999' }
  ],
  formula: 'NaCl',
  name: 'Sodium Chloride',
  geometry: 'ionic',
  isValid: true,
  source: 'Predefined'
})

const createHydrogenChlorideStructure = (): MolecularData => ({
  atoms: [
    { element: 'H', position: [0, 0, 0], color: getElementColor('H'), radius: getElementRadius('H'), bonds: [1], id: 0 },
    { element: 'Cl', position: [1.27, 0, 0], color: getElementColor('Cl'), radius: getElementRadius('Cl'), bonds: [0], id: 1 }
  ],
  bonds: [
    { atoms: [0, 1], type: 'single', length: 1.27, color: '#666666' }
  ],
  formula: 'HCl',
  name: 'Hydrogen Chloride',
  geometry: 'linear',
  isValid: true,
  source: 'Predefined'
})

const createSulfuricAcidStructure = (): MolecularData => ({
  atoms: [
    { element: 'S', position: [0, 0, 0], color: getElementColor('S'), radius: getElementRadius('S'), bonds: [1, 2, 3, 4], id: 0 },
    { element: 'O', position: [1.44, 0, 0], color: getElementColor('O'), radius: getElementRadius('O'), bonds: [0, 5], id: 1 },
    { element: 'O', position: [-1.44, 0, 0], color: getElementColor('O'), radius: getElementRadius('O'), bonds: [0], id: 2 },
    { element: 'O', position: [0, 1.44, 0], color: getElementColor('O'), radius: getElementRadius('O'), bonds: [0, 6], id: 3 },
    { element: 'O', position: [0, -1.44, 0], color: getElementColor('O'), radius: getElementRadius('O'), bonds: [0], id: 4 },
    { element: 'H', position: [2.40, 0, 0], color: getElementColor('H'), radius: getElementRadius('H'), bonds: [1], id: 5 },
    { element: 'H', position: [0, 2.40, 0], color: getElementColor('H'), radius: getElementRadius('H'), bonds: [3], id: 6 }
  ],
  bonds: [
    { atoms: [0, 1], type: 'single', length: 1.44, color: '#666666' },
    { atoms: [0, 2], type: 'double', length: 1.44, color: '#888888' },
    { atoms: [0, 3], type: 'single', length: 1.44, color: '#666666' },
    { atoms: [0, 4], type: 'double', length: 1.44, color: '#888888' },
    { atoms: [1, 5], type: 'single', length: 0.96, color: '#666666' },
    { atoms: [3, 6], type: 'single', length: 0.96, color: '#666666' }
  ],
  formula: 'H2SO4',
  name: 'Sulfuric Acid',
  geometry: 'tetrahedral',
  isValid: true,
  source: 'Predefined'
})

const createOxygenStructure = (): MolecularData => ({
  atoms: [
    { element: 'O', position: [0, 0, 0], color: getElementColor('O'), radius: getElementRadius('O'), bonds: [1], id: 0 },
    { element: 'O', position: [1.21, 0, 0], color: getElementColor('O'), radius: getElementRadius('O'), bonds: [0], id: 1 }
  ],
  bonds: [
    { atoms: [0, 1], type: 'double', length: 1.21, color: '#888888' }
  ],
  formula: 'O2',
  name: 'Oxygen',
  geometry: 'linear',
  isValid: true,
  source: 'Predefined'
})

const createNitrogenStructure = (): MolecularData => ({
  atoms: [
    { element: 'N', position: [0, 0, 0], color: getElementColor('N'), radius: getElementRadius('N'), bonds: [1], id: 0 },
    { element: 'N', position: [1.10, 0, 0], color: getElementColor('N'), radius: getElementRadius('N'), bonds: [0], id: 1 }
  ],
  bonds: [
    { atoms: [0, 1], type: 'triple', length: 1.10, color: '#aaaaaa' }
  ],
  formula: 'N2',
  name: 'Nitrogen',
  geometry: 'linear',
  isValid: true,
  source: 'Predefined'
})

export default function InteractiveMolecularViewer3D({ 
  compound,
  reactionResult,
  onDataExport,
  isLoading = false,
  className = '',
  isDarkTheme = false
}: InteractiveMolecularViewer3DProps) {
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D')
  const [selectedAtom, setSelectedAtom] = useState<Atom | null>(null)
  const [molecularData, setMolecularData] = useState<MolecularData | null>(null)
  const [isRotating, setIsRotating] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [pubchemImage, setPubchemImage] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  // Generate molecular structure when data changes
  useEffect(() => {
    if (reactionResult?.chemicalFormula || compound.length > 0) {
      try {
        const formula = reactionResult?.chemicalFormula || 
          compound.map(spec => `${spec.element}${spec.molecules > 1 ? spec.molecules : ''}`).join('')
        
        if (formula) {
          // Use async function to handle AI-powered structure generation
          const generateStructure = async () => {
            try {
              console.log('🧪 Starting advanced molecular structure generation...')
              console.log('📝 Formula:', formula)
              console.log('⚛️ Compound elements:', compound)
              
              const structure3D = await generateAdvancedMolecularStructure(compound, formula)
              
              console.log('✅ Structure generation completed!')
              console.log('📊 Generated structure:', structure3D)
              
              setMolecularData(structure3D)
              
              // Export data for parent component
              if (onDataExport) {
                onDataExport({
                  ...structure3D,
                  exportedAt: new Date().toISOString(),
                  compound: compound
                })
              }
            } catch (error) {
              console.error('❌ Error generating AI-powered molecular structure:', error)
              // Fallback to basic structure
              const fallbackStructure = generateFallbackStructure(compound, formula)
              setMolecularData(fallbackStructure)
              
              if (onDataExport) {
                onDataExport({
                  ...fallbackStructure,
                  exportedAt: new Date().toISOString(),
                  compound: compound
                })
              }
            }
          }
          
          generateStructure()
        }
      } catch (error) {
        console.warn('Error processing molecular data:', error)
        setMolecularData(null)
      }
    } else {
      setMolecularData(null)
    }
  }, [compound, reactionResult]) // Removed onDataExport from dependencies

  // Fetch PubChem 2D images for compounds
  useEffect(() => {
    const fetchPubchemImage = async () => {
      setImageError(false)
      setPubchemImage(null)
      
      if (!reactionResult?.chemicalFormula && !reactionResult?.compoundName) {
        return
      }

      try {
        // Try compound name first if available
        if (reactionResult?.compoundName) {
          const nameUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(reactionResult.compoundName)}/PNG`
          setPubchemImage(nameUrl)
        } else if (reactionResult?.chemicalFormula) {
          // Clean formula and try that
          const cleanFormula = reactionResult.chemicalFormula.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (match) => {
            const map: { [key: string]: string } = {
              '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
              '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'
            }
            return map[match] || match
          })
          const formulaUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(cleanFormula)}/PNG`
          setPubchemImage(formulaUrl)
        }
      } catch (error) {
        console.log('Could not load PubChem image:', error)
        setPubchemImage(null)
      }
    }

    fetchPubchemImage()
  }, [reactionResult])

  const handleAtomClick = (atom: Atom) => {
    setSelectedAtom(selectedAtom?.id === atom.id ? null : atom)
  }

  const resetView = () => {
    setSelectedAtom(null)
    setIsRotating(true)
  }

  const downloadStructure = () => {
    if (!molecularData) return

    const exportData = {
      ...molecularData,
      metadata: {
        exportedAt: new Date().toISOString(),
        format: '3D_Molecular_Structure',
        version: '1.0'
      },
      compound: compound
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${molecularData.formula}_3D_structure.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className={`p-6 rounded-xl ${isDarkTheme ? 'bg-slate-800' : 'bg-white'} ${className}`}>
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <span className="text-lg font-medium">Building 3D molecular structure...</span>
            <div className="text-sm text-gray-500 mt-2">Calculating VSEPR geometry</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ClientOnly>
      <div className="rounded-xl border bg-white border-gray-200 p-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className={`text-xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Interactive 3D Molecular Viewer
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('3D')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewMode === '3D'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              3D
            </button>
            <button
              onClick={() => setViewMode('2D')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewMode === '2D'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              2D
            </button>
          </div>
        </div>

        {/* 3D/2D Viewer */}
        <div className="h-96 overflow-hidden bg-gray-50">
          {viewMode === '3D' ? (
            <div className="h-full w-full">
              <Canvas
                camera={{ 
                  position: [8, 6, 8], 
                  fov: 50,
                  near: 0.1,
                  far: 1000
                }}
                style={{ 
                  background: isDarkTheme ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  width: '100%',
                  height: '100%'
                }}
              >
                <Suspense fallback={
                  <Html center>
                    <div className="flex items-center justify-center bg-white rounded-lg p-4 shadow-lg">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
                      <span className="text-sm font-medium">Loading 3D model...</span>
                    </div>
                  </Html>
                }>
                  <MolecularScene 
                    molecularData={molecularData} 
                    onAtomClick={handleAtomClick}
                    selectedAtomId={selectedAtom?.id || null}
                    isRotating={isRotating}
                  />
                  <OrbitControls 
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    zoomSpeed={1.2}
                    panSpeed={0.8}
                    rotateSpeed={0.5}
                    minDistance={3}
                    maxDistance={50}
                    enableDamping={true}
                    dampingFactor={0.05}
                  />
                </Suspense>
              </Canvas>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              {pubchemImage && !imageError ? (
                <div className="text-center max-w-full max-h-full">
                  <img 
                    src={pubchemImage}
                    alt="2D molecular structure"
                    className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                    onError={() => setImageError(true)}
                    style={{ maxHeight: '300px', maxWidth: '400px' }}
                  />
                  <div className={`text-sm mt-3 ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
                    2D Molecular Structure
                  </div>
                  <div className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>
                    {reactionResult?.compoundName || reactionResult?.chemicalFormula}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">⚛️</div>
                  <div className={`text-xl font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                    2D Molecular Structure
                  </div>
                  <div className={`text-lg font-mono mb-4 ${isDarkTheme ? 'text-slate-300' : 'text-gray-600'}`}>
                    {reactionResult?.chemicalFormula || 'No formula available'}
                  </div>
                  <div className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
                    {imageError ? 'Structure image not available' : 'Loading structure image...'}
                  </div>
                  <div className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>
                    Switch to 3D for interactive molecular model
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Molecular Information Panel */}
        {molecularData && (
          <div className={`p-4 border-t ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className={`font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Formula:</span>
                <div className="font-mono text-lg">{molecularData.formula}</div>
              </div>
              <div>
                <span className={`font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Geometry:</span>
                <div className="capitalize">{molecularData.geometry}</div>
              </div>
              <div>
                <span className={`font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Atoms:</span>
                <div>{molecularData.atoms.length}</div>
              </div>
              <div>
                <span className={`font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Bonds:</span>
                <div>{molecularData.bonds.length}</div>
              </div>
            </div>
            
            {/* Bond Details */}
            {molecularData.bonds.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className={`font-medium mb-3 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                  Bond Analysis:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {molecularData.bonds.map((bond, index) => (
                    <div key={index} className={`p-2 rounded-lg text-xs ${
                      isDarkTheme ? 'bg-slate-700' : 'bg-gray-100'
                    }`}>
                      <div className="font-medium">
                        {molecularData.atoms[bond.atoms[0]].element}—{molecularData.atoms[bond.atoms[1]].element}
                      </div>
                      <div className={`${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
                        {bond.type} bond ({(typeof bond.length === 'number' ? bond.length : parseFloat(bond.length) || 1.5).toFixed(2)}Å)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Comprehensive Molecular Information Panel */}
        {molecularData && (
          <div className={`p-4 border-t ${
            isDarkTheme ? 'bg-slate-800 border-slate-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="font-bold text-lg mb-4 flex items-center text-black">
              🧪 AI-Generated Molecular Analysis
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                molecularData.source === 'AI-Generated' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {molecularData.source}
              </span>
            </div>

            <div className="space-y-4">
              {/* Basic Properties */}
              <div className="p-4 rounded-lg bg-white border border-gray-200">
                <h4 className="font-semibold mb-3 text-black">
                  Basic Properties
                </h4>
                <div className="space-y-2 text-sm text-black">
                  <div><span className="font-medium">Formula:</span> {molecularData.formula}</div>
                  <div><span className="font-medium">Name:</span> {molecularData.name}</div>
                  <div><span className="font-medium">Geometry:</span> {molecularData.geometry.replace('_', ' ')}</div>
                  {molecularData.hybridization && (
                    <div><span className="font-medium">Hybridization:</span> {molecularData.hybridization}</div>
                  )}
                  {molecularData.polarity && (
                    <div><span className="font-medium">Polarity:</span> {molecularData.polarity}</div>
                  )}
                  {molecularData.molecularWeight && (
                    <div><span className="font-medium">Molecular Weight:</span> {molecularData.molecularWeight} g/mol</div>
                  )}
                </div>
              </div>

              {/* Physical Properties */}
              {molecularData.properties && (
                <div className="p-4 rounded-lg bg-white border border-gray-200">
                  <h4 className="font-semibold mb-3 text-black">
                    Physical Properties
                  </h4>
                  <div className="space-y-2 text-sm text-black">
                    {molecularData.properties.dipole_moment && (
                      <div><span className="font-medium">Dipole Moment:</span> {molecularData.properties.dipole_moment} D</div>
                    )}
                    {molecularData.properties.boiling_point && (
                      <div><span className="font-medium">Boiling Point:</span> {molecularData.properties.boiling_point}°C</div>
                    )}
                    {molecularData.properties.melting_point && (
                      <div><span className="font-medium">Melting Point:</span> {molecularData.properties.melting_point}°C</div>
                    )}
                    {molecularData.properties.state_at_room_temp && (
                      <div><span className="font-medium">State (25°C):</span> {molecularData.properties.state_at_room_temp}</div>
                    )}
                    {molecularData.properties.solubility && (
                      <div><span className="font-medium">Solubility:</span> {molecularData.properties.solubility}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bond Angles */}
            {molecularData.bondAngles && molecularData.bondAngles.length > 0 && (
              <div className={`mt-6 p-4 rounded-lg bg-white border border-gray-200`}>
                <h4 className={`font-semibold mb-3 text-black`}>
                  Bond Angles (VSEPR Theory)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {molecularData.bondAngles.map((angle, index) => (
                    <div key={index} className={`p-3 rounded-lg bg-gray-100`}>
                      <div className={`font-medium text-sm text-black`}>
                        {angle.atoms.join(' - ')}
                      </div>
                      <div className={`text-lg font-bold text-blue-600`}>
                        {angle.angle}°
                      </div>
                      {angle.description && (
                        <div className={`text-xs text-gray-600`}>
                          {angle.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected Atom Details */}
        {selectedAtom && (
          <div className="p-4 border-t bg-blue-50 border-blue-200">
            <h4 className="font-bold mb-3 flex items-center text-black">
              <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: selectedAtom.color }}></span>
              Selected Atom: {selectedAtom.element}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-black">
              <div>
                <span className="font-medium">Position:</span>
                <div className="font-mono">
                  ({selectedAtom.position.map(p => p.toFixed(2)).join(', ')})
                </div>
              </div>
              <div>
                <span className="font-medium">Bonds:</span>
                <div>{selectedAtom.bonds.length}</div>
              </div>
              <div>
                <span className="font-medium">Radius:</span>
                <div>{selectedAtom.radius.toFixed(2)}Å</div>
              </div>
              <div>
                <span className="font-medium">Color:</span>
                <div className="font-mono">{selectedAtom.color}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  )
}
