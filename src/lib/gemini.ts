import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Types for chemistry calculations
export interface ElementSpec {
  element: string;
  molecules: number;
  weight: number;
}

export interface ChemicalReactionParams {
  elements: string[] | ElementSpec[];
  temperature?: number;
  pressure?: number;
  volume?: number;
  weight?: number;
  mode: 'play' | 'practical';
}

export interface ChemicalReactionResult {
  compoundName: string;
  chemicalFormula: string;
  color: string;
  state: string;
  safetyWarnings: string[];
  explanation: string;
  reactionEquation?: string;
  temperature?: number;
  pressure?: number;
}

export class GeminiChemistryAI {
  private model;
  private isApiAvailable: boolean = true;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.checkApiAvailability();
  }

  private async checkApiAvailability(): Promise<void> {
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        this.isApiAvailable = false;
        console.warn('Gemini API key not configured properly');
        return;
      }
      // Simple test call to verify API access
      const testResult = await this.model.generateContent('Test');
      this.isApiAvailable = true;
    } catch (error: any) {
      console.warn('Gemini API not available:', error.message);
      this.isApiAvailable = false;
    }
  }

  /**
   * Main function to predict chemical reactions using Gemini AI
   */
  async predictReaction(params: ChemicalReactionParams): Promise<ChemicalReactionResult> {
    console.log('=== CHEMISTRY AI PREDICTION START ===');
    console.log('Received elements in order:', params.elements);
    console.log('Mode:', params.mode);
    
    // Check if API is available
    if (!this.isApiAvailable) {
      console.log('AI API not available, using fallback prediction');
      return this.getFallbackResult(params);
    }
    
    // Only log additional params if they have actual values (not undefined)
    const additionalParams = {
      ...(params.temperature !== undefined && { temperature: params.temperature }),
      ...(params.pressure !== undefined && { pressure: params.pressure }),
      ...(params.volume !== undefined && { volume: params.volume }),
      ...(params.weight !== undefined && { weight: params.weight })
    };
    
    if (Object.keys(additionalParams).length > 0) {
      console.log('Additional params:', additionalParams);
    }
    
    // Retry logic with exponential backoff for API errors
    const maxRetries = 2;
    let lastError: any = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const prompt = this.buildPrompt(params);
        console.log('Generated prompt:', prompt);
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('AI response received:', text);
        
        const parsedResult = this.parseResponse(text, params);
        console.log('Parsed result:', parsedResult);
        console.log('=== CHEMISTRY AI PREDICTION COMPLETE ===');
        
        return parsedResult;
      } catch (error: any) {
        lastError = error;
        console.error(`=== CHEMISTRY AI PREDICTION ERROR (Attempt ${attempt}/${maxRetries}) ===`);
        console.error('Error predicting reaction:', error);
        
        // If it's a 503 (overloaded) or rate limit error, wait and retry
        if (attempt < maxRetries && (
          error.message?.includes('503') || 
          error.message?.includes('overloaded') || 
          error.message?.includes('rate limit') ||
          error.message?.includes('403')
        )) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s
          console.log(`API issue detected, waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // For other errors or final attempt, break and use fallback
        break;
      }
    }
    
    console.error('All retry attempts failed, using fallback result');
    const fallbackResult = this.getFallbackResult(params);
    console.log('Using fallback result:', fallbackResult);
    return fallbackResult;
  }

  /**
   * Builds the prompt text based on the mode and reaction parameters.
   */
  private buildPrompt(params: ChemicalReactionParams): string {
    const { elements, temperature = 25, pressure = 1, volume = 100, weight = 1, mode } = params;
    
    // Convert elements to string format for the prompt
    const elementNames = Array.isArray(elements) && elements.length > 0 && typeof elements[0] === 'object'
      ? (elements as ElementSpec[]).map(spec => `${spec.molecules || 1} molecules of ${spec.element} (${spec.weight || 1}g)`)
      : (elements as string[]);

    if (mode === 'play') {
      const elementsText = Array.isArray(elementNames) ? elementNames.join(' + ') : elementNames;
      return `Analyze the chemical reaction when combining: ${elementsText}.

CRITICAL INSTRUCTIONS:
1. Predict the MOST LIKELY chemical compound that would form from these elements
2. Consider stoichiometry, electronegativity, and common oxidation states
3. If multiple compounds are possible, choose the most stable one under standard conditions
4. Provide realistic chemical and physical properties
5. Return ONLY valid JSON with NO line breaks or control characters in string values

Required JSON format (respond with valid JSON only):
{
  "compoundName": "Name of the compound formed",
  "chemicalFormula": "Chemical formula",
  "color": "Color description",
  "state": "Physical state at room temperature",
  "safetyWarnings": ["Warning 1", "Warning 2"],
  "explanation": "Detailed explanation of the reaction mechanism and properties"
}`;
    } else {
      const elementsText = Array.isArray(elementNames) ? elementNames.join(' + ') : elementNames;
      return `Predict reaction for ${elementsText} at ${temperature}°C, ${pressure} atm, ${volume} mL, ${weight}g.
Provide JSON with: compoundName, chemicalFormula, reactionEquation, color, state, safetyWarnings (array), explanation, temperature, pressure.
Make the explanation comprehensive and scientific - include detailed reaction mechanism, thermodynamics, kinetics, limiting reagent analysis, theoretical yield calculations, molecular orbital theory if applicable, and practical applications. Write at least 3-4 detailed paragraphs with complete scientific depth and analysis.`;
    }
  }

  /**
   * Parses the first JSON object in the AI response; falls back on default logic if parsing fails.
   */
  private parseResponse(text: string, params: ChemicalReactionParams): ChemicalReactionResult {
    console.log('Raw AI response received (first 500 chars):', text.substring(0, 500));
    
    // Skip JSON parsing entirely and go directly to manual extraction
    // This is more robust for handling AI responses with embedded control characters
    try {
      const manualResult = this.extractFieldsFromText(text, params);
      console.log('Manual extraction successful:', manualResult);
      return manualResult;
    } catch (extractError) {
      console.error('Manual extraction failed:', extractError);
      return this.getFallbackResult(params);
    }
  }

  /**
   * Processes a successfully parsed JSON response
   */
  private processValidJsonResponse(parsed: any, params: ChemicalReactionParams): ChemicalReactionResult {
    // Clean temperature and pressure values to be numbers only
    let temperature = parsed.temperature;
    let pressure = parsed.pressure;
    let color = parsed.color;
    
    if (typeof temperature === 'string') {
      temperature = parseFloat(temperature.replace(/[^\d.-]/g, '')) || params.temperature;
    }
    if (typeof pressure === 'string') {
      pressure = parseFloat(pressure.replace(/[^\d.-]/g, '')) || params.pressure;
    }
    if (typeof color === 'string') {
      color = this.getColorCode(color);
    }

    return {
      compoundName: parsed.compoundName || 'Unknown Compound',
      chemicalFormula: parsed.chemicalFormula || 'Unknown',
      color: color || '#e0f2fe',
      state: parsed.state || 'unknown',
      safetyWarnings: Array.isArray(parsed.safetyWarnings) ? parsed.safetyWarnings : ['Handle with care'],
      explanation: parsed.explanation || 'No explanation available.',
      reactionEquation: parsed.reactionEquation,
      temperature: temperature,
      pressure: pressure
    };
  }

  /**
   * Manually extracts fields from text when JSON parsing fails
   */
  private extractFieldsFromText(text: string, params: ChemicalReactionParams): ChemicalReactionResult {
    console.log('Attempting manual field extraction...');
    
    // Extract fields using more flexible regex patterns
    const compoundNameMatch = text.match(/"compoundName":\s*"([^"]*?)"/) || text.match(/compoundName['":\s]+([A-Za-z0-9\s,()]+)/);
    const formulaMatch = text.match(/"chemicalFormula":\s*"([^"]*?)"/) || text.match(/chemicalFormula['":\s]+([A-Za-z0-9₀-₉]+)/);
    const colorMatch = text.match(/"color":\s*"([^"]*?)"/) || text.match(/color['":\s]+([A-Za-z\s()]+)/);
    const stateMatch = text.match(/"state":\s*"([^"]*?)"/) || text.match(/state['":\s]+([A-Za-z\s()]+)/);
    
    // Extract explanation with more flexible pattern (use multiline content)
    const cleanText = text.replace(/[\r\n]+/g, ' ');
    const explanationMatch = cleanText.match(/"explanation":\s*"([^"]*?)"/) || 
                           cleanText.match(/explanation['":\s]+([^"}{]+)/) ||
                           cleanText.match(/reaction[^.]*?\..*?\..*?\./);
    
    // Extract safety warnings array with better handling
    const safetyWarningsMatch = text.match(/"safetyWarnings":\s*\[(.*?)\]/);
    let safetyWarnings = ['Handle with care'];
    if (safetyWarningsMatch) {
      const warningsText = safetyWarningsMatch[1];
      const warnings = warningsText.match(/"([^"]+)"/g);
      if (warnings && warnings.length > 0) {
        safetyWarnings = warnings.map(w => w.replace(/"/g, '').trim()).filter(w => w.length > 0);
      }
    }

    // Create result with extracted data
    const result = {
      compoundName: compoundNameMatch ? compoundNameMatch[1].trim() : 'Unknown Compound',
      chemicalFormula: formulaMatch ? formulaMatch[1].trim() : 'Unknown',
      color: colorMatch ? this.getColorCode(colorMatch[1].trim()) : '#e0f2fe',
      state: stateMatch ? stateMatch[1].trim().toLowerCase() : 'unknown',
      safetyWarnings: safetyWarnings,
      explanation: explanationMatch ? explanationMatch[1].trim() : 'Chemical reaction analysis.',
      temperature: params.temperature,
      pressure: params.pressure
    };

    console.log('Extracted result:', result);
    return result;
  }

  /**
   * Converts color names to hex codes for UI display
   */
  private getColorCode(colorName: string): string {
    const colorMap: { [key: string]: string } = {
      'red': '#ef4444',
      'blue': '#3b82f6',
      'green': '#22c55e',
      'yellow': '#eab308',
      'orange': '#f97316',
      'purple': '#a855f7',
      'pink': '#ec4899',
      'brown': '#a3a3a3',
      'black': '#000000',
      'white': '#ffffff',
      'gray': '#6b7280',
      'grey': '#6b7280',
      'clear': '#e0f2fe',
      'colorless': '#e0f2fe',
      'transparent': '#e0f2fe'
    };

    const normalizedColor = colorName.toLowerCase().trim();
    return colorMap[normalizedColor] || '#e0f2fe';
  }

  /**
   * Provides a fallback result when AI parsing fails
   */
  private getFallbackResult(params: ChemicalReactionParams): ChemicalReactionResult {
    const elementNames = Array.isArray(params.elements) && params.elements.length > 0 && typeof params.elements[0] === 'object'
      ? (params.elements as ElementSpec[]).map(spec => spec.element)
      : (params.elements as string[]);
    
    const elementString = Array.isArray(elementNames) ? elementNames.join(' + ') : elementNames;
    
    // Provide specific fallbacks for common combinations
    if (elementNames.includes('Hydrogen') && elementNames.includes('Oxygen')) {
      return {
        compoundName: 'Water',
        chemicalFormula: 'H₂O',
        color: '#e0f2fe',
        state: 'liquid',
        safetyWarnings: ['Exothermic reaction may produce heat'],
        explanation: `The formation of water from hydrogen and oxygen is a highly exothermic combustion reaction (2H₂ + O₂ → 2H₂O) that releases 286 kJ/mol of energy per mole of water formed. This reaction proceeds through a radical chain mechanism involving the formation of hydroxyl radicals (OH•) and hydrogen radicals (H•) as intermediates. The molecular orbital theory explains the stability of water through the overlap of hydrogen 1s orbitals with oxygen 2p orbitals, creating polar covalent bonds with a bond angle of approximately 104.5° due to the tetrahedral electron geometry around oxygen. Water's unique properties including high boiling point, surface tension, and ability to act as both acid and base make it essential for biological systems and industrial processes.`
      };
    }
    
    if (elementNames.includes('Sodium') && elementNames.includes('Chlorine')) {
      return {
        compoundName: 'Sodium Chloride',
        chemicalFormula: 'NaCl',
        color: '#f8fafc',
        state: 'solid',
        safetyWarnings: ['Ionic compound - handle with care', 'Avoid inhalation'],
        explanation: `The reaction between sodium and chlorine forms sodium chloride through ionic bonding. Sodium readily loses its valence electron to achieve a stable electron configuration, while chlorine gains an electron to complete its valence shell. This electron transfer creates Na⁺ and Cl⁻ ions that are held together by strong electrostatic forces in a cubic crystal lattice structure.`
      };
    }
    
    if (elementNames.includes('Potassium') && elementNames.includes('Chlorine')) {
      return {
        compoundName: 'Potassium Chloride',
        chemicalFormula: 'KCl',
        color: '#f8fafc',
        state: 'solid',
        safetyWarnings: ['Ionic compound - handle with care', 'Avoid inhalation'],
        explanation: `Potassium and chlorine react to form potassium chloride through ionic bonding (2K + Cl₂ → 2KCl). This is a highly exothermic reaction where potassium loses its outer electron to chlorine, forming K⁺ and Cl⁻ ions. The resulting white crystalline salt is commonly used as a fertilizer and salt substitute.`
      };
    }
    
    if (elementNames.includes('Carbon') && elementNames.includes('Oxygen')) {
      return {
        compoundName: 'Carbon Dioxide',
        chemicalFormula: 'CO₂',
        color: '#e0f2fe',
        state: 'gas',
        safetyWarnings: ['Asphyxiant gas - ensure ventilation', 'Greenhouse gas'],
        explanation: `The combustion of carbon with oxygen produces carbon dioxide through a highly exothermic reaction (C + O₂ → CO₂). This reaction involves breaking the O=O double bond and forming two new C=O double bonds, which are more stable and release significant energy. Carbon dioxide is a linear, nonpolar molecule essential for photosynthesis and respiration in biological systems.`
      };
    }
    
    if (elementNames.includes('Carbon') && elementNames.includes('Hydrogen')) {
      return {
        compoundName: 'Methane',
        chemicalFormula: 'CH₄',
        color: '#e0f2fe',
        state: 'gas',
        safetyWarnings: ['Flammable gas', 'Asphyxiant in high concentrations'],
        explanation: `The combination of carbon and hydrogen forms methane, the simplest hydrocarbon. This reaction (C + 2H₂ → CH₄) requires high energy input to break the strong bonds in both reactants. Methane has a tetrahedral molecular geometry with sp³ hybridized carbon, making it a stable and widely used fuel gas.`
      };
    }
    
    if (elementNames.includes('Iron') && elementNames.includes('Oxygen')) {
      return {
        compoundName: 'Iron Oxide',
        chemicalFormula: 'Fe₂O₃',
        color: '#dc2626',
        state: 'solid',
        safetyWarnings: ['May cause respiratory irritation', 'Avoid inhalation of dust'],
        explanation: `Iron reacts with oxygen to form iron(III) oxide, commonly known as rust. This oxidation reaction (4Fe + 3O₂ → 2Fe₂O₃) is thermodynamically favorable and occurs readily in the presence of moisture. The reddish-brown compound has ionic character with Fe³⁺ and O²⁻ ions.`
      };
    }
    
    if (elementNames.includes('Nitrogen') && elementNames.includes('Oxygen')) {
      return {
        compoundName: 'Nitrogen Dioxide',
        chemicalFormula: 'NO₂',
        color: '#dc2626',
        state: 'gas',
        safetyWarnings: ['Toxic gas', 'Avoid inhalation', 'Corrosive to respiratory system'],
        explanation: `Nitrogen and oxygen combine to form nitrogen dioxide, a reddish-brown toxic gas. The reaction (N₂ + 2O₂ → 2NO₂) requires high energy and typically occurs at elevated temperatures. NO₂ is an important atmospheric pollutant and plays a role in smog formation.`
      };
    }
    
    if (elementNames.includes('Calcium') && elementNames.includes('Oxygen')) {
      return {
        compoundName: 'Calcium Oxide',
        chemicalFormula: 'CaO',
        color: '#f8fafc',
        state: 'solid',
        safetyWarnings: ['Caustic - avoid skin contact', 'Reacts violently with water'],
        explanation: `Calcium reacts with oxygen to form calcium oxide (quicklime), a highly exothermic reaction (2Ca + O₂ → 2CaO). This white, crystalline compound is widely used in construction and chemical industries.`
      };
    }
    
    if (elementNames.includes('Magnesium') && elementNames.includes('Oxygen')) {
      return {
        compoundName: 'Magnesium Oxide',
        chemicalFormula: 'MgO',
        color: '#f8fafc',
        state: 'solid',
        safetyWarnings: ['Handle with care', 'Avoid inhalation of powder'],
        explanation: `Magnesium burns in oxygen to produce magnesium oxide in a brilliant white flame (2Mg + O₂ → 2MgO). This reaction releases significant energy and produces a basic oxide.`
      };
    }
    
    if (elementNames.includes('Sulfur') && elementNames.includes('Oxygen')) {
      return {
        compoundName: 'Sulfur Dioxide',
        chemicalFormula: 'SO₂',
        color: '#e0f2fe',
        state: 'gas',
        safetyWarnings: ['Toxic gas', 'Respiratory irritant', 'Ensure proper ventilation'],
        explanation: `Sulfur burns in oxygen to form sulfur dioxide (S + O₂ → SO₂), a colorless gas with a pungent odor. This compound is important in acid rain formation and industrial processes.`
      };
    }
    
    if (elementNames.includes('Aluminum') && elementNames.includes('Oxygen')) {
      return {
        compoundName: 'Aluminum Oxide',
        chemicalFormula: 'Al₂O₃',
        color: '#f8fafc',
        state: 'solid',
        safetyWarnings: ['Handle with care', 'Avoid inhalation of powder'],
        explanation: `Aluminum reacts with oxygen to form aluminum oxide (4Al + 3O₂ → 2Al₂O₃), a white crystalline compound known as alumina. This reaction is highly exothermic and forms a protective oxide layer on aluminum metal.`
      };
    }
    
    if (elementNames.includes('Zinc') && elementNames.includes('Oxygen')) {
      return {
        compoundName: 'Zinc Oxide',
        chemicalFormula: 'ZnO',
        color: '#f8fafc',
        state: 'solid',
        safetyWarnings: ['Handle with care', 'Avoid inhalation'],
        explanation: `Zinc burns in oxygen to form zinc oxide (2Zn + O₂ → 2ZnO), a white powder commonly used in sunscreens and cosmetics due to its UV-blocking properties.`
      };
    }
    
    if (elementNames.includes('Lithium') && elementNames.includes('Oxygen')) {
      return {
        compoundName: 'Lithium Oxide',
        chemicalFormula: 'Li₂O',
        color: '#f8fafc',
        state: 'solid',
        safetyWarnings: ['Caustic - avoid contact', 'Reacts with water'],
        explanation: `Lithium reacts with oxygen to form lithium oxide (4Li + O₂ → 2Li₂O), a white ionic compound that readily absorbs moisture and carbon dioxide from air.`
      };
    }
    
    if (elementNames.includes('Copper') && elementNames.includes('Oxygen')) {
      return {
        compoundName: 'Copper Oxide',
        chemicalFormula: 'CuO',
        color: '#000000',
        state: 'solid',
        safetyWarnings: ['Handle with care', 'Avoid inhalation'],
        explanation: `Copper reacts with oxygen to form copper(II) oxide (2Cu + O₂ → 2CuO), a black solid that forms when copper is heated in air. This compound is used in ceramics and as a catalyst.`
      };
    }
    
    if (elementNames.includes('Fluorine') && elementNames.includes('Hydrogen')) {
      return {
        compoundName: 'Hydrogen Fluoride',
        chemicalFormula: 'HF',
        color: '#e0f2fe',
        state: 'gas',
        safetyWarnings: ['EXTREMELY DANGEROUS', 'Highly toxic and corrosive', 'Can cause severe burns'],
        explanation: `Hydrogen and fluorine react violently to form hydrogen fluoride (H₂ + F₂ → 2HF), an extremely dangerous compound that can penetrate skin and attack bones. Handle only in specialized facilities.`
      };
    }
    
    
    // If no specific combination found, try to predict using basic chemistry rules
    const predictedCompound = this.predictCompoundByRules(elementNames);
    if (predictedCompound) {
      return predictedCompound;
    }
    
    return {
      compoundName: 'Mixed Compound',
      chemicalFormula: 'Unknown',
      color: '#e0f2fe',
      state: 'unknown',
      safetyWarnings: ['Unknown reaction - proceed with caution'],
      explanation: `Chemical combination of ${elementString}. The exact products depend on reaction conditions, stoichiometry, and thermodynamic factors. Consider common oxidation states and bonding patterns.`
    };
  }

  /**
   * Predicts compounds using basic chemistry rules for common element combinations
   */
  private predictCompoundByRules(elementNames: string[]): ChemicalReactionResult | null {
    // Metal + Halogen combinations (ionic compounds)
    const metals = ['Sodium', 'Potassium', 'Lithium', 'Calcium', 'Magnesium', 'Aluminum', 'Iron', 'Zinc', 'Copper'];
    const halogens = ['Fluorine', 'Chlorine', 'Bromine', 'Iodine'];
    const nonmetals = ['Oxygen', 'Sulfur', 'Nitrogen', 'Phosphorus'];
    
    const foundMetal = elementNames.find(e => metals.includes(e));
    const foundHalogen = elementNames.find(e => halogens.includes(e));
    const foundNonmetal = elementNames.find(e => nonmetals.includes(e));
    
    // Metal + Halogen -> Ionic compound
    if (foundMetal && foundHalogen && elementNames.length === 2) {
      const metalSymbols: {[key: string]: string} = {
        'Sodium': 'Na', 'Potassium': 'K', 'Lithium': 'Li', 'Calcium': 'Ca', 
        'Magnesium': 'Mg', 'Aluminum': 'Al', 'Iron': 'Fe', 'Zinc': 'Zn', 'Copper': 'Cu'
      };
      const halogenSymbols: {[key: string]: string} = {
        'Fluorine': 'F', 'Chlorine': 'Cl', 'Bromine': 'Br', 'Iodine': 'I'
      };
      
      const metalSymbol = metalSymbols[foundMetal];
      const halogenSymbol = halogenSymbols[foundHalogen];
      
      return {
        compoundName: `${foundMetal} ${foundHalogen.replace('ine', 'ide')}`,
        chemicalFormula: `${metalSymbol}${halogenSymbol}`,
        color: '#f8fafc',
        state: 'solid',
        safetyWarnings: ['Ionic compound - handle with care', 'Avoid inhalation'],
        explanation: `${foundMetal} reacts with ${foundHalogen.toLowerCase()} to form an ionic compound through electron transfer. The metal loses electrons to form a positive ion, while the halogen gains electrons to form a negative ion, creating a stable ionic lattice.`
      };
    }
    
    // Metal + Oxygen -> Metal oxide
    if (foundMetal && elementNames.includes('Oxygen') && elementNames.length === 2) {
      const metalSymbols: {[key: string]: string} = {
        'Sodium': 'Na', 'Potassium': 'K', 'Lithium': 'Li', 'Calcium': 'Ca', 
        'Magnesium': 'Mg', 'Aluminum': 'Al', 'Iron': 'Fe', 'Zinc': 'Zn', 'Copper': 'Cu'
      };
      
      const metalSymbol = metalSymbols[foundMetal];
      
      return {
        compoundName: `${foundMetal} Oxide`,
        chemicalFormula: `${metalSymbol}₂O`, // Simplified - actual formula depends on oxidation state
        color: foundMetal === 'Copper' ? '#000000' : '#f8fafc',
        state: 'solid',
        safetyWarnings: ['Handle with care', 'May be caustic'],
        explanation: `${foundMetal} reacts with oxygen to form ${foundMetal.toLowerCase()} oxide. This is typically an exothermic oxidation reaction that produces a stable metal oxide compound.`
      };
    }
    
    return null;
  }

  /**
   * Enhanced method to get molecular structure, bond angles, and 3D geometry
   */
  async getMolecularStructure(formula: string): Promise<{
    atoms: Array<{element: string, position: [number, number, number], bonds: number[]}>,
    bonds: Array<{type: 'single' | 'double' | 'triple', atoms: [number, number], length: number}>,
    geometry: string,
    bondAngles: Array<{atoms: [number, number, number], angle: number}>,
    hybridization: {[atomIndex: number]: string},
    polarMoments: {magnitude: number, direction: [number, number, number]},
    vseprData: {
      centralAtom: string,
      electronPairs: number,
      bondingPairs: number,
      lonePairs: number,
      geometry: string,
      bondAngle: number
    }
  }> {
    const prompt = `You are an expert chemistry AI. Analyze the molecular structure of ${formula} and provide EXACT 3D molecular data following these strict requirements:

CRITICAL REQUIREMENTS:
1. Count the EXACT number of atoms in the formula ${formula}
2. Ensure the 3D structure has EXACTLY the same number of atoms as in the formula
3. Use REAL bond lengths from chemistry literature (in Angstroms)
4. Calculate PRECISE bond angles based on VSEPR theory
5. Position atoms in 3D space using actual molecular geometry
6. Verify hybridization states match the molecular structure

STEP-BY-STEP ANALYSIS:
1. Parse formula ${formula} and count each atom type
2. Determine the central atom(s) and their hybridization
3. Apply VSEPR theory to get electron geometry and molecular shape
4. Calculate exact bond angles for this geometry
5. Place atoms in 3D coordinates using standard bond lengths
6. Verify total atom count matches formula

MOLECULAR GEOMETRY RULES:
- Linear: 180° bond angles
- Trigonal planar: 120° bond angles
- Tetrahedral: 109.5° bond angles
- Trigonal bipyramidal: 90°, 120° angles
- Octahedral: 90° bond angles
- Bent (water-like): ~104.5° for sp3, ~120° for sp2
- Trigonal pyramidal: ~107° (slightly less than tetrahedral)

STANDARD BOND LENGTHS (Angstroms):
- C-C: 1.54, C=C: 1.34, C≡C: 1.20
- C-H: 1.09, C-N: 1.47, C=N: 1.28
- C-O: 1.43, C=O: 1.22, C-F: 1.35
- N-H: 1.01, N-N: 1.45, N=N: 1.25
- O-H: 0.96, O-O: 1.48, S-S: 2.05
- All single bonds to hydrogen: ~1.0

Return ONLY valid JSON with this EXACT structure (no explanations):
{
  "atoms": [
    {
      "element": "Element symbol",
      "position": [x, y, z],
      "bonds": [index1, index2, ...]
    }
  ],
  "bonds": [
    {
      "type": "single|double|triple",
      "atoms": [atom1Index, atom2Index],
      "length": bondLengthInAngstroms
    }
  ],
  "geometry": "molecular geometry name",
  "bondAngles": [
    {
      "atoms": [atom1, centralAtom, atom2],
      "angle": angleInDegrees
    }
  ],
  "hybridization": {
    "0": "sp3|sp2|sp|etc",
    "1": "hybridization"
  },
  "polarMoments": {
    "magnitude": dipoleInDebye,
    "direction": [x, y, z]
  },
  "vseprData": {
    "centralAtom": "element",
    "electronPairs": totalElectronPairs,
    "bondingPairs": bondingPairs,
    "lonePairs": lonePairs,
    "geometry": "electronGeometry",
    "bondAngle": idealBondAngle
  }
}

VALIDATION CHECKLIST:
✓ Atom count in structure = atom count in formula ${formula}
✓ Bond angles match VSEPR theory
✓ Bond lengths are chemically accurate
✓ 3D coordinates form correct molecular shape
✓ Hybridization matches bonding pattern
✓ All atoms are connected properly

FORMULA TO ANALYZE: ${formula}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini molecular structure response:', text);
      
      // Clean the response and parse JSON
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const structureData = JSON.parse(cleanedText);
      
      // Validate atom count
      const expectedAtomCount = this.countAtomsInFormula(formula);
      const actualAtomCount = structureData.atoms?.length || 0;
      
      if (Math.abs(expectedAtomCount - actualAtomCount) > 1) {
        console.warn(`Atom count mismatch: expected ${expectedAtomCount}, got ${actualAtomCount}`);
        // Try to fix common issues
        return this.validateAndFixStructure(structureData, formula, expectedAtomCount);
      }
      
      return structureData;
    } catch (error) {
      console.error('Error getting molecular structure:', error);
      // Return enhanced fallback structure
      return this.getEnhancedFallbackStructure(formula);
    }
  }

  /**
   * Count atoms in a chemical formula
   */
  private countAtomsInFormula(formula: string): number {
    // Remove subscripts and count each element
    const matches = formula.match(/[A-Z][a-z]?\d*/g) || [];
    return matches.reduce((total, match) => {
      const numberMatch = match.match(/\d+/);
      const count = numberMatch ? parseInt(numberMatch[0]) : 1;
      return total + count;
    }, 0);
  }

  /**
   * Validate and fix molecular structure data
   */
  private validateAndFixStructure(structureData: any, formula: string, expectedAtomCount: number): any {
    // If too few atoms, try to add missing ones
    if (structureData.atoms.length < expectedAtomCount) {
      const missingCount = expectedAtomCount - structureData.atoms.length;
      console.log(`Adding ${missingCount} missing atoms`);
      
      // Add missing hydrogen atoms (most likely missing)
      for (let i = 0; i < missingCount; i++) {
        structureData.atoms.push({
          element: 'H',
          position: [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1],
          bonds: [0] // Connect to first atom
        });
        
        // Add corresponding bond
        structureData.bonds.push({
          type: 'single',
          atoms: [0, structureData.atoms.length - 1],
          length: 1.09
        });
      }
    }
    
    return structureData;
  }

  /**
   * Enhanced fallback molecular structure generator with accurate geometries
   */
  private getEnhancedFallbackStructure(formula: string): any {
    // Enhanced structures for common molecules with proper atom counts
    const enhancedStructures: {[key: string]: any} = {
      'H2O': {
        atoms: [
          {element: 'O', position: [0, 0, 0], bonds: [1, 2]},
          {element: 'H', position: [0.757, 0.587, 0], bonds: [0]},
          {element: 'H', position: [-0.757, 0.587, 0], bonds: [0]}
        ],
        bonds: [
          {type: 'single', atoms: [0, 1], length: 0.96},
          {type: 'single', atoms: [0, 2], length: 0.96}
        ],
        geometry: 'bent',
        bondAngles: [{atoms: [1, 0, 2], angle: 104.5}],
        hybridization: {'0': 'sp3', '1': 's', '2': 's'},
        polarMoments: {magnitude: 1.85, direction: [0, 1, 0]},
        vseprData: {
          centralAtom: 'O',
          electronPairs: 4,
          bondingPairs: 2,
          lonePairs: 2,
          geometry: 'tetrahedral',
          bondAngle: 104.5
        }
      },
      'CH4': {
        atoms: [
          {element: 'C', position: [0, 0, 0], bonds: [1, 2, 3, 4]},
          {element: 'H', position: [1.09, 0, 0], bonds: [0]},
          {element: 'H', position: [-0.36, 1.03, 0], bonds: [0]},
          {element: 'H', position: [-0.36, -0.51, 0.89], bonds: [0]},
          {element: 'H', position: [-0.36, -0.51, -0.89], bonds: [0]}
        ],
        bonds: [
          {type: 'single', atoms: [0, 1], length: 1.09},
          {type: 'single', atoms: [0, 2], length: 1.09},
          {type: 'single', atoms: [0, 3], length: 1.09},
          {type: 'single', atoms: [0, 4], length: 1.09}
        ],
        geometry: 'tetrahedral',
        bondAngles: [
          {atoms: [1, 0, 2], angle: 109.5},
          {atoms: [1, 0, 3], angle: 109.5},
          {atoms: [1, 0, 4], angle: 109.5}
        ],
        hybridization: {'0': 'sp3', '1': 's', '2': 's', '3': 's', '4': 's'},
        polarMoments: {magnitude: 0, direction: [0, 0, 0]},
        vseprData: {
          centralAtom: 'C',
          electronPairs: 4,
          bondingPairs: 4,
          lonePairs: 0,
          geometry: 'tetrahedral',
          bondAngle: 109.5
        }
      },
      'NH3': {
        atoms: [
          {element: 'N', position: [0, 0, 0], bonds: [1, 2, 3]},
          {element: 'H', position: [0.94, 0.33, 0], bonds: [0]},
          {element: 'H', position: [-0.47, 0.33, 0.81], bonds: [0]},
          {element: 'H', position: [-0.47, 0.33, -0.81], bonds: [0]}
        ],
        bonds: [
          {type: 'single', atoms: [0, 1], length: 1.01},
          {type: 'single', atoms: [0, 2], length: 1.01},
          {type: 'single', atoms: [0, 3], length: 1.01}
        ],
        geometry: 'trigonal_pyramidal',
        bondAngles: [{atoms: [1, 0, 2], angle: 107.8}],
        hybridization: {'0': 'sp3', '1': 's', '2': 's', '3': 's'},
        polarMoments: {magnitude: 1.47, direction: [0, 1, 0]},
        vseprData: {
          centralAtom: 'N',
          electronPairs: 4,
          bondingPairs: 3,
          lonePairs: 1,
          geometry: 'tetrahedral',
          bondAngle: 107.8
        }
      },
      'CO2': {
        atoms: [
          {element: 'C', position: [0, 0, 0], bonds: [1, 2]},
          {element: 'O', position: [1.16, 0, 0], bonds: [0]},
          {element: 'O', position: [-1.16, 0, 0], bonds: [0]}
        ],
        bonds: [
          {type: 'double', atoms: [0, 1], length: 1.16},
          {type: 'double', atoms: [0, 2], length: 1.16}
        ],
        geometry: 'linear',
        bondAngles: [{atoms: [1, 0, 2], angle: 180}],
        hybridization: {'0': 'sp', '1': 'sp2', '2': 'sp2'},
        polarMoments: {magnitude: 0, direction: [0, 0, 0]},
        vseprData: {
          centralAtom: 'C',
          electronPairs: 2,
          bondingPairs: 2,
          lonePairs: 0,
          geometry: 'linear',
          bondAngle: 180
        }
      },
      'PH3': {
        atoms: [
          {element: 'P', position: [0, 0, 0], bonds: [1, 2, 3]},
          {element: 'H', position: [1.42, 0, 0], bonds: [0]},
          {element: 'H', position: [-0.71, 1.23, 0], bonds: [0]},
          {element: 'H', position: [-0.71, -1.23, 0], bonds: [0]}
        ],
        bonds: [
          {type: 'single', atoms: [0, 1], length: 1.42},
          {type: 'single', atoms: [0, 2], length: 1.42},
          {type: 'single', atoms: [0, 3], length: 1.42}
        ],
        geometry: 'trigonal_pyramidal',
        bondAngles: [{atoms: [1, 0, 2], angle: 93.5}],
        hybridization: {'0': 'sp3', '1': 's', '2': 's', '3': 's'},
        polarMoments: {magnitude: 0.58, direction: [0, 1, 0]},
        vseprData: {
          centralAtom: 'P',
          electronPairs: 4,
          bondingPairs: 3,
          lonePairs: 1,
          geometry: 'tetrahedral',
          bondAngle: 93.5
        }
      }
    };

    // Try exact match first
    if (enhancedStructures[formula]) {
      return enhancedStructures[formula];
    }

    // Generate basic structure based on formula
    return this.generateBasicStructure(formula);
  }

  /**
   * Generate basic molecular structure when no predefined structure exists
   */
  private generateBasicStructure(formula: string): any {
    const atomCount = this.countAtomsInFormula(formula);
    
    // Simple linear arrangement for unknown molecules
    const atoms = [];
    const bonds = [];
    
    // Parse formula to get elements
    const matches = formula.match(/[A-Z][a-z]?\d*/g) || [];
    let atomIndex = 0;
    
    for (const match of matches) {
      const element = match.replace(/\d+/g, '');
      const count = parseInt(match.match(/\d+/)?.[0] || '1');
      
      for (let i = 0; i < count; i++) {
        atoms.push({
          element: element,
          position: [atomIndex * 1.5, 0, 0], // Linear arrangement
          bonds: atomIndex > 0 ? [atomIndex - 1] : (atomIndex < atomCount - 1 ? [atomIndex + 1] : [])
        });
        
        if (atomIndex > 0) {
          bonds.push({
            type: 'single',
            atoms: [atomIndex - 1, atomIndex],
            length: 1.5
          });
        }
        
        atomIndex++;
      }
    }

    return {
      atoms,
      bonds,
      geometry: atomCount > 2 ? 'linear' : atomCount === 2 ? 'linear' : 'atom',
      bondAngles: atomCount > 2 ? [{atoms: [0, 1, 2], angle: 180}] : [],
      hybridization: Object.fromEntries(atoms.map((_, i) => [i.toString(), 'sp3'])),
      polarMoments: {magnitude: 0, direction: [0, 0, 0]},
      vseprData: {
        centralAtom: atoms[0]?.element || 'X',
        electronPairs: Math.max(1, Math.floor(atomCount / 2)),
        bondingPairs: bonds.length,
        lonePairs: 0,
        geometry: 'linear',
        bondAngle: 180
      }
    };
  }

  /**
   * Get multiple possible compounds for given elements using AI
   * Note: This feature has been deprecated
   */
  async getPossibleCompounds(elements: ElementSpec[]): Promise<any[]> {
    console.log('getPossibleCompounds method deprecated - returning empty array');
    return [];
  }

  /**
   * Build prompt for getting multiple possible compounds
   * Note: This feature has been deprecated
   */
  private buildCompoundListPrompt(elements: ElementSpec[]): string {
    console.log('buildCompoundListPrompt method deprecated');
    return '';
  }

  /**
   * Parse compound list from AI response
   * Note: This feature has been deprecated
   */
  private parseCompoundList(response: string): any[] {
    console.log('parseCompoundList method deprecated - returning empty array');
    return [];
  }

  /**
   * Get compound color based on properties
   */
  private getCompoundColor(formula: string): string {
    if (formula.includes('O₂') || formula.includes('O')) return '#E3F2FD';
    if (formula.includes('N')) return '#F3E5F5';
    if (formula.includes('C')) return '#E8F5E8';
    if (formula.includes('S')) return '#FFF3E0';
    if (formula.includes('Cl')) return '#E0F2E1';
    if (formula.includes('Fe')) return '#FFECB3';
    return '#F8F9FA';
  }

  /**
   * Get compound common use
   */
  private getCompoundUse(name: string): string {
    const uses: { [key: string]: string } = {
      'Water': 'Drinking, industrial processes',
      'Carbon Dioxide': 'Fire extinguishers, carbonation',
      'Ammonia': 'Fertilizer, cleaning products',
      'Methane': 'Fuel, heating',
      'Sodium Chloride': 'Food seasoning, chemical processes'
    };
    return uses[name] || 'Various industrial applications';
  }
}

// Export singleton instance
export const geminiAI = new GeminiChemistryAI();
