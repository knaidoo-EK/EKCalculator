export type ProductType = 
  | 'thc-flower'
  | 'non-thc-flower'
  | 'oral-oil'
  | 'pastilles'
  | 'cartridges'

export interface Product {
  id: string
  type: ProductType
  name: string
  thcPercent?: number // For flowers
  ratio?: string // For oils/pastilles (e.g., "10:10")
  tubSize?: number // For flowers: 10 or 15 (grams)
}

export interface Limits {
  maxTHCDailyInhaled: number // mg
  maxTHCDailyOral: number // mg
  monthlyFlowerLimit: number // g (30, 35, 40, 45, 50, 55, or 60)
}

export interface GeneratedScript {
  productName: string
  type: ProductType
  instructions: string
  noteToPharmacy?: string
  warning?: boolean // For highlighting warnings (e.g., high THC average)
  repeats?: number // Number of repeats for flower scripts
}

