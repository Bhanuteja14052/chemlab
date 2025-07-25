// Quick test for Gemini AI service to verify manual extraction
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Mock test for extractFieldsFromText method
const testText = `
Here is a response with control characters:
{
  "compoundName": "Carbon Dioxide",
  "chemicalFormula": "CO₂",
  "color": "colorless",
  "state": "gas",
  "explanation": "When carbon and oxygen combine, they form carbon dioxide, a colorless gas.",
  "safetyWarnings": ["Non-toxic but can displace oxygen", "Store in ventilated area"]
}
`;

// Manual extraction logic (simplified version)
function extractFieldsFromText(text) {
  console.log('Testing manual field extraction...');
  
  const compoundNameMatch = text.match(/"compoundName":\s*"([^"]*?)"/) || text.match(/compoundName['":\s]+([A-Za-z0-9\s,()]+)/);
  const formulaMatch = text.match(/"chemicalFormula":\s*"([^"]*?)"/) || text.match(/chemicalFormula['":\s]+([A-Za-z0-9₀-₉]+)/);
  const colorMatch = text.match(/"color":\s*"([^"]*?)"/) || text.match(/color['":\s]+([A-Za-z\s()]+)/);
  const stateMatch = text.match(/"state":\s*"([^"]*?)"/) || text.match(/state['":\s]+([A-Za-z\s()]+)/);
  
  const cleanText = text.replace(/[\r\n]+/g, ' ');
  const explanationMatch = cleanText.match(/"explanation":\s*"([^"]*?)"/) || 
                         cleanText.match(/explanation['":\s]+([^"}{]+)/) ||
                         cleanText.match(/reaction[^.]*?\..*?\..*?\./);
  
  const safetyWarningsMatch = text.match(/"safetyWarnings":\s*\[(.*?)\]/);
  let safetyWarnings = ['Handle with care'];
  if (safetyWarningsMatch) {
    const warningsText = safetyWarningsMatch[1];
    const warnings = warningsText.match(/"([^"]+)"/g);
    if (warnings && warnings.length > 0) {
      safetyWarnings = warnings.map(w => w.replace(/"/g, '').trim()).filter(w => w.length > 0);
    }
  }

  const result = {
    compoundName: compoundNameMatch ? compoundNameMatch[1].trim() : 'Unknown Compound',
    chemicalFormula: formulaMatch ? formulaMatch[1].trim() : 'Unknown',
    color: colorMatch ? colorMatch[1].trim() : 'colorless',
    state: stateMatch ? stateMatch[1].trim().toLowerCase() : 'unknown',
    safetyWarnings: safetyWarnings,
    explanation: explanationMatch ? explanationMatch[1].trim() : 'Chemical reaction analysis.'
  };

  console.log('Extracted result:', result);
  return result;
}

// Test the extraction
extractFieldsFromText(testText);

console.log('\nTesting complete. Manual extraction should work for AI responses with control characters.');
