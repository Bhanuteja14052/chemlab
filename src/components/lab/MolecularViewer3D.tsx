'use client'

import React, { useState, useEffect, Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, Text } from '@react-three/drei'
import * as THREE from 'three'
import { RotateCcw, AlertTriangle, Brain } from 'lucide-react'
import LoadingAnimation from './LoadingAnimation'

interface Atom {
  element: string
  position: [number, number, number]
  color: string
  radius: number
  valency: number
  formalCharge?: number
  hybridization?: string
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
  source: 'generated' | 'pubchem' | 'rcsb'
  errors?: string[]
}

interface MolecularViewer3DProps {
  compound: Array<{ element: string; molecules: number; weight: number }> | string
  reactionResult?: any
  onDataExport?: (data: any) => void
}

interface ElementData {
  symbol: string
  name: string
  valency: number[]
  atomicRadius: number
  covalentRadius: number
  color: string
  electronegativity: number
  maxBonds: number
  commonGeometries: string[]
}

// Enhanced periodic table with comprehensive bonding data
const PERIODIC_TABLE: Record<string, ElementData> = {
  'H': { 
    symbol: 'H', name: 'Hydrogen', valency: [1], atomicRadius: 0.37, covalentRadius: 0.31,
    color: '#ffffff', electronegativity: 2.20, maxBonds: 1, commonGeometries: ['linear']
  },
  'C': {
    symbol: 'C', name: 'Carbon', valency: [4], atomicRadius: 0.70, covalentRadius: 0.76,
    color: '#404040', electronegativity: 2.55, maxBonds: 4, 
    commonGeometries: ['tetrahedral', 'trigonal_planar', 'linear']
  },
  'N': {
    symbol: 'N', name: 'Nitrogen', valency: [3, 5], atomicRadius: 0.65, covalentRadius: 0.71,
    color: '#3050f8', electronegativity: 3.04, maxBonds: 4, 
    commonGeometries: ['trigonal_pyramidal', 'trigonal_planar', 'linear']
  },
  'O': {
    symbol: 'O', name: 'Oxygen', valency: [2], atomicRadius: 0.60, covalentRadius: 0.66,
    color: '#ff0d0d', electronegativity: 3.44, maxBonds: 2, commonGeometries: ['bent', 'linear']
  },
  'F': {
    symbol: 'F', name: 'Fluorine', valency: [1], atomicRadius: 0.50, covalentRadius: 0.57,
    color: '#90e050', electronegativity: 3.98, maxBonds: 1, commonGeometries: ['linear']
  },
  'S': {
    symbol: 'S', name: 'Sulfur', valency: [2, 4, 6], atomicRadius: 1.00, covalentRadius: 1.05,
    color: '#ffff30', electronegativity: 2.58, maxBonds: 6, 
    commonGeometries: ['bent', 'tetrahedral', 'octahedral']
  },
  'P': {
    symbol: 'P', name: 'Phosphorus', valency: [3, 5], atomicRadius: 1.00, covalentRadius: 1.07,
    color: '#ff8000', electronegativity: 2.19, maxBonds: 5, 
    commonGeometries: ['trigonal_pyramidal', 'trigonal_bipyramidal']
  },
  'Cl': {
    symbol: 'Cl', name: 'Chlorine', valency: [1], atomicRadius: 1.00, covalentRadius: 0.99,
    color: '#1ff01f', electronegativity: 3.16, maxBonds: 1, commonGeometries: ['linear']
  },
  'Br': {
    symbol: 'Br', name: 'Bromine', valency: [1], atomicRadius: 1.20, covalentRadius: 1.20,
    color: '#a62929', electronegativity: 2.96, maxBonds: 1, commonGeometries: ['linear']
  },
  'I': {
    symbol: 'I', name: 'Iodine', valency: [1], atomicRadius: 1.40, covalentRadius: 1.39,
    color: '#940094', electronegativity: 2.66, maxBonds: 1, commonGeometries: ['linear']
  }
}

// Comprehensive bond length database (Angstroms)
const BOND_LENGTHS: Record<string, number> = {
  'H-H': 0.74, 'H-C': 1.09, 'H-N': 1.01, 'H-O': 0.96, 'H-S': 1.34,
  'C-C': 1.54, 'C=C': 1.34, 'C≡C': 1.20, 'C-N': 1.47, 'C=N': 1.29,
  'C-O': 1.43, 'C=O': 1.23, 'C-S': 1.82, 'C-F': 1.35, 'C-Cl': 1.77,
  'N-N': 1.45, 'N=N': 1.25, 'N≡N': 1.10, 'N-O': 1.36, 'N=O': 1.22,
  'O-O': 1.48, 'O=O': 1.21, 'S-S': 2.05, 'S=S': 1.89, 'S-O': 1.70
}

// Advanced chemical formula parser
const parseChemicalFormula = (formula: string): { [element: string]: number } => {
  const elementCount: { [element: string]: number } = {}
  
  // Remove whitespace and convert subscripts
  formula = formula.replace(/\s+/g, '')
  formula = formula.replace(/₀/g, '0').replace(/₁/g, '1').replace(/₂/g, '2')
                   .replace(/₃/g, '3').replace(/₄/g, '4').replace(/₅/g, '5')
                   .replace(/₆/g, '6').replace(/₇/g, '7').replace(/₈/g, '8').replace(/₉/g, '9')
  
  // Handle parentheses recursively
  const parseWithParentheses = (str: string): { [element: string]: number } => {
    const result: { [element: string]: number } = {}
    
    while (str.includes('(')) {
      const start = str.lastIndexOf('(')
      const end = str.indexOf(')', start)
      if (end === -1) break
      
      const inside = str.substring(start + 1, end)
      const afterParen = str.substring(end + 1)
      const multiplierMatch = afterParen.match(/^(\d+)/)
      const multiplier = multiplierMatch ? parseInt(multiplierMatch[1]) : 1
      
      const insideElements = parseWithParentheses(inside)
      for (const [element, count] of Object.entries(insideElements)) {
        result[element] = (result[element] || 0) + (count * multiplier)
      }
      
      str = str.substring(0, start) + str.substring(end + 1 + (multiplierMatch ? multiplierMatch[1].length : 0))
    }
    
    // Parse remaining elements
    const elementPattern = /([A-Z][a-z]?)(\d*)/g
    let match
    while ((match = elementPattern.exec(str)) !== null) {
      const element = match[1]
      const count = match[2] ? parseInt(match[2]) : 1
      result[element] = (result[element] || 0) + count
    }
    
    return result
  }
  
  return parseWithParentheses(formula)
}

// Intelligent molecular structure builder with VSEPR theory
class MolecularBuilder {
  private formula: string
  private name: string
  
  constructor(formula: string, name?: string) {
    this.formula = formula
    this.name = name || this.inferCompoundName(formula)
  }
  
  private inferCompoundName(formula: string): string {
    const commonCompounds: Record<string, string> = {
      'H2O': 'Water', 'CO2': 'Carbon Dioxide', 'NH3': 'Ammonia', 'CH4': 'Methane',
      'C2H6': 'Ethane', 'C2H4': 'Ethylene', 'C2H2': 'Acetylene', 'C6H6': 'Benzene',
      'H2SO4': 'Sulfuric Acid', 'HCl': 'Hydrogen Chloride', 'NaCl': 'Sodium Chloride',
      'C2H5OH': 'Ethanol', 'CH3COOH': 'Acetic Acid'
    }
    return commonCompounds[formula] || formula
  }
  
  async buildStructure(): Promise<MolecularData> {
    try {
      // Try predefined accurate structures first
      const predefined = this.getPredefinedStructure()
      if (predefined) return predefined
      
      // Generate using VSEPR theory and bonding rules
      return this.generateFromScratch()
      
    } catch (error) {
      console.error('Structure building error:', error)
      return this.createErrorStructure()
    }
  }
  
  private getPredefinedStructure(): MolecularData | null {
    const structures: Record<string, MolecularData> = {
      'H2O': {
        name: 'Water',
        formula: 'H2O',
        geometry: 'bent',
        isValid: true,
        source: 'generated',
        atoms: [
          { element: 'O', position: [0, 0, 0], color: '#ff0d0d', radius: 0.66, valency: 2 },
          { element: 'H', position: [0.96, 0, 0], color: '#ffffff', radius: 0.31, valency: 1 },
          { element: 'H', position: [-0.24, 0.93, 0], color: '#ffffff', radius: 0.31, valency: 1 }
        ],
        bonds: [
          { start: [0, 0, 0], end: [0.96, 0, 0], type: 'single', length: 0.96, startAtomIndex: 0, endAtomIndex: 1 },
          { start: [0, 0, 0], end: [-0.24, 0.93, 0], type: 'single', length: 0.96, startAtomIndex: 0, endAtomIndex: 2 }
        ]
      },
      'CH4': {
        name: 'Methane',
        formula: 'CH4',
        geometry: 'tetrahedral',
        isValid: true,
        source: 'generated',
        atoms: [
          { element: 'C', position: [0, 0, 0], color: '#404040', radius: 0.76, valency: 4 },
          { element: 'H', position: [1.09, 1.09, 1.09], color: '#ffffff', radius: 0.31, valency: 1 },
          { element: 'H', position: [-1.09, -1.09, 1.09], color: '#ffffff', radius: 0.31, valency: 1 },
          { element: 'H', position: [-1.09, 1.09, -1.09], color: '#ffffff', radius: 0.31, valency: 1 },
          { element: 'H', position: [1.09, -1.09, -1.09], color: '#ffffff', radius: 0.31, valency: 1 }
        ],
        bonds: [
          { start: [0, 0, 0], end: [1.09, 1.09, 1.09], type: 'single', length: 1.09, startAtomIndex: 0, endAtomIndex: 1 },
          { start: [0, 0, 0], end: [-1.09, -1.09, 1.09], type: 'single', length: 1.09, startAtomIndex: 0, endAtomIndex: 2 },
          { start: [0, 0, 0], end: [-1.09, 1.09, -1.09], type: 'single', length: 1.09, startAtomIndex: 0, endAtomIndex: 3 },
          { start: [0, 0, 0], end: [1.09, -1.09, -1.09], type: 'single', length: 1.09, startAtomIndex: 0, endAtomIndex: 4 }
        ]
      },
      'NH3': {
        name: 'Ammonia',
        formula: 'NH3',
        geometry: 'trigonal_pyramidal',
        isValid: true,
        source: 'generated',
        atoms: [
          { element: 'N', position: [0, 0, 0], color: '#3050f8', radius: 0.71, valency: 3 },
          { element: 'H', position: [1.01, 0, 0], color: '#ffffff', radius: 0.31, valency: 1 },
          { element: 'H', position: [-0.505, 0.875, 0], color: '#ffffff', radius: 0.31, valency: 1 },
          { element: 'H', position: [-0.505, -0.875, 0], color: '#ffffff', radius: 0.31, valency: 1 }
        ],
        bonds: [
          { start: [0, 0, 0], end: [1.01, 0, 0], type: 'single', length: 1.01, startAtomIndex: 0, endAtomIndex: 1 },
          { start: [0, 0, 0], end: [-0.505, 0.875, 0], type: 'single', length: 1.01, startAtomIndex: 0, endAtomIndex: 2 },
          { start: [0, 0, 0], end: [-0.505, -0.875, 0], type: 'single', length: 1.01, startAtomIndex: 0, endAtomIndex: 3 }
        ]
      },
      'CO2': {
        name: 'Carbon Dioxide',
        formula: 'CO2',
        geometry: 'linear',
        isValid: true,
        source: 'generated',
        atoms: [
          { element: 'C', position: [0, 0, 0], color: '#404040', radius: 0.76, valency: 4 },
          { element: 'O', position: [1.16, 0, 0], color: '#ff0d0d', radius: 0.66, valency: 2 },
          { element: 'O', position: [-1.16, 0, 0], color: '#ff0d0d', radius: 0.66, valency: 2 }
        ],
        bonds: [
          { start: [0, 0, 0], end: [1.16, 0, 0], type: 'double', length: 1.16, startAtomIndex: 0, endAtomIndex: 1 },
          { start: [0, 0, 0], end: [-1.16, 0, 0], type: 'double', length: 1.16, startAtomIndex: 0, endAtomIndex: 2 }
        ]
      },
      'NaCl': {
        name: 'Sodium Chloride',
        formula: 'NaCl',
        geometry: 'linear',
        isValid: true,
        source: 'generated',
        atoms: [
          { element: 'Na', position: [0, 0, 0], color: '#ab5cf2', radius: 1.86, valency: 1 },
          { element: 'Cl', position: [2.36, 0, 0], color: '#1ff01f', radius: 0.99, valency: 1 }
        ],
        bonds: [
          { start: [0, 0, 0], end: [2.36, 0, 0], type: 'single', length: 2.36, startAtomIndex: 0, endAtomIndex: 1 }
        ]
      },
      'HCl': {
        name: 'Hydrogen Chloride',
        formula: 'HCl',
        geometry: 'linear',
        isValid: true,
        source: 'generated',
        atoms: [
          { element: 'H', position: [0, 0, 0], color: '#ffffff', radius: 0.31, valency: 1 },
          { element: 'Cl', position: [1.27, 0, 0], color: '#1ff01f', radius: 0.99, valency: 1 }
        ],
        bonds: [
          { start: [0, 0, 0], end: [1.27, 0, 0], type: 'single', length: 1.27, startAtomIndex: 0, endAtomIndex: 1 }
        ]
      },
      'MgCl2': {
        name: 'Magnesium Chloride',
        formula: 'MgCl2',
        geometry: 'linear',
        isValid: true,
        source: 'generated',
        atoms: [
          { element: 'Mg', position: [0, 0, 0], color: '#8aff00', radius: 1.60, valency: 2 },
          { element: 'Cl', position: [2.20, 0, 0], color: '#1ff01f', radius: 0.99, valency: 1 },
          { element: 'Cl', position: [-2.20, 0, 0], color: '#1ff01f', radius: 0.99, valency: 1 }
        ],
        bonds: [
          { start: [0, 0, 0], end: [2.20, 0, 0], type: 'single', length: 2.20, startAtomIndex: 0, endAtomIndex: 1 },
          { start: [0, 0, 0], end: [-2.20, 0, 0], type: 'single', length: 2.20, startAtomIndex: 0, endAtomIndex: 2 }
        ]
      },
      'H2SO4': {
        name: 'Sulfuric Acid',
        formula: 'H2SO4',
        geometry: 'tetrahedral',
        isValid: true,
        source: 'generated',
        atoms: [
          { element: 'S', position: [0, 0, 0], color: '#ffff30', radius: 1.05, valency: 6 },
          { element: 'O', position: [1.44, 0, 0], color: '#ff0d0d', radius: 0.66, valency: 2 },
          { element: 'O', position: [-1.44, 0, 0], color: '#ff0d0d', radius: 0.66, valency: 2 },
          { element: 'O', position: [0, 1.44, 0], color: '#ff0d0d', radius: 0.66, valency: 2 },
          { element: 'O', position: [0, -1.44, 0], color: '#ff0d0d', radius: 0.66, valency: 2 },
          { element: 'H', position: [2.40, 0, 0], color: '#ffffff', radius: 0.31, valency: 1 },
          { element: 'H', position: [0, 2.40, 0], color: '#ffffff', radius: 0.31, valency: 1 }
        ],
        bonds: [
          { start: [0, 0, 0], end: [1.44, 0, 0], type: 'single', length: 1.44, startAtomIndex: 0, endAtomIndex: 1 },
          { start: [0, 0, 0], end: [-1.44, 0, 0], type: 'double', length: 1.44, startAtomIndex: 0, endAtomIndex: 2 },
          { start: [0, 0, 0], end: [0, 1.44, 0], type: 'single', length: 1.44, startAtomIndex: 0, endAtomIndex: 3 },
          { start: [0, 0, 0], end: [0, -1.44, 0], type: 'double', length: 1.44, startAtomIndex: 0, endAtomIndex: 4 },
          { start: [1.44, 0, 0], end: [2.40, 0, 0], type: 'single', length: 0.96, startAtomIndex: 1, endAtomIndex: 5 },
          { start: [0, 1.44, 0], end: [0, 2.40, 0], type: 'single', length: 0.96, startAtomIndex: 3, endAtomIndex: 6 }
        ]
      },
      'O2': {
        name: 'Oxygen',
        formula: 'O2',
        geometry: 'linear',
        isValid: true,
        source: 'generated',
        atoms: [
          { element: 'O', position: [0, 0, 0], color: '#ff0d0d', radius: 0.66, valency: 2 },
          { element: 'O', position: [1.21, 0, 0], color: '#ff0d0d', radius: 0.66, valency: 2 }
        ],
        bonds: [
          { start: [0, 0, 0], end: [1.21, 0, 0], type: 'double', length: 1.21, startAtomIndex: 0, endAtomIndex: 1 }
        ]
      },
      'N2': {
        name: 'Nitrogen',
        formula: 'N2',
        geometry: 'linear',
        isValid: true,
        source: 'generated',
        atoms: [
          { element: 'N', position: [0, 0, 0], color: '#3050f8', radius: 0.71, valency: 3 },
          { element: 'N', position: [1.10, 0, 0], color: '#3050f8', radius: 0.71, valency: 3 }
        ],
        bonds: [
          { start: [0, 0, 0], end: [1.10, 0, 0], type: 'triple', length: 1.10, startAtomIndex: 0, endAtomIndex: 1 }
        ]
      },
      'CaCl2': {
        name: 'Calcium Chloride',
        formula: 'CaCl2',
        geometry: 'linear',
        isValid: true,
        source: 'generated',
        atoms: [
          { element: 'Ca', position: [0, 0, 0], color: '#3dff00', radius: 1.76, valency: 2 },
          { element: 'Cl', position: [2.31, 0, 0], color: '#1ff01f', radius: 0.99, valency: 1 },
          { element: 'Cl', position: [-2.31, 0, 0], color: '#1ff01f', radius: 0.99, valency: 1 }
        ],
        bonds: [
          { start: [0, 0, 0], end: [2.31, 0, 0], type: 'single', length: 2.31, startAtomIndex: 0, endAtomIndex: 1 },
          { start: [0, 0, 0], end: [-2.31, 0, 0], type: 'single', length: 2.31, startAtomIndex: 0, endAtomIndex: 2 }
        ]
      }
    }
    
    return structures[this.formula] || null
  }
  
  private generateFromScratch(): MolecularData {
    const elementCounts = parseChemicalFormula(this.formula)
    const atoms: Atom[] = []
    const bonds: Bond[] = []
    
    // Determine central atom (least electronegative, excluding H)
    const centralAtom = this.determineCentralAtom(elementCounts)
    if (!centralAtom) return this.createErrorStructure()
    
    const centralData = PERIODIC_TABLE[centralAtom]
    if (!centralData) return this.createErrorStructure()
    
    // Place central atom
    atoms.push({
      element: centralAtom,
      position: [0, 0, 0],
      color: centralData.color,
      radius: centralData.covalentRadius,
      valency: centralData.valency[0]
    })
    
    // Place surrounding atoms using VSEPR geometry
    let atomIndex = 1
    for (const [element, count] of Object.entries(elementCounts)) {
      if (element === centralAtom) continue
      
      const elementData = PERIODIC_TABLE[element]
      if (!elementData) continue
      
      for (let i = 0; i < count; i++) {
        const bondLength = this.getBondLength(centralAtom, element)
        const position = this.getVSEPRPosition(atomIndex - 1, elementCounts, bondLength)
        
        atoms.push({
          element,
          position,
          color: elementData.color,
          radius: elementData.covalentRadius,
          valency: elementData.valency[0]
        })
        
        bonds.push({
          start: [0, 0, 0],
          end: position,
          type: 'single',
          length: bondLength,
          startAtomIndex: 0,
          endAtomIndex: atomIndex
        })
        
        atomIndex++
      }
    }
    
    return {
      name: this.name,
      formula: this.formula,
      atoms,
      bonds,
      geometry: this.determineGeometry(atoms.length - 1),
      isValid: true,
      source: 'generated'
    }
  }
  
  private determineCentralAtom(elementCounts: { [element: string]: number }): string | null {
    const candidates = Object.keys(elementCounts).filter(el => el !== 'H')
    if (candidates.length === 0) return Object.keys(elementCounts)[0]
    if (candidates.length === 1) return candidates[0]
    
    // Choose least electronegative
    let central = candidates[0]
    let lowestEN = PERIODIC_TABLE[central]?.electronegativity || 4.0
    
    for (const element of candidates) {
      const data = PERIODIC_TABLE[element]
      if (data && data.electronegativity < lowestEN) {
        central = element
        lowestEN = data.electronegativity
      }
    }
    
    return central
  }
  
  private getBondLength(el1: string, el2: string): number {
    const key1 = `${el1}-${el2}`
    const key2 = `${el2}-${el1}`
    return BOND_LENGTHS[key1] || BOND_LENGTHS[key2] || 
           (PERIODIC_TABLE[el1]?.covalentRadius || 1.0) + 
           (PERIODIC_TABLE[el2]?.covalentRadius || 1.0)
  }
  
  private getVSEPRPosition(atomIndex: number, elementCounts: { [element: string]: number }, bondLength: number): [number, number, number] {
    const totalAtoms = Object.values(elementCounts).reduce((sum, count) => sum + count, 0) - 1
    
    switch (totalAtoms) {
      case 1:
        return [bondLength, 0, 0]
      case 2:
        return atomIndex === 0 ? [bondLength, 0, 0] : [-bondLength, 0, 0]
      case 3:
        const angle = (atomIndex * 2 * Math.PI) / 3
        return [bondLength * Math.cos(angle), bondLength * Math.sin(angle), 0]
      case 4:
        // Tetrahedral positions
        const tetPositions: [number, number, number][] = [
          [1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]
        ]
        const pos = tetPositions[atomIndex] || [1, 0, 0]
        const scale = bondLength / Math.sqrt(3)
        return [pos[0] * scale, pos[1] * scale, pos[2] * scale]
      default:
        const defaultAngle = (atomIndex * 2 * Math.PI) / totalAtoms
        return [bondLength * Math.cos(defaultAngle), bondLength * Math.sin(defaultAngle), 0]
    }
  }
  
  private determineGeometry(numBonds: number): string {
    const geometries = ['point', 'linear', 'bent', 'trigonal_planar', 'tetrahedral', 'trigonal_bipyramidal', 'octahedral']
    return geometries[Math.min(numBonds, geometries.length - 1)]
  }
  
  private createErrorStructure(): MolecularData {
    return {
      name: 'Error',
      formula: this.formula,
      atoms: [],
      bonds: [],
      geometry: 'unknown',
      isValid: false,
      source: 'generated',
      errors: ['Failed to generate structure']
    }
  }
}

// 3D Molecule renderer
function Molecule3D({ molecularData }: { molecularData: MolecularData }) {
  return (
    <>
      {/* Atoms */}
      {molecularData.atoms.map((atom, index) => (
        <Sphere key={`atom-${index}`} position={atom.position} args={[atom.radius * 0.3]}>
          <meshStandardMaterial color={atom.color} />
        </Sphere>
      ))}
      
      {/* Bonds */}
      {molecularData.bonds.map((bond, index) => (
        <Bond3D key={`bond-${index}`} bond={bond} />
      ))}
      
      {/* Labels */}
      {molecularData.atoms.map((atom, index) => (
        <Text
          key={`label-${index}`}
          position={[atom.position[0], atom.position[1] + atom.radius + 0.3, atom.position[2]]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {atom.element}
        </Text>
      ))}
    </>
  )
}

// 3D Bond renderer
function Bond3D({ bond }: { bond: Bond }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const start = new THREE.Vector3(...bond.start)
  const end = new THREE.Vector3(...bond.end)
  const direction = end.clone().sub(start)
  const length = direction.length()
  const middle = start.clone().add(direction.clone().multiplyScalar(0.5))
  
  const up = new THREE.Vector3(0, 1, 0)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction.normalize())
  
  const bondRadius = bond.type === 'single' ? 0.05 : bond.type === 'double' ? 0.04 : 0.03
  
  return (
    <group>
      <mesh ref={meshRef} position={middle.toArray()} quaternion={quaternion.toArray()}>
        <cylinderGeometry args={[bondRadius, bondRadius, length, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {bond.type === 'double' && (
        <mesh position={[middle.x + 0.1, middle.y, middle.z]} quaternion={quaternion.toArray()}>
          <cylinderGeometry args={[bondRadius, bondRadius, length, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )}
      
      {bond.type === 'triple' && (
        <>
          <mesh position={[middle.x + 0.1, middle.y, middle.z]} quaternion={quaternion.toArray()}>
            <cylinderGeometry args={[bondRadius, bondRadius, length, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[middle.x - 0.1, middle.y, middle.z]} quaternion={quaternion.toArray()}>
            <cylinderGeometry args={[bondRadius, bondRadius, length, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </>
      )}
    </group>
  )
}

// Format chemical formulas with subscripts
const formatFormula = (formula: string): string => {
  if (!formula) return ''
  return formula.replace(/(\d+)/g, (match) => {
    const subscripts = '₀₁₂₃₄₅₆₇₈₉'
    return match.split('').map(digit => subscripts[parseInt(digit)]).join('')
  })
}

// Validate molecular structure against expected formula
const validateStructure = (molecularData: MolecularData, expectedFormula: string): { isValid: boolean, errors: string[] } => {
  const errors: string[] = []
  
  if (!molecularData.isValid) {
    return { isValid: false, errors: molecularData.errors || ['Structure generation failed'] }
  }
  
  const expected = parseChemicalFormula(expectedFormula)
  const actual: Record<string, number> = {}
  
  molecularData.atoms.forEach(atom => {
    actual[atom.element] = (actual[atom.element] || 0) + 1
  })
  
  // Check element counts
  for (const [element, expectedCount] of Object.entries(expected)) {
    const actualCount = actual[element] || 0
    if (actualCount !== expectedCount) {
      errors.push(`Element ${element}: expected ${expectedCount}, found ${actualCount}`)
    }
  }
  
  return { isValid: errors.length === 0, errors }
}

// Main component
function MolecularViewer3D({ compound, reactionResult, onDataExport }: MolecularViewer3DProps) {
  const [molecularData, setMolecularData] = useState<MolecularData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isRotating, setIsRotating] = useState(true)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  
  // Extract formula and name from props
  const getFormulaAndName = (): { formula: string; name: string } => {
    if (reactionResult?.chemicalFormula) {
      return {
        formula: reactionResult.chemicalFormula,
        name: reactionResult.compoundName || reactionResult.chemicalFormula
      }
    }
    
    if (typeof compound === 'string') {
      return { formula: compound, name: compound }
    }
    
    // Generate from compound array
    const elementCounts: Record<string, number> = {}
    compound.forEach(item => {
      elementCounts[item.element] = (elementCounts[item.element] || 0) + item.molecules
    })
    
    const formula = Object.entries(elementCounts)
      .map(([element, count]) => count > 1 ? `${element}${count}` : element)
      .join('')
    
    return { formula, name: formula }
  }
  
  // Build molecular structure
  useEffect(() => {
    const buildStructure = async () => {
      setLoading(true)
      setError(null)
      setValidationErrors([])
      
      try {
        const { formula, name } = getFormulaAndName()
        
        if (!formula) {
          setError('No valid chemical formula provided')
          return
        }
        
        const builder = new MolecularBuilder(formula, name)
        const structure = await builder.buildStructure()
        
        if (!structure.isValid) {
          setError('Failed to generate valid structure')
          setValidationErrors(structure.errors || [])
          setMolecularData(structure)
          return
        }
        
        // Validate structure
        const validation = validateStructure(structure, formula)
        if (!validation.isValid) {
          setValidationErrors(validation.errors)
        }
        
        setMolecularData(structure)
        
        // Export data if callback provided
        if (onDataExport) {
          onDataExport({
            structure3D: structure,
            isValid3D: validation.isValid,
            molecularFormula: formula,
            compoundName: name
          })
        }
        
      } catch (err) {
        console.error('Structure building error:', err)
        setError('Failed to build molecular structure')
      } finally {
        setLoading(false)
      }
    }
    
    buildStructure()
  }, [compound, reactionResult])

  // Analyze molecule using Gemini API
  const analyzeMolecule = async () => {
    if (!molecularData || !molecularData.isValid) {
      alert('No valid molecular structure to analyze!')
      return
    }

    try {
      setAnalysisLoading(true)
      
      const { formula, name } = getFormulaAndName()
      
      const prompt = `I need detailed structural analysis of ${name} (${formula}) to construct an accurate 3D molecular model. Please provide:

**STRUCTURAL DETAILS FOR 3D MODELING:**
1. Exact atomic coordinates and spatial arrangement
2. Bond lengths (in Angstroms) between all atom pairs
3. Bond angles (in degrees) with precise measurements
4. Dihedral/torsion angles for 3D orientation
5. Molecular geometry classification (VSEPR theory)
6. Hybridization state of each atom
7. Electron domain geometry vs molecular geometry
8. Any deviations from ideal angles due to lone pairs or steric effects

**CURRENT DETECTED STRUCTURE:**
- Atoms: ${molecularData.atoms.length}
- Bonds: ${molecularData.bonds.length} 
- Geometry: ${molecularData.geometry}
- Bond details: ${molecularData.bonds.map((bond, i) => 
  `${molecularData.atoms[bond.startAtomIndex]?.element || 'unknown'}-${molecularData.atoms[bond.endAtomIndex]?.element || 'unknown'} (${bond.type})`
).join(', ')}

**REQUIRED OUTPUT:**
Please provide precise numerical data that can be used to construct an accurate 3D molecular model with proper spatial relationships, bond distances, and angular geometry. Include any special structural features like ring strain, conjugation effects, or unusual bonding.`

      const response = await fetch('/api/reactions/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) {
        throw new Error(`Failed to get molecular analysis: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success && data.prediction) {
        setAnalysisResult(data.prediction)
      } else {
        throw new Error(data.error || 'Failed to analyze molecule')
      }
    } catch (error) {
      console.error('Error analyzing molecule:', error)
      alert(`Error analyzing molecule: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setAnalysisLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Building molecular structure...</span>
        </div>
      </div>
    )
  }
  
  const { formula, name } = getFormulaAndName()
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-gray-600">
            Formula: {formatFormula(formula)}
            {molecularData && (
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                {molecularData.geometry} • {molecularData.source}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={analyzeMolecule}
            disabled={analysisLoading || !molecularData?.isValid}
            className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            title="Analyze molecular structure with AI"
          >
            <Brain className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title={isRotating ? 'Pause rotation' : 'Start rotation'}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {validationErrors.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
            <span className="text-sm font-medium text-amber-800">Structure Validation Issues:</span>
          </div>
          <ul className="mt-1 text-xs text-amber-700">
            {validationErrors.map((error, index) => (
              <li key={index} className="ml-4">• {error}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="h-64 bg-gray-50 rounded-lg overflow-hidden border">
        {error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        ) : molecularData && molecularData.isValid ? (
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
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Structure unavailable</p>
            </div>
          </div>
        )}
      </div>
      
      {molecularData && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div><span className="font-medium">Atoms:</span> {molecularData.atoms.length}</div>
          <div><span className="font-medium">Bonds:</span> {molecularData.bonds.length}</div>
          <div><span className="font-medium">Geometry:</span> {molecularData.geometry}</div>
          <div><span className="font-medium">Source:</span> {molecularData.source}</div>
        </div>
      )}

      {/* Analysis Result */}
      {analysisResult && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Molecular Analysis</h4>
          <div className="text-sm text-blue-700 whitespace-pre-wrap">{analysisResult}</div>
          <button
            onClick={() => setAnalysisResult(null)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Hide Analysis
          </button>
        </div>
      )}

      {/* Analysis Loading */}
      {analysisLoading && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-gray-600">Analyzing molecular structure...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MolecularViewer3D
