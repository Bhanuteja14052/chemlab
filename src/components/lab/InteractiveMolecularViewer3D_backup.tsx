'use client'

import React, { useState, useEffect, Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Text, Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { RotateCcw, Eye, EyeOff } from 'lucide-react'
import ClientOnly from '@/components/common/ClientOnly'

interface ReactionResult {
  prediction: string
  probability: number
  products: string[]
  explanation?: string
  chemicalFormula?: string
  chemicalEquation?: string
  color?: string
  state?: string
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
}

interface Bond {
  atoms: [number, number]
  type: 'single' | 'double' | 'triple'
  length: number
}

interface MolecularData {
  atoms: Atom[]
  bonds: Bond[]
  formula: string
  geometry: string
}

interface InteractiveMolecularViewer3DProps {
  reactionResult?: ReactionResult
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
  'default': '#FF69B4' // Default - Pink
}

// Atomic radii for visualization
const atomicRadii: Record<string, number> = {
  'H': 0.3,
  'C': 0.7,
  'N': 0.65,
  'O': 0.6,
  'S': 1.0,
  'Cl': 0.99,
  'Na': 1.8,
  'Mg': 1.6,
  'Ca': 1.9,
  'Fe': 1.3,
  'default': 0.7
}

const getElementColor = (element: string): string => {
  return atomColors[element] || atomColors.default
}

const getElementRadius = (element: string): number => {
  return atomicRadii[element] || atomicRadii.default
}

// Simple 3D Atom Component
function Atom3D({ atom, onClick }: { atom: Atom; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.2 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  return (
    <group position={atom.position}>
      <Sphere
        ref={meshRef}
        args={[atom.radius, 16, 16]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={atom.color} 
          metalness={0.1}
          roughness={0.3}
        />
      </Sphere>
      <Text
        position={[0, atom.radius + 0.3, 0]}
        fontSize={0.3}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {atom.element}
      </Text>
    </group>
  )
}

// Simple Bond Component using Line
function Bond3D({ bond, atoms }: { bond: Bond; atoms: Atom[] }) {
  const atom1 = atoms[bond.atoms[0]]
  const atom2 = atoms[bond.atoms[1]]
  
  if (!atom1 || !atom2) return null

  const points = [
    new THREE.Vector3(...atom1.position),
    new THREE.Vector3(...atom2.position)
  ]

  return (
    <Line
      points={points}
      color="#666666"
      lineWidth={bond.type === 'triple' ? 6 : bond.type === 'double' ? 4 : 2}
    />
  )
}

// Simple 3D Scene Component 
function MolecularScene({ molecularData, onAtomClick }: { 
  molecularData: MolecularData | null
  onAtomClick: (atom: Atom) => void 
}) {
  if (!molecularData || !molecularData.atoms || molecularData.atoms.length === 0) {
    return (
      <Html center>
        <div className="text-center p-4 bg-white rounded-lg shadow-lg">
          <div className="text-gray-500 text-sm">
            Add elements to see molecular structure
          </div>
        </div>
      </Html>
    )
  }

  return (
    <>
      {/* Basic Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 10, 0]} intensity={0.4} />
      
      {/* Render Atoms */}
      {molecularData.atoms.map((atom, index) => (
        <Atom3D
          key={`atom-${index}`}
          atom={atom}
          onClick={() => onAtomClick(atom)}
        />
      ))}
      
      {/* Render Bonds */}
      {molecularData.bonds.map((bond, index) => (
        <Bond3D
          key={`bond-${index}`}
          bond={bond}
          atoms={molecularData.atoms}
        />
      ))}
    </>
  )
}

// Simple molecular structure generation
const generateMolecularStructure = (compound: ElementSpec[], formula: string): MolecularData => {
  const atoms: Atom[] = []
  const bonds: Bond[] = []
  
  try {
    let atomIndex = 0
    
    // Create atoms in a circular arrangement
    compound.forEach((spec, specIndex) => {
      for (let i = 0; i < spec.molecules; i++) {
        const totalAtoms = compound.reduce((sum, s) => sum + s.molecules, 0)
        const angle = (atomIndex * 2 * Math.PI) / totalAtoms
        const radius = 2 + specIndex * 0.5
        
        atoms.push({
          element: spec.element,
          position: [
            radius * Math.cos(angle),
            radius * Math.sin(angle), 
            (atomIndex % 2) * 0.5 - 0.25
          ],
          color: getElementColor(spec.element),
          radius: getElementRadius(spec.element),
          bonds: []
        })
        atomIndex++
      }
    })
    
    // Create simple bonds between nearby atoms
    for (let i = 0; i < atoms.length - 1; i++) {
      const distance = Math.sqrt(
        Math.pow(atoms[i].position[0] - atoms[i + 1].position[0], 2) +
        Math.pow(atoms[i].position[1] - atoms[i + 1].position[1], 2) +
        Math.pow(atoms[i].position[2] - atoms[i + 1].position[2], 2)
      )
      
      if (distance < 3) {
        bonds.push({
          atoms: [i, i + 1],
          type: 'single',
          length: distance
        })
        atoms[i].bonds.push(i + 1)
        atoms[i + 1].bonds.push(i)
      }
    }
    
    return {
      atoms,
      bonds,
      formula,
      geometry: 'organized'
    }
  } catch (error) {
    console.warn('Error generating molecular structure:', error)
    
    // Fallback: single atoms in a line
    compound.forEach((spec, index) => {
      atoms.push({
        element: spec.element,
        position: [index * 2, 0, 0],
        color: getElementColor(spec.element),
        radius: getElementRadius(spec.element),
        bonds: []
      })
    })
    
    return {
      atoms,
      bonds: [],
      formula,
      geometry: 'linear'
    }
  }
}

export default function InteractiveMolecularViewer3D({ 
  reactionResult, 
  isLoading = false,
  className = '',
  isDarkTheme = false
}: InteractiveMolecularViewer3DProps) {
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D')
  const [selectedAtom, setSelectedAtom] = useState<Atom | null>(null)
  const [molecularData, setMolecularData] = useState<MolecularData | null>(null)
  const [pubchemImage, setPubchemImage] = useState<string | null>(null)

  // Generate molecular structure when reaction result changes
  useEffect(() => {
    if (reactionResult?.chemicalFormula) {
      try {
        // Parse formula to create simple compound structure
        const compound: ElementSpec[] = []
        
        // Simple parser for common formulas like H2O, CO2, etc.
        const formula = reactionResult.chemicalFormula
        const matches = formula.match(/([A-Z][a-z]?)(\d*)/g) || []
        
        matches.forEach(match => {
          const elementMatch = match.match(/([A-Z][a-z]?)(\d*)/)
          if (elementMatch) {
            const element = elementMatch[1]
            const count = parseInt(elementMatch[2]) || 1
            compound.push({ element, molecules: count, weight: 1 })
          }
        })
        
        if (compound.length > 0) {
          const structure3D = generateMolecularStructure(compound, formula)
          setMolecularData(structure3D)
        }
      } catch (error) {
        console.warn('Error processing chemical formula:', error)
        setMolecularData(null)
      }
    }
  }, [reactionResult])

  const handleAtomClick = (atom: Atom) => {
    setSelectedAtom(atom)
    console.log('Clicked atom:', atom)
  }

  const resetView = () => {
    setViewMode('3D')
    setSelectedAtom(null)
  }

  if (isLoading) {
    return (
      <div className={`p-4 rounded-lg ${isDarkTheme ? 'bg-slate-800' : 'bg-white'} ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-sm">Loading molecular analysis...</span>
        </div>
      </div>
    )
  }

  return (
    <ClientOnly>
      <div className={`p-4 rounded-lg ${isDarkTheme ? 'bg-slate-800' : 'bg-white'} ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Molecular Analysis
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('3D')}
              className={`px-3 py-1 text-xs rounded ${
                viewMode === '3D'
                  ? 'bg-blue-500 text-white'
                  : isDarkTheme ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              3D
            </button>
            <button
              onClick={() => setViewMode('2D')}
              className={`px-3 py-1 text-xs rounded ${
                viewMode === '2D'
                  ? 'bg-blue-500 text-white'
                  : isDarkTheme ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              2D
            </button>
            <button
              onClick={resetView}
              className={`p-1 rounded ${
                isDarkTheme ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title="Reset View"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* 3D/2D Viewer */}
        <div className={`rounded-lg h-64 mb-4 overflow-hidden ${
          isDarkTheme ? 'bg-slate-900' : 'bg-slate-50'
        }`}>
          {viewMode === '3D' ? (
            <div className="h-full w-full">
              <Canvas
                camera={{ 
                  position: [8, 6, 8], 
                  fov: 45,
                  near: 0.1,
                  far: 1000
                }}
                style={{ 
                  background: isDarkTheme ? '#0f172a' : '#f8fafc',
                  width: '100%',
                  height: '100%'
                }}
              >
                <Suspense fallback={
                  <Html center>
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-sm">Loading 3D model...</span>
                    </div>
                  </Html>
                }>
                  <MolecularScene 
                    molecularData={molecularData} 
                    onAtomClick={handleAtomClick}
                  />
                  <OrbitControls 
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    zoomSpeed={1.2}
                    panSpeed={0.8}
                    rotateSpeed={0.5}
                    minDistance={2}
                    maxDistance={50}
                    enableDamping={true}
                    dampingFactor={0.05}
                  />
                </Suspense>
              </Canvas>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-4">
              <div className="text-center">
                <div className="text-4xl mb-2">⚛️</div>
                <div className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                  2D structure view
                </div>
                <div className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                  Formula: {reactionResult?.chemicalFormula || 'N/A'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Molecular Information */}
        {molecularData && (
          <div className={`text-sm space-y-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-600'}`}>
            <div className="flex justify-between">
              <span>Formula:</span>
              <span className="font-mono">{molecularData.formula}</span>
            </div>
            <div className="flex justify-between">
              <span>Geometry:</span>
              <span className="capitalize">{molecularData.geometry}</span>
            </div>
            <div className="flex justify-between">
              <span>Atoms:</span>
              <span>{molecularData.atoms.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Bonds:</span>
              <span>{molecularData.bonds.length}</span>
            </div>
          </div>
        )}

        {/* Selected Atom Info */}
        {selectedAtom && (
          <div className={`mt-4 p-3 rounded-lg ${
            isDarkTheme ? 'bg-slate-700' : 'bg-blue-50'
          }`}>
            <h4 className={`font-semibold mb-2 ${isDarkTheme ? 'text-white' : 'text-blue-900'}`}>
              Selected Atom: {selectedAtom.element}
            </h4>
            <div className={`text-sm space-y-1 ${isDarkTheme ? 'text-slate-300' : 'text-blue-700'}`}>
              <div>Position: ({selectedAtom.position.map(p => p.toFixed(2)).join(', ')})</div>
              <div>Bonds: {selectedAtom.bonds.length}</div>
              <div>Radius: {selectedAtom.radius.toFixed(2)}Å</div>
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  )
}
