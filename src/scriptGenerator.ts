import type { Product, Limits, GeneratedScript } from './types'

export function generateScriptsLogic(
  products: Product[],
  limits: Limits,
  scriptPeriod: number = 3
): GeneratedScript[] {
  const scripts: GeneratedScript[] = []

  // Separate products by type
  const thcFlowers = products.filter(p => p.type === 'thc-flower')
  const oralOils = products.filter(p => p.type === 'oral-oil')
  const pastilles = products.filter(p => p.type === 'pastilles')

  // Generate THC Flower scripts
  if (thcFlowers.length > 0) {
    // Filter to only flowers with THC% and tub size
    const validFlowers = thcFlowers.filter(
      p => p.thcPercent !== undefined && p.thcPercent !== null && p.tubSize !== undefined
    )
    
    // Calculate average THC% for warning
    const validTHCValues = thcFlowers
      .map(p => p.thcPercent)
      .filter((thc): thc is number => thc !== undefined && thc !== null)
    const averageTHC = validTHCValues.length > 0
      ? validTHCValues.reduce((sum, thc) => sum + thc, 0) / validTHCValues.length
      : 0
    
    // Check if warning needed (60g limit with average THC > 25%)
    const needsWarning = limits.monthlyFlowerLimit === 60 && averageTHC > 25
    
    // Calculate max per day by dividing monthly limit by 30
    const maxGramsPerDay = limits.monthlyFlowerLimit / 30
    
    // Calculate repeats for script period
    let repeats: number[] = []
    if (validFlowers.length > 0) {
      const totalNeeded = limits.monthlyFlowerLimit * scriptPeriod
      const perFlowerAllocation = totalNeeded / validFlowers.length
      
      repeats = validFlowers.map(product => {
        const tubSize = product.tubSize || 15
        const totalTubs = perFlowerAllocation / tubSize
        // Round down to ensure we don't exceed limits
        const totalTubsRounded = Math.floor(totalTubs)
        // Repeats = total tubs - 1 (since 1 script is included)
        return Math.max(0, totalTubsRounded - 1)
      })
    }
    
    thcFlowers.forEach((product, index) => {
      const thcDisplay = product.thcPercent ? ` (${product.thcPercent}% THC)` : ''
      const productName = thcFlowers.length > 1 
        ? `THC Flower${thcDisplay} #${index + 1}`
        : `THC Flower${thcDisplay}`

      // Get repeat count for this product if it's valid
      const validIndex = validFlowers.findIndex(p => p.id === product.id)
      const repeatCount = validIndex >= 0 ? repeats[validIndex] : undefined

      scripts.push({
        productName,
        type: 'thc-flower',
        instructions: `(${limits.monthlyFlowerLimit}g/month max across all thc flowers combined) vape 0.1g via vaporiser device prn (as required) up to a maximum of ${maxGramsPerDay.toFixed(1)}g/day`,
        noteToPharmacy:
          'Please dispense in tandem with a dry herb vape and/or a grinder if required.',
        warning: needsWarning,
        repeats: repeatCount,
      })
    })
  }

  // Combine all oral products (oils + pastilles) for shared limit calculation
  const allOralProducts = [...oralOils, ...pastilles]

  // Generate Oral Oil scripts
  if (oralOils.length > 0) {
    oralOils.forEach((product, index) => {
      const productMaxML = calculateProductMaxML(
        product,
        allOralProducts,
        limits.maxTHCDailyOral
      )
      
      // Round down to nearest 0.1
      const roundedMaxML = roundDownToNearest(productMaxML, 0.1)

      const ratioDisplay = product.ratio ? ` (${product.ratio})` : ''
      const productName = oralOils.length > 1 
        ? `Oral Oil${ratioDisplay} #${index + 1}`
        : `Oral Oil${ratioDisplay}`

      scripts.push({
        productName,
        type: 'oral-oil',
        instructions: `Start with 0.1ml under the tongue at day/night for a minute then swallow remaining; increasing by 0.1ml every 3 days, up to max ${roundedMaxML.toFixed(1)}ml/day or until symptom controlled or side effects develop via oral route`,
      })
    })
  }

  // Generate Pastilles scripts
  if (pastilles.length > 0) {
    pastilles.forEach((product, index) => {
      const productMaxPastilles = calculateProductMaxPastilles(
        product,
        allOralProducts,
        limits.maxTHCDailyOral
      )
      
      // Round down to nearest 0.25
      const roundedMaxPastilles = roundDownToNearest(productMaxPastilles, 0.25)

      const ratioDisplay = product.ratio ? ` (${product.ratio})` : ''
      const productName = pastilles.length > 1 
        ? `Pastilles/Gummies${ratioDisplay} #${index + 1}`
        : `Pastilles/Gummies${ratioDisplay}`

      scripts.push({
        productName,
        type: 'pastilles',
        instructions: `Start by holding 0.25 pastille in mouth for a minute, then chew and swallow remaining; increase by 0.25 pastille every 5 days up to the maximum ${roundedMaxPastilles.toFixed(2)} pastille${roundedMaxPastilles !== 1 ? 's' : ''} per day`,
        noteToPharmacy:
          'Note: Please check pastille strength carefully (esp. THC) before specifying maximum per day',
      })
    })
  }

  return scripts
}

function calculateProductMaxGrams(
  product: Product,
  allProducts: Product[],
  maxTHCDaily: number
): number {
  if (allProducts.length === 1) return 1

  // Calculate THC per gram for each product
  // THC% means: if product is 20% THC, then 1g = 200mg THC
  const productTHC = (product.thcPercent || 0) * 10 // mg per gram
  const allTHCs = allProducts.map(p => (p.thcPercent || 0) * 10)
  const totalTHC = allTHCs.reduce((sum, thc) => sum + thc, 0)

  if (totalTHC === 0) {
    // Equal distribution if no THC specified
    return 1
  }

  // Check if using 1g each stays within limit
  const totalTHCAt1gEach = allTHCs.reduce((sum, thc) => sum + thc, 0)
  if (totalTHCAt1gEach <= maxTHCDaily) {
    return 1 // Each can get 1g if within limit
  } else {
    // Distribute proportionally based on THC content
    // Higher THC products get proportionally more grams
    const productMaxTHC = (productTHC / totalTHC) * maxTHCDaily
    const productMaxGrams = productMaxTHC / productTHC
    return Math.min(productMaxGrams, 1) // Cap at 1g per product
  }
}

function calculateProductMaxML(
  product: Product,
  allProducts: Product[],
  maxTHCDaily: number
): number {
  if (allProducts.length === 1) return 1

  const productRatio = parseRatio(product.ratio || '0:0')
  
  // Calculate total THC if all products were at max (1ml for oils, 1 pastille for pastilles)
  let totalTHCAtMax = 0
  allProducts.forEach(p => {
    const ratio = parseRatio(p.ratio || '0:0')
    totalTHCAtMax += ratio.thc // 1ml of oil or 1 pastille both contain ratio.thc mg THC
  })

  if (totalTHCAtMax === 0) {
    // Equal distribution if no THC specified
    return 1
  }

  // Check if using max for all products stays within limit
  if (totalTHCAtMax <= maxTHCDaily) {
    return 1 // Each can get 1ml if within limit
  } else {
    // Distribute proportionally based on THC content
    const productMaxTHC = (productRatio.thc / totalTHCAtMax) * maxTHCDaily
    const productMaxML = productMaxTHC / productRatio.thc
    return Math.min(productMaxML, 1) // Cap at 1ml per product
  }
}

function calculateProductMaxPastilles(
  product: Product,
  allProducts: Product[],
  maxTHCDaily: number
): number {
  if (allProducts.length === 1) return 1

  const productRatio = parseRatio(product.ratio || '0:0')
  
  // Calculate total THC if all products were at max (1ml for oils, 1 pastille for pastilles)
  let totalTHCAtMax = 0
  allProducts.forEach(p => {
    const ratio = parseRatio(p.ratio || '0:0')
    totalTHCAtMax += ratio.thc // 1ml of oil or 1 pastille both contain ratio.thc mg THC
  })

  if (totalTHCAtMax === 0) {
    // Equal distribution if no THC specified
    return 1
  }

  // Check if using max for all products stays within limit
  if (totalTHCAtMax <= maxTHCDaily) {
    return 1 // Each can get 1 pastille if within limit
  } else {
    // Distribute proportionally based on THC content
    const productMaxTHC = (productRatio.thc / totalTHCAtMax) * maxTHCDaily
    const productMaxPastilles = productMaxTHC / productRatio.thc
    return Math.min(productMaxPastilles, 1) // Cap at 1 pastille per product
  }
}

function parseRatio(ratio: string): { thc: number; cbd: number } {
  const parts = ratio.split(':').map((p) => parseFloat(p.trim()) || 0)
  return {
    thc: parts[0] || 0,
    cbd: parts[1] || 0,
  }
}

function roundDownToNearest(value: number, increment: number): number {
  return Math.floor(value / increment) * increment
}

