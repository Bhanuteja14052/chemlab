'use client'

import React, { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { X, RotateCcw, ZoomIn, ZoomOut, AlertTriangle, Download } from 'lucide-react'
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

interface MolecularExportData {
  structure3D: MolecularData | null
  structure2D: string | null
  isValid3D: boolean
  currentView: '3D' | '2D' | 'unavailable'
  molecularFormula: string
  compoundName: string
  pubchemCID?: string
  smiles?: string
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

interface MolecularViewer3DProps {
  compound: Array<{ element: string; molecules: number; weight: number }> | string
  reactionResult?: any
  onDataExport?: (data: MolecularExportData) => void
}

// Comprehensive periodic table data with accurate bonding information
const PERIODIC_TABLE: Record<string, ElementData> = {
  'H': { 
    symbol: 'H', name: 'Hydrogen', valency: [1], atomicRadius: 0.37, covalentRadius: 0.31,
    color: '#ffffff', electronegativity: 2.20, maxBonds: 1, commonGeometries: ['linear']
  },
  'C': {
    symbol: 'C', name: 'Carbon', valency: [4], atomicRadius: 0.70, covalentRadius: 0.76,
    color: '#404040', electronegativity: 2.55, maxBonds: 4, commonGeometries: ['tetrahedral', 'trigonal_planar', 'linear']
  },
  'N': {
    symbol: 'N', name: 'Nitrogen', valency: [3, 5], atomicRadius: 0.65, covalentRadius: 0.71,
    color: '#3050f8', electronegativity: 3.04, maxBonds: 4, commonGeometries: ['trigonal_pyramidal', 'trigonal_planar', 'linear']
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
    color: '#ffff30', electronegativity: 2.58, maxBonds: 6, commonGeometries: ['bent', 'tetrahedral', 'octahedral']
  },
  'P': {
    symbol: 'P', name: 'Phosphorus', valency: [3, 5], atomicRadius: 1.00, covalentRadius: 1.07,
    color: '#ff8000', electronegativity: 2.19, maxBonds: 5, commonGeometries: ['trigonal_pyramidal', 'trigonal_bipyramidal']
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
  },
  'Na': {
    symbol: 'Na', name: 'Sodium', valency: [1], atomicRadius: 1.86, covalentRadius: 1.66,
    color: '#ab5cf2', electronegativity: 0.93, maxBonds: 1, commonGeometries: ['linear']
  },
  'Mg': {
    symbol: 'Mg', name: 'Magnesium', valency: [2], atomicRadius: 1.60, covalentRadius: 1.41,
    color: '#8aff00', electronegativity: 1.31, maxBonds: 2, commonGeometries: ['linear', 'bent']
  },
  'Al': {
    symbol: 'Al', name: 'Aluminum', valency: [3], atomicRadius: 1.43, covalentRadius: 1.21,
    color: '#bfa6a6', electronegativity: 1.61, maxBonds: 3, commonGeometries: ['trigonal_planar']
  },
  'Si': {
    symbol: 'Si', name: 'Silicon', valency: [4], atomicRadius: 1.11, covalentRadius: 1.11,
    color: '#f0c8a0', electronegativity: 1.90, maxBonds: 4, commonGeometries: ['tetrahedral']
  },
  'K': {
    symbol: 'K', name: 'Potassium', valency: [1], atomicRadius: 2.27, covalentRadius: 2.03,
    color: '#8f40d4', electronegativity: 0.82, maxBonds: 1, commonGeometries: ['linear']
  },
  'Ca': {
    symbol: 'Ca', name: 'Calcium', valency: [2], atomicRadius: 1.97, covalentRadius: 1.76,
    color: '#3dff00', electronegativity: 1.00, maxBonds: 2, commonGeometries: ['linear', 'bent']
  },
  'Fe': {
    symbol: 'Fe', name: 'Iron', valency: [2, 3], atomicRadius: 1.26, covalentRadius: 1.32,
    color: '#e06633', electronegativity: 1.83, maxBonds: 6, commonGeometries: ['octahedral', 'tetrahedral']
  },
  'Cu': {
    symbol: 'Cu', name: 'Copper', valency: [1, 2], atomicRadius: 1.28, covalentRadius: 1.32,
    color: '#c88033', electronegativity: 1.90, maxBonds: 4, commonGeometries: ['tetrahedral', 'square_planar']
  },
  'Zn': {
    symbol: 'Zn', name: 'Zinc', valency: [2], atomicRadius: 1.34, covalentRadius: 1.22,
    color: '#7d80b0', electronegativity: 1.65, maxBonds: 4, commonGeometries: ['tetrahedral']
  }
}

// Standard bond lengths (in Angstroms, scaled for visualization)
const BOND_LENGTHS: Record<string, number> = {
  'H-H': 0.74, 'H-C': 1.09, 'H-N': 1.01, 'H-O': 0.96, 'H-S': 1.34, 'H-P': 1.42,
  'C-C': 1.54, 'C=C': 1.34, 'C≡C': 1.20, 'C-N': 1.47, 'C=N': 1.29, 'C≡N': 1.16,
  'C-O': 1.43, 'C=O': 1.23, 'C-S': 1.82, 'C-P': 1.84, 'C-F': 1.35, 'C-Cl': 1.77,
  'C-Br': 1.94, 'C-I': 2.14, 'N-N': 1.45, 'N=N': 1.25, 'N≡N': 1.10, 'N-O': 1.36,
  'N=O': 1.22, 'O-O': 1.48, 'O=O': 1.21, 'S-S': 2.05, 'S=S': 1.89, 'S-O': 1.70,
  'S=O': 1.49, 'S-P': 2.10, 'P-P': 2.21, 'P-O': 1.63, 'P=O': 1.50
}

// Advanced molecular formula parser with support for complex formulas
const parseChemicalFormula = (formula: string): { [element: string]: number } => {
  const elementCount: { [element: string]: number } = {}
  
  // Remove whitespace and standardize
  formula = formula.replace(/\s+/g, '')
  
  // Handle parentheses first (recursive parsing)
  const parseWithParentheses = (str: string): { [element: string]: number } => {
    const result: { [element: string]: number } = {}
    
    // Find and process parentheses
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

// Universal molecular structure generator using VSEPR theory and valency rules
class UniversalMolecularBuilder {
  private atoms: Atom[] = []
  private bonds: Bond[] = []
  private formula: string
  private name: string
  
  constructor(formula: string, name?: string) {
    this.formula = formula
    this.name = name || this.inferCompoundName(formula)
  }
  
  // Infer compound name from formula (basic implementation)
  private inferCompoundName(formula: string): string {
    const commonCompounds: Record<string, string> = {
      'H2O': 'Water', 'CO2': 'Carbon Dioxide', 'NH3': 'Ammonia', 'CH4': 'Methane',
      'C2H6': 'Ethane', 'C2H4': 'Ethylene', 'C2H2': 'Acetylene', 'C6H6': 'Benzene',
      'H2SO4': 'Sulfuric Acid', 'HCl': 'Hydrogen Chloride', 'NaCl': 'Sodium Chloride',
      'CaCO3': 'Calcium Carbonate', 'NH4OH': 'Ammonium Hydroxide', 'C6H12O6': 'Glucose',
      'C2H5OH': 'Ethanol', 'CH3COOH': 'Acetic Acid', 'C8H18': 'Octane'
    }
    
    return commonCompounds[formula] || formula
  }
  
  // Determine molecular connectivity and build 3D structure
  async buildMolecularStructure(): Promise<MolecularData> {
    const elementCounts = parseChemicalFormula(this.formula)
    
    try {
      // First, try predefined structures for common molecules
      const predefinedStructure = this.getPredefinedStructure()
      if (predefinedStructure) {
        return predefinedStructure
      }
      
      // For complex molecules, try PubChem API
      const pubchemStructure = await this.fetchFromPubChem()
      if (pubchemStructure) {
        return pubchemStructure
      }
      
      // Generate structure using VSEPR theory and connectivity rules
      return this.generateStructureFromScratch(elementCounts)
      
    } catch (error) {
      console.error('Error building molecular structure:', error)
      return this.createErrorStructure()
    }
  }
  
  // Predefined structures for common molecules with accurate geometries
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
          { element: 'O', position: [1.23, 0, 0], color: '#ff0d0d', radius: 0.66, valency: 2 },
          { element: 'O', position: [-1.23, 0, 0], color: '#ff0d0d', radius: 0.66, valency: 2 }
        ],
        bonds: [
          { start: [0, 0, 0], end: [1.23, 0, 0], type: 'double', length: 1.23, startAtomIndex: 0, endAtomIndex: 1 },
          { start: [0, 0, 0], end: [-1.23, 0, 0], type: 'double', length: 1.23, startAtomIndex: 0, endAtomIndex: 2 }
        ]
      },
      'C2H6': {
        name: 'Ethane',
        formula: 'C2H6',
        geometry: 'tetrahedral',
        isValid: true,
        source: 'generated',
        atoms: [
          { element: 'C', position: [-0.77, 0, 0], color: '#404040', radius: 0.76, valency: 4 },
          { element: 'C', position: [0.77, 0, 0], color: '#404040', radius: 0.76, valency: 4 },
          { element: 'H', position: [-1.16, 1.03, 0], color: '#ffffff', radius: 0.31, valency: 1 },
          { element: 'H', position: [-1.16, -0.52, 0.89], color: '#ffffff', radius: 0.31, valency: 1 },
          { element: 'H', position: [-1.16, -0.52, -0.89], color: '#ffffff', radius: 0.31, valency: 1 },
          { element: 'H', position: [1.16, 1.03, 0], color: '#ffffff', radius: 0.31, valency: 1 },
          { element: 'H', position: [1.16, -0.52, 0.89], color: '#ffffff', radius: 0.31, valency: 1 },
          { element: 'H', position: [1.16, -0.52, -0.89], color: '#ffffff', radius: 0.31, valency: 1 }
        ],
        bonds: [
          { start: [-0.77, 0, 0], end: [0.77, 0, 0], type: 'single', length: 1.54, startAtomIndex: 0, endAtomIndex: 1 },
          { start: [-0.77, 0, 0], end: [-1.16, 1.03, 0], type: 'single', length: 1.09, startAtomIndex: 0, endAtomIndex: 2 },
          { start: [-0.77, 0, 0], end: [-1.16, -0.52, 0.89], type: 'single', length: 1.09, startAtomIndex: 0, endAtomIndex: 3 },
          { start: [-0.77, 0, 0], end: [-1.16, -0.52, -0.89], type: 'single', length: 1.09, startAtomIndex: 0, endAtomIndex: 4 },
          { start: [0.77, 0, 0], end: [1.16, 1.03, 0], type: 'single', length: 1.09, startAtomIndex: 1, endAtomIndex: 5 },
          { start: [0.77, 0, 0], end: [1.16, -0.52, 0.89], type: 'single', length: 1.09, startAtomIndex: 1, endAtomIndex: 6 },
          { start: [0.77, 0, 0], end: [1.16, -0.52, -0.89], type: 'single', length: 1.09, startAtomIndex: 1, endAtomIndex: 7 }
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
          { element: 'O', position: [0, 1.49, 0], color: '#ff0d0d', radius: 0.66, valency: 2 },
          { element: 'O', position: [0, -1.49, 0], color: '#ff0d0d', radius: 0.66, valency: 2 },
          { element: 'O', position: [1.7, 0, 0], color: '#ff0d0d', radius: 0.66, valency: 2 },
          { element: 'O', position: [-1.7, 0, 0], color: '#ff0d0d', radius: 0.66, valency: 2 },
          { element: 'H', position: [2.66, 0, 0], color: '#ffffff', radius: 0.31, valency: 1 },
          { element: 'H', position: [-2.66, 0, 0], color: '#ffffff', radius: 0.31, valency: 1 }
        ],
        bonds: [
          { start: [0, 0, 0], end: [0, 1.49, 0], type: 'double', length: 1.49, startAtomIndex: 0, endAtomIndex: 1 },
          { start: [0, 0, 0], end: [0, -1.49, 0], type: 'double', length: 1.49, startAtomIndex: 0, endAtomIndex: 2 },
          { start: [0, 0, 0], end: [1.7, 0, 0], type: 'single', length: 1.7, startAtomIndex: 0, endAtomIndex: 3 },
          { start: [0, 0, 0], end: [-1.7, 0, 0], type: 'single', length: 1.7, startAtomIndex: 0, endAtomIndex: 4 },
          { start: [1.7, 0, 0], end: [2.66, 0, 0], type: 'single', length: 0.96, startAtomIndex: 3, endAtomIndex: 5 },
          { start: [-1.7, 0, 0], end: [-2.66, 0, 0], type: 'single', length: 0.96, startAtomIndex: 4, endAtomIndex: 6 }
        ]
      }
    }
    
    return structures[this.formula] || null
  }
  
  // Fetch molecular structure from PubChem database
  private async fetchFromPubChem(): Promise<MolecularData | null> {
    try {
      // First, search for the compound by formula
      const searchUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/formula/${this.formula}/cids/JSON`
      const searchResponse = await fetch(searchUrl)
      
      if (!searchResponse.ok) return null
      
      const searchData = await searchResponse.json()
      const cid = searchData.IdentifierList?.CID?.[0]
      
      if (!cid) return null
      
      // Get 3D coordinates if available
      const coordsUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/record/SDF`
      const coordsResponse = await fetch(coordsUrl)
      
      if (coordsResponse.ok) {
        const sdfData = await coordsResponse.text()
        return this.parseSDF(sdfData, cid.toString())
      }
      
      return null
    } catch (error) {
      console.error('PubChem fetch error:', error)
      return null
    }
  }
  
  // Parse SDF file format to extract 3D coordinates
  private parseSDF(sdfData: string, cid: string): MolecularData | null {
    try {
      const lines = sdfData.split('\n')
      const countsLine = lines[3]
      const atomCount = parseInt(countsLine.substring(0, 3))
      const bondCount = parseInt(countsLine.substring(3, 6))
      
      const atoms: Atom[] = []
      const bonds: Bond[] = []
      
      // Parse atoms
      for (let i = 4; i < 4 + atomCount; i++) {
        const line = lines[i]
        if (!line) continue
        
        const x = parseFloat(line.substring(0, 10))
        const y = parseFloat(line.substring(10, 20))
        const z = parseFloat(line.substring(20, 30))
        const element = line.substring(31, 34).trim()
        
        const elementData = PERIODIC_TABLE[element]
        if (elementData) {
          atoms.push({
            element,
            position: [x, y, z],
            color: elementData.color,
            radius: elementData.covalentRadius,
            valency: elementData.valency[0]
          })
        }
      }
      
      // Parse bonds
      for (let i = 4 + atomCount; i < 4 + atomCount + bondCount; i++) {
        const line = lines[i]
        if (!line) continue
        
        const atom1 = parseInt(line.substring(0, 3)) - 1
        const atom2 = parseInt(line.substring(3, 6)) - 1
        const bondType = parseInt(line.substring(6, 9))
        
        if (atom1 < atoms.length && atom2 < atoms.length) {
          bonds.push({
            start: atoms[atom1].position,
            end: atoms[atom2].position,
            type: bondType === 2 ? 'double' : bondType === 3 ? 'triple' : 'single',
            length: this.calculateDistance(atoms[atom1].position, atoms[atom2].position),
            startAtomIndex: atom1,
            endAtomIndex: atom2
          })
        }
      }
      
      return {
        name: this.name,
        formula: this.formula,
        atoms,
        bonds,
        geometry: 'complex',
        isValid: true,
        source: 'pubchem'
      }
    } catch (error) {
      console.error('SDF parsing error:', error)
      return null
    }
  }
  
  // Generate structure from scratch using VSEPR theory
  private generateStructureFromScratch(elementCounts: { [element: string]: number }): MolecularData {
    const atoms: Atom[] = []
    const bonds: Bond[] = []
    
    // Determine central atom (usually the least electronegative, excluding H)
    const centralAtom = this.determineCentralAtom(elementCounts)
    
    if (!centralAtom) {
      return this.createErrorStructure()
    }
    
    // Place central atom at origin
    const centralElementData = PERIODIC_TABLE[centralAtom]
    atoms.push({
      element: centralAtom,
      position: [0, 0, 0],
      color: centralElementData.color,
      radius: centralElementData.covalentRadius,
      valency: centralElementData.valency[0]
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
  
  // Determine central atom based on electronegativity and valency
  private determineCentralAtom(elementCounts: { [element: string]: number }): string | null {
    const candidates = Object.keys(elementCounts).filter(el => el !== 'H')
    
    if (candidates.length === 0) return Object.keys(elementCounts)[0]
    if (candidates.length === 1) return candidates[0]
    
    // Choose least electronegative atom with highest valency
    let centralAtom = candidates[0]
    let lowestEN = PERIODIC_TABLE[centralAtom]?.electronegativity || 4.0
    let highestValency = PERIODIC_TABLE[centralAtom]?.maxBonds || 1
    
    for (const element of candidates) {
      const elementData = PERIODIC_TABLE[element]
      if (!elementData) continue
      
      if (elementData.electronegativity < lowestEN || 
          (elementData.electronegativity === lowestEN && elementData.maxBonds > highestValency)) {
        centralAtom = element
        lowestEN = elementData.electronegativity
        highestValency = elementData.maxBonds
      }
    }
    
    return centralAtom
  }
  
  // Get bond length between two elements
  private getBondLength(element1: string, element2: string): number {
    const key1 = `${element1}-${element2}`
    const key2 = `${element2}-${element1}`
    
    return BOND_LENGTHS[key1] || BOND_LENGTHS[key2] || 
           (PERIODIC_TABLE[element1]?.covalentRadius || 1.0) + 
           (PERIODIC_TABLE[element2]?.covalentRadius || 1.0)
  }
  
  // Calculate VSEPR position for atom
  private getVSEPRPosition(atomIndex: number, elementCounts: { [element: string]: number }, bondLength: number): [number, number, number] {
    const totalAtoms = Object.values(elementCounts).reduce((sum, count) => sum + count, 0) - 1
    
    switch (totalAtoms) {
      case 1:
        return [bondLength, 0, 0]
      
      case 2:
        return atomIndex === 0 ? [bondLength, 0, 0] : [-bondLength, 0, 0]
      
      case 3:
        const angle120 = (atomIndex * 2 * Math.PI) / 3
        return [
          bondLength * Math.cos(angle120),
          bondLength * Math.sin(angle120),
          0
        ]
      
      case 4:
        const tetrahedralPositions: [number, number, number][] = [
          [1, 1, 1],
          [-1, -1, 1],
          [-1, 1, -1],
          [1, -1, -1]
        ]
        const pos = tetrahedralPositions[atomIndex]
        const scale = bondLength / Math.sqrt(3)
        return [pos[0] * scale, pos[1] * scale, pos[2] * scale]
      
      default:
        // Default to tetrahedral for complex cases
        const defaultAngle = (atomIndex * 2 * Math.PI) / totalAtoms
        return [
          bondLength * Math.cos(defaultAngle),
          bondLength * Math.sin(defaultAngle),
          0
        ]
    }
  }
  
  // Determine molecular geometry based on number of bonds
  private determineGeometry(numBonds: number): string {
    const geometries = ['linear', 'linear', 'bent', 'trigonal_planar', 'tetrahedral', 'trigonal_bipyramidal', 'octahedral']
    return geometries[Math.min(numBonds, geometries.length - 1)]
  }
  
  // Calculate distance between two points
  private calculateDistance(pos1: [number, number, number], pos2: [number, number, number]): number {
    const dx = pos2[0] - pos1[0]
    const dy = pos2[1] - pos1[1]
    const dz = pos2[2] - pos1[2]
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }
  
  // Create error structure when generation fails
  private createErrorStructure(): MolecularData {
    return {
      name: 'Error',
      formula: this.formula,
      atoms: [],
      bonds: [],
      geometry: 'unknown',
      isValid: false,
      source: 'generated',
      errors: ['Failed to generate molecular structure']
    }
  }
}

// Helper function to format chemical formulas with proper subscripts
const formatChemicalFormula = (formula: string): string => {
  if (!formula) return ''
  
  return formula.replace(/(\d+)/g, (match) => {
    const subscripts = '₀₁₂₃₄₅₆₇₈₉'
    return match.split('').map(digit => subscripts[parseInt(digit)]).join('')
  })
}

// Enhanced molecular structure validator
const validateMolecularStructure = (molecularData: MolecularData, expectedFormula: string): { isValid: boolean, errors: string[] } => {
  const errors: string[] = []
  
  if (!molecularData.isValid) {
    return { isValid: false, errors: molecularData.errors || ['Structure generation failed'] }
  }
  
  const expectedElements = parseChemicalFormula(expectedFormula)
  const actualElements: Record<string, number> = {}
  
  // Count atoms in 3D structure
  molecularData.atoms.forEach(atom => {
    actualElements[atom.element] = (actualElements[atom.element] || 0) + 1
  })
  
  // Validate element counts match
  for (const [element, expectedCount] of Object.entries(expectedElements)) {
    const actualCount = actualElements[element] || 0
    if (actualCount !== expectedCount) {
      errors.push(`Element ${element}: expected ${expectedCount}, found ${actualCount}`)
    }
  }
  
  // Check for extra elements
  for (const [element, actualCount] of Object.entries(actualElements)) {
    if (!(element in expectedElements)) {
      errors.push(`Unexpected element ${element} found (${actualCount} atoms)`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 2D Fallback structure viewer for complex molecules
const Structure2DViewer: React.FC<{ formula: string; name: string }> = ({ formula, name }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Try to fetch 2D structure from PubChem
    const fetch2DStructure = async () => {
      try {
        const searchUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/cids/JSON`
        const response = await fetch(searchUrl)
        
        if (response.ok) {
          const data = await response.json()
          const cid = data.IdentifierList?.CID?.[0]
          
          if (cid) {
            setImageUrl(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?record_type=2d&image_size=large`)
          }
        }
      } catch (error) {
        console.error('Failed to fetch 2D structure:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetch2DStructure()
  }, [formula, name])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingAnimation size="medium" />
      </div>
    )
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-64 p-4">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={`2D structure of ${name}`}
          className="max-w-full max-h-48 object-contain"
          onError={() => setImageUrl(null)}
        />
      ) : (
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">2D structure not available</p>
          <p className="text-xs text-gray-500 mt-1">Formula: {formatChemicalFormula(formula)}</p>
        </div>
      )}
    </div>
  )
}

// 3D Molecule renderer component
const Molecule3D: React.FC<{ molecularData: MolecularData }> = ({ molecularData }) => {
  return (
    <>
      {/* Render atoms */}
      {molecularData.atoms.map((atom, index) => (
        <Sphere key={`atom-${index}`} position={atom.position} args={[atom.radius * 0.5]}>
          <meshStandardMaterial color={atom.color} />
        </Sphere>
      ))}
      
      {/* Render bonds */}
      {molecularData.bonds.map((bond, index) => (
        <Bond3D key={`bond-${index}`} bond={bond} />
      ))}
      
      {/* Render atom labels */}
      {molecularData.atoms.map((atom, index) => (
        <Text
          key={`label-${index}`}
          position={[atom.position[0], atom.position[1] + atom.radius + 0.5, atom.position[2]]}
          fontSize={0.3}
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

// 3D Bond renderer component
const Bond3D: React.FC<{ bond: Bond }> = ({ bond }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const start = new THREE.Vector3(...bond.start)
  const end = new THREE.Vector3(...bond.end)
  const direction = end.clone().sub(start)
  const length = direction.length()
  const middle = start.clone().add(direction.clone().multiplyScalar(0.5))
  
  // Calculate rotation to align cylinder with bond direction
  const up = new THREE.Vector3(0, 1, 0)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction.normalize())
  
  const bondRadius = bond.type === 'single' ? 0.1 : bond.type === 'double' ? 0.08 : 0.06
  const bondColor = bond.type === 'aromatic' ? '#ff6b6b' : '#ffffff'
  
  return (
    <group>
      {/* Main bond */}
      <mesh ref={meshRef} position={middle.toArray()} quaternion={quaternion.toArray()}>
        <cylinderGeometry args={[bondRadius, bondRadius, length, 8]} />
        <meshStandardMaterial color={bondColor} />
      </mesh>
      
      {/* Additional bonds for double/triple bonds */}
      {bond.type === 'double' && (
        <mesh position={[middle.x + 0.2, middle.y, middle.z]} quaternion={quaternion.toArray()}>
          <cylinderGeometry args={[bondRadius, bondRadius, length, 8]} />
          <meshStandardMaterial color={bondColor} />
        </mesh>
      )}
      
      {bond.type === 'triple' && (
        <>
          <mesh position={[middle.x + 0.2, middle.y, middle.z]} quaternion={quaternion.toArray()}>
            <cylinderGeometry args={[bondRadius, bondRadius, length, 8]} />
            <meshStandardMaterial color={bondColor} />
          </mesh>
          <mesh position={[middle.x - 0.2, middle.y, middle.z]} quaternion={quaternion.toArray()}>
            <cylinderGeometry args={[bondRadius, bondRadius, length, 8]} />
            <meshStandardMaterial color={bondColor} />
          </mesh>
        </>
      )}
    </group>
  )
}

// Main MolecularViewer3D Component
const MolecularViewer3D: React.FC<MolecularViewer3DProps> = ({ 
  compound, 
  reactionResult, 
  onDataExport 
}) => {
  const [molecularData, setMolecularData] = useState<MolecularData | null>(null)
  const [view, setView] = useState<'3D' | '2D' | 'unavailable'>('3D')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isRotating, setIsRotating] = useState(true)
  
  // Extract formula from compound or reaction result
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
    
    // Generate formula from compound array
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
          setView('unavailable')
          return
        }
        
        const builder = new UniversalMolecularBuilder(formula, name)
        const structure = await builder.buildMolecularStructure()
        
        if (!structure.isValid) {
          setError('Failed to generate valid 3D structure')
          setValidationErrors(structure.errors || [])
          setView('2D')
          setMolecularData(structure)
          return
        }
        
        // Validate the generated structure
        const validation = validateMolecularStructure(structure, formula)
        
        if (!validation.isValid) {
          setValidationErrors(validation.errors)
          setView('2D')
        } else {
          setView('3D')
        }
        
        setMolecularData(structure)
        
        // Export molecular data if callback provided
        if (onDataExport) {
          const exportData: MolecularExportData = {
            structure3D: structure,
            structure2D: null,
            isValid3D: validation.isValid,
            currentView: validation.isValid ? '3D' : '2D',
            molecularFormula: formula,
            compoundName: name
          }
          onDataExport(exportData)
        }
        
      } catch (err) {
        console.error('Error building molecular structure:', err)
        setError('Failed to build molecular structure')
        setView('unavailable')
      } finally {
        setLoading(false)
      }
    }
    
    buildStructure()
  }, [compound, reactionResult, onDataExport])
  
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <LoadingAnimation size="large" />
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
            Formula: {formatChemicalFormula(formula)}
            {molecularData && (
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                {molecularData.geometry} • {molecularData.source}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('3D')}
              disabled={!molecularData?.isValid || validationErrors.length > 0}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                view === '3D' 
                  ? 'bg-white text-blue-600 shadow' 
                  : !molecularData?.isValid || validationErrors.length > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              3D
            </button>
            <button
              onClick={() => setView('2D')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                view === '2D' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              2D
            </button>
          </div>
          
          {view === '3D' && (
            <button
              onClick={() => setIsRotating(!isRotating)}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
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
        ) : view === '3D' && molecularData ? (
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
        ) : view === '2D' ? (
          <Structure2DViewer formula={formula} name={name} />
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
    </div>
  )
}

export default MolecularViewer3D
