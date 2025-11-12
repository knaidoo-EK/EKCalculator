<template>
  <div class="app-container">
    <!-- Header Bar -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-text">EK</span>
          <span class="logo-subtitle">Calculator</span>
        </div>
        <button v-if="activeTab === 'writer'" @click="resetAll" class="btn-reset">
          Reset All
        </button>
      </div>
    </header>

    <!-- Tabs -->
    <div class="tabs-container">
      <div class="tabs">
        <button 
          @click="activeTab = 'writer'" 
          :class="['tab', { active: activeTab === 'writer' }]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Script Writer
        </button>
        <button 
          @click="activeTab = 'calculators'" 
          :class="['tab', { active: activeTab === 'calculators' }]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="2" width="16" height="20" rx="2"/>
            <line x1="8" y1="6" x2="16" y2="6"/>
            <line x1="8" y1="10" x2="16" y2="10"/>
            <line x1="8" y1="14" x2="12" y2="14"/>
            <line x1="8" y1="18" x2="12" y2="18"/>
          </svg>
          THC Calculators
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Writer Tab Content -->
      <div v-if="activeTab === 'writer'" class="content-wrapper">
        <!-- Left Column -->
        <div class="left-column">
          <!-- Dose Limits Card -->
          <div class="card">
            <div class="card-header">
              <h2>Dose Limits</h2>
            </div>
            <div class="card-body limits-card-body">
              <div class="form-group form-group-half">
                <label for="monthly-flower">Monthly Flower Limit (g)</label>
                <select
                  id="monthly-flower"
                  v-model.number="limits.monthlyFlowerLimit"
                  class="form-input"
                >
                  <option :value="30">30g</option>
                  <option :value="35">35g</option>
                  <option :value="40">40g</option>
                  <option :value="45">45g</option>
                  <option :value="50">50g</option>
                  <option :value="55">55g</option>
                  <option :value="60">60g</option>
                </select>
              </div>
              <div class="form-group form-group-half">
                <label for="thc-oral">Max THC Daily Oral (mg)</label>
                <input
                  id="thc-oral"
                  type="number"
                  v-model.number="limits.maxTHCDailyOral"
                  min="0"
                  step="1"
                  placeholder="40"
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <!-- Products Card -->
          <div class="card">
            <div class="card-header">
              <h2>Products</h2>
            </div>
            <div class="card-body">
              <!-- THC Flower -->
              <div class="product-section">
                <h3>THC Flower</h3>
                <div v-for="(product, index) in thcFlowers" :key="product.id" class="product-row">
                  <div class="input-with-button">
                    <input
                      v-model.number="product.thcPercent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="THC %"
                      class="form-input product-input"
                      @input="onFlowerInput('thc-flower', index)"
                    />
                    <button
                      v-if="product.thcPercent !== undefined && product.thcPercent !== null"
                      @click="toggleTubSize(product.id)"
                      class="btn-tub-size"
                      :class="{ 'active': product.tubSize === 10 }"
                    >
                      {{ product.tubSize || 15 }}g
                    </button>
                  </div>
                  <button 
                    @click="removeProduct(product.id)" 
                    class="btn-secondary btn-small"
                    :disabled="thcFlowers.length === 1"
                  >Remove</button>
                </div>
              </div>

              <!-- Oral Oil -->
              <div class="product-section">
                <h3>Oral Oil</h3>
                <p class="help-text">Format: THC:CBD (e.g., 10:10 means 10mg THC:10mg CBD per ml)</p>
                <div v-for="(product, index) in oralOils" :key="product.id" class="product-row">
                  <input
                    v-model="product.ratio"
                    placeholder="Ratio (e.g., 10:10)"
                    class="form-input product-input"
                    @input="onRatioInput('oral-oil', index)"
                  />
                  <button 
                    @click="removeProduct(product.id)" 
                    class="btn-secondary btn-small"
                    :disabled="oralOils.length === 1"
                  >Remove</button>
                </div>
              </div>

              <!-- Pastilles -->
              <div class="product-section">
                <h3>Pastilles/Gummies</h3>
                <p class="help-text">Format: THC:CBD (e.g., 10:10 means 10mg THC:10mg CBD per pastille)</p>
                <div v-for="(product, index) in pastilles" :key="product.id" class="product-row">
                  <input
                    v-model="product.ratio"
                    placeholder="Ratio (e.g., 10:10)"
                    class="form-input product-input"
                    @input="onRatioInput('pastilles', index)"
                  />
                  <button 
                    @click="removeProduct(product.id)" 
                    class="btn-secondary btn-small"
                    :disabled="pastilles.length === 1"
                  >Remove</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Generated Scripts Card -->
          <div class="card">
            <div class="card-header">
              <h2>Generated Scripts</h2>
            </div>
            <div class="card-body">
              <div class="script-controls">
                <button 
                  @click="toggleScriptPeriod" 
                  class="btn-period"
                  :class="{ 'active': scriptPeriod === 6 }"
                >
                  {{ scriptPeriod }} Month Script
                </button>
                <button @click="generateScripts" class="btn-primary btn-generate">
                  Generate Scripts
                </button>
              </div>
              
              <div v-if="generatedScripts.length > 0" class="scripts-output">
                <div
                  v-for="(script, index) in generatedScripts"
                  :key="index"
                  class="script-card"
                  :class="{ 'script-warning': script.warning }"
                >
                  <h3>{{ script.productName }}</h3>
                  <div v-if="script.warning" class="warning-banner">
                    <span class="warning-icon">⚠️</span>
                    <span>Warning: Average THC% exceeds 25% with 60g monthly limit</span>
                  </div>
                  <div class="script-content">
                    <div class="script-section">
                      <div class="script-label-row">
                        <p class="script-label">Instructions:</p>
                        <button 
                          @click="copyInstructions(script)" 
                          class="btn-copy-icon"
                          title="Copy Instructions"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.5 4.5H3.5C2.67157 4.5 2 5.17157 2 6V12.5C2 13.3284 2.67157 14 3.5 14H10C10.8284 14 11.5 13.3284 11.5 12.5V10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M5.5 2H12.5C13.3284 2 14 2.67157 14 3.5V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M11 2V6H14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                          </svg>
                        </button>
                      </div>
                      <p class="script-text">{{ script.instructions }}</p>
                    </div>
                    <div v-if="script.repeats !== undefined" class="script-section">
                      <p class="script-label">Repeats:</p>
                      <p class="script-text">{{ script.repeats }} repeat{{ script.repeats !== 1 ? 's' : '' }} ({{ scriptPeriod }} month script)</p>
                    </div>
                    <div v-if="script.noteToPharmacy" class="script-section">
                      <div class="script-label-row">
                        <p class="script-label">Note to Pharmacy:</p>
                        <button 
                          @click="copyNoteToPharmacy(script)" 
                          class="btn-copy-icon"
                          title="Copy Note to Pharmacy"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.5 4.5H3.5C2.67157 4.5 2 5.17157 2 6V12.5C2 13.3284 2.67157 14 3.5 14H10C10.8284 14 11.5 13.3284 11.5 12.5V10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M5.5 2H12.5C13.3284 2 14 2.67157 14 3.5V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M11 2V6H14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                          </svg>
                        </button>
                      </div>
                      <p class="script-text">{{ script.noteToPharmacy }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Calculators Tab Content -->
      <div v-if="activeTab === 'calculators'" class="calculators-content">
        <div class="calculators-grid">
          <!-- Daily THC Calculator -->
          <div class="calc-card compact">
            <h3 class="calc-title">Daily THC</h3>
            <p class="calc-description">Daily limit: 500mg (30 day cycle)</p>
            <div class="calc-fields-horizontal">
              <div class="calc-field">
                <label>THC</label>
                <div class="input-with-unit">
                  <input v-model.number="thcPercent" type="number" min="8" max="40" step="0.1" />
                  <span class="input-unit">%</span>
                </div>
              </div>
              <div class="calc-field">
                <label>Monthly</label>
                <div class="input-with-unit">
                  <input v-model.number="monthlyLimit" type="number" min="10" max="100" step="10" />
                  <span class="input-unit">g</span>
                </div>
              </div>
            </div>
            <div class="calc-result compact">
              <div :class="['result-value', { 'within-limit': isWithinLimit, 'over-limit': !isWithinLimit }]">
                {{ dailyThcFromFlower }} mg/day
                <span class="limit-badge">{{ isWithinLimit ? '✓ Within Limit' : '✗ Exceeds Limit' }}</span>
              </div>
            </div>
          </div>

          <!-- Average THC Calculator -->
          <div class="calc-card compact">
            <h3 class="calc-title">Average THC %</h3>
            <p class="calc-description">Calculate average of multiple strains</p>
            <div class="strain-fields">
              <div v-for="(strain, index) in strains" :key="index" class="strain-field">
                <label>Strain {{ index + 1 }}</label>
                <div class="strain-input-group">
                  <div class="input-with-unit">
                    <input v-model.number="strain.percent" type="number" min="8" max="40" step="0.1" />
                    <span class="input-unit">%</span>
                  </div>
                  <button 
                    v-if="strains.length > 1" 
                    @click="removeStrain(index)" 
                    class="btn-remove-strain"
                    title="Remove strain"
                  >×</button>
                </div>
              </div>
            </div>
            <button 
              v-if="strains.length < 6" 
              @click="addStrain" 
              class="btn-add-strain"
            >+ Add Strain</button>
            <div class="calc-result compact">
              <div class="result-value">Avg: {{ averageThc }}%</div>
            </div>
          </div>

          <!-- Daily Vape Cart THC Calculator -->
          <div class="calc-card compact">
            <h3 class="calc-title">Vape Cart THC</h3>
            <p class="calc-description">Cart total mg (Daily limit: 500mg)</p>
            <div class="strain-fields">
              <div v-for="(cart, index) in carts" :key="index" class="strain-field">
                <label>Cart {{ index + 1 }} Total Mg</label>
                <div class="strain-input-group">
                  <div class="input-with-unit">
                    <input v-model.number="cart.mg" type="number" min="0" max="5000" step="100" />
                    <span class="input-unit">mg</span>
                  </div>
                  <span class="cart-daily-value">{{ (cart.mg / 30).toFixed(1) }}</span>
                  <button 
                    v-if="carts.length > 1" 
                    @click="removeCart(index)" 
                    class="btn-remove-strain"
                    title="Remove cart"
                  >×</button>
                </div>
              </div>
            </div>
            <button 
              v-if="carts.length < 6" 
              @click="addCart" 
              class="btn-add-strain"
            >+ Add Cart</button>
            <div class="calc-result compact">
              <div class="result-label">THC mg per day</div>
              <div class="result-value">{{ dailyThcFromCarts }}</div>
            </div>
          </div>

          <!-- Combined THC Calculator -->
          <div class="calc-card compact">
            <h3 class="calc-title">Combined THC</h3>
            <p class="calc-description">Flower + cart totals (mg/day)</p>
            <div class="calc-fields-horizontal">
              <div class="calc-field">
                <label>Flower</label>
                <div class="input-with-unit">
                  <input v-model.number="flowerThc" type="number" step="0.1" min="0" max="500" />
                  <span class="input-unit">mg</span>
                </div>
              </div>
              <div class="calc-field">
                <label>Vape</label>
                <div class="input-with-unit">
                  <input v-model.number="vapeThc" type="number" step="0.1" min="0" max="500" />
                  <span class="input-unit">mg</span>
                </div>
              </div>
            </div>
            <div class="calc-result compact">
              <div :class="['result-value', { 'within-limit': combinedIsWithinLimit, 'over-limit': !combinedIsWithinLimit }]">
                {{ combinedThcPerDay }} mg/day
                <span class="limit-badge">{{ combinedIsWithinLimit ? '✓ Within Limit' : '✗ Exceeds Limit' }}</span>
              </div>
            </div>
          </div>

          <!-- Repeat Calculator -->
          <div class="calc-card compact">
            <h3 class="calc-title">Repeats</h3>
            <p class="calc-description">Rounds down when tub exceeds limit</p>
            <div class="calc-fields-horizontal">
              <div class="calc-field">
                <label>Monthly</label>
                <div class="input-with-unit">
                  <input v-model.number="repeatMonthlyLimit" type="number" min="10" max="100" step="10" />
                  <span class="input-unit">g</span>
                </div>
              </div>
            </div>
            <div class="calc-result compact">
              <div class="result-row">
                <span class="result-label">10g tub repeats:</span>
                <span class="result-value">{{ repeats10g }}</span>
              </div>
              <div class="result-row">
                <span class="result-label">15g tub repeats:</span>
                <span class="result-value">{{ repeats15g }}</span>
              </div>
            </div>
          </div>

          <!-- WA Dispensing Calculator -->
          <div class="calc-card compact">
            <h3 class="calc-title">WA Dispensing</h3>
            <p class="calc-description">Western Australia dispensing guide</p>
            <div class="calc-fields-horizontal">
              <div class="calc-field">
                <label>Monthly</label>
                <div class="input-with-unit">
                  <input v-model.number="waMonthlyLimit" type="number" min="10" max="100" step="10" />
                  <span class="input-unit">g</span>
                </div>
              </div>
              <div class="calc-field">
                <label>THC</label>
                <div class="input-with-unit">
                  <input v-model.number="waThcPercent" type="number" min="8" max="40" step="0.1" />
                  <span class="input-unit">%</span>
                </div>
              </div>
            </div>
            <div class="calc-result compact">
              <div class="result-label">Dispense</div>
              <div class="result-value">{{ waDispense }}</div>
              <div :class="['result-value', { 'within-limit': waIsWithinLimit, 'over-limit': !waIsWithinLimit }]">
                {{ waDailyThc }} mg/day
                <span class="limit-badge">{{ waIsWithinLimit ? '✓ Within Limit' : '✗ Exceeds Limit' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="showToast" class="toast">
        <svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <span class="toast-text">Copied to clipboard</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Product, ProductType, Limits, GeneratedScript } from './types'
import { generateScriptsLogic } from './scriptGenerator'

// Tab management
const activeTab = ref<'writer' | 'calculators'>('writer')

// Original script generation state
const limits = ref<Limits>({
  maxTHCDailyInhaled: 500,
  maxTHCDailyOral: 40,
  monthlyFlowerLimit: 30,
})

const scriptPeriod = ref<number>(3) // 3 or 6 months

// Initialize with one empty product for each type
const products = ref<Product[]>([
  {
    id: 'thc-flower-1',
    type: 'thc-flower',
    name: '',
    thcPercent: undefined,
    tubSize: 15, // Default tub size
  },
  {
    id: 'oral-oil-1',
    type: 'oral-oil',
    name: '',
    ratio: '',
  },
  {
    id: 'pastilles-1',
    type: 'pastilles',
    name: '',
    ratio: '',
  },
])

const generatedScripts = ref<GeneratedScript[]>([])

const thcFlowers = computed(() => 
  products.value.filter(p => p.type === 'thc-flower')
)
const oralOils = computed(() => 
  products.value.filter(p => p.type === 'oral-oil')
)
const pastilles = computed(() => 
  products.value.filter(p => p.type === 'pastilles')
)

function addProduct(type: ProductType) {
  products.value.push({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type,
    name: '',
    thcPercent: type.includes('flower') ? undefined : undefined,
    ratio: type === 'oral-oil' || type === 'pastilles' ? '' : undefined,
    tubSize: type.includes('flower') ? 15 : undefined,
  })
}

function toggleTubSize(productId: string) {
  const product = products.value.find(p => p.id === productId)
  if (product) {
    product.tubSize = product.tubSize === 15 ? 10 : 15
  }
}

function toggleScriptPeriod() {
  scriptPeriod.value = scriptPeriod.value === 3 ? 6 : 3
}

function onFlowerInput(type: 'thc-flower', index: number) {
  const typeProducts = thcFlowers.value
  if (index === typeProducts.length - 1 && typeProducts[index].thcPercent !== undefined && typeProducts[index].thcPercent !== null) {
    addProduct(type)
  }
}

function onRatioInput(type: 'oral-oil' | 'pastilles', index: number) {
  const typeProducts = type === 'oral-oil' ? oralOils.value : pastilles.value
  if (index === typeProducts.length - 1 && typeProducts[index].ratio && typeProducts[index].ratio.trim() !== '') {
    addProduct(type)
  }
}

function removeProduct(id: string) {
  const productToRemove = products.value.find(p => p.id === id)
  if (!productToRemove) return
  
  const typeProducts = products.value.filter(p => p.type === productToRemove.type)
  
  if (typeProducts.length <= 1) {
    return
  }
  
  products.value = products.value.filter(p => p.id !== id)
}

function generateScripts() {
  const validProducts = products.value.filter(p => {
    if (p.type === 'thc-flower') {
      return p.thcPercent !== undefined && p.thcPercent !== null
    }
    if (p.type === 'oral-oil' || p.type === 'pastilles') {
      return p.ratio && p.ratio.trim() !== ''
    }
    return false
  })
  
  if (validProducts.length === 0) {
    alert('Please enter at least one product before generating scripts.')
    return
  }
  
  generatedScripts.value = generateScriptsLogic(validProducts, limits.value, scriptPeriod.value)
}

const showToast = ref(false)
let toastTimeout: number | undefined

function copyInstructions(script: GeneratedScript) {
  const text = script.instructions
  
  navigator.clipboard.writeText(text).then(() => {
    showToast.value = true
    if (toastTimeout) clearTimeout(toastTimeout)
    toastTimeout = setTimeout(() => {
      showToast.value = false
    }, 2000)
  })
}

function copyNoteToPharmacy(script: GeneratedScript) {
  if (!script.noteToPharmacy) return
  
  const text = script.noteToPharmacy
  
  navigator.clipboard.writeText(text).then(() => {
    showToast.value = true
    if (toastTimeout) clearTimeout(toastTimeout)
    toastTimeout = setTimeout(() => {
      showToast.value = false
    }, 2000)
  })
}

function resetAll() {
  if (confirm('Are you sure you want to reset everything? This will clear all products and generated scripts.')) {
    limits.value = {
      maxTHCDailyInhaled: 500,
      maxTHCDailyOral: 40,
      monthlyFlowerLimit: 30,
    }
    
    products.value = [
      {
        id: 'thc-flower-1',
        type: 'thc-flower',
        name: '',
        thcPercent: undefined,
        tubSize: 15,
      },
      {
        id: 'oral-oil-1',
        type: 'oral-oil',
        name: '',
        ratio: '',
      },
      {
        id: 'pastilles-1',
        type: 'pastilles',
        name: '',
        ratio: '',
      },
    ]
    
    generatedScripts.value = []
  }
}

// THC Calculators
const thcPercent = ref(24)
const monthlyLimit = ref(20)
const flowerThc = ref(45)
const vapeThc = ref(33)

// Dynamic cart list
const carts = ref([
  { mg: 0 }
])

const addCart = () => {
  if (carts.value.length < 6) {
    carts.value.push({ mg: 0 })
  }
}

const removeCart = (index: number) => {
  if (carts.value.length > 1) {
    carts.value.splice(index, 1)
  }
}

// Calculator for strains (dynamic)
const strains = ref([
  { percent: 0 }
])

const addStrain = () => {
  if (strains.value.length < 6) {
    strains.value.push({ percent: 0 })
  }
}

const removeStrain = (index: number) => {
  if (strains.value.length > 1) {
    strains.value.splice(index, 1)
  }
}

const dailyThcFromFlower = computed(() => {
  return ((monthlyLimit.value * thcPercent.value * 10) / 30).toFixed(0)
})

const isWithinLimit = computed(() => {
  return parseInt(dailyThcFromFlower.value) <= 500
})

const averageThc = computed(() => {
  const validStrains = strains.value.filter(s => s.percent > 0)
  if (validStrains.length === 0) return '0'
  const sum = validStrains.reduce((acc, s) => acc + s.percent, 0)
  const avg = sum / validStrains.length
  const rounded = Math.round(avg * 10) / 10
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1)
})

const dailyThcFromCarts = computed(() => {
  const total = carts.value.reduce((sum, cart) => sum + cart.mg, 0)
  return Math.round(total / 30)
})

const combinedThcPerDay = computed(() => {
  return parseFloat(flowerThc.value.toString()) + parseFloat(vapeThc.value.toString())
})

const combinedIsWithinLimit = computed(() => {
  return combinedThcPerDay.value <= 500
})

const repeatMonthlyLimit = ref(30)
const repeats10g = computed(() => Math.floor(repeatMonthlyLimit.value / 10))
const repeats15g = computed(() => Math.floor(repeatMonthlyLimit.value / 15))

// WA Dispensing Calculator
const waMonthlyLimit = ref(30)
const waThcPercent = ref(24)
const waDispense = computed(() => {
  const grams = waMonthlyLimit.value
  if (grams <= 10) return '1x 10g'
  if (grams <= 15) return '1x 15g'
  if (grams <= 20) return '2x 10g'
  if (grams <= 25) return '1x 10g, 1x 15g'
  if (grams <= 30) return '2x 15g'
  if (grams <= 40) return '2x 10g, 1x 15g'
  if (grams <= 45) return '3x 15g'
  if (grams <= 50) return '2x 10g, 2x 15g'
  return `${Math.floor(grams / 10)}x 10g`
})
const waDailyThc = computed(() => {
  return ((waMonthlyLimit.value * waThcPercent.value * 10) / 30).toFixed(0)
})
const waIsWithinLimit = computed(() => parseInt(waDailyThc.value) <= 500)
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
}

/* Header */
.app-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-4) var(--spacing-6);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-reset {
  background: var(--color-surface);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family-body);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-reset:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary-hover);
}

.logo {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.logo-text {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  letter-spacing: -0.5px;
}

.logo-subtitle {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
}

/* Tabs */
.tabs-container {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 0 var(--spacing-6);
  flex-shrink: 0;
}

.tabs {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: var(--spacing-2);
  border-bottom: 2px solid var(--color-border);
}

.tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  margin-bottom: -2px;
  font-family: var(--font-family-body);
}

.tab svg {
  flex-shrink: 0;
  stroke: currentColor;
}

.tab:hover {
  color: var(--color-primary);
  background: var(--color-background);
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  background: transparent;
}

/* Main Content */
.main-content {
  padding: var(--spacing-6);
  flex: 1;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-6);
}

/* Cards */
.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card-header {
  padding: var(--spacing-5) var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
}

.card-header h2 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
}

.card-body {
  padding: var(--spacing-6);
}

.limits-card-body {
  display: flex;
  gap: var(--spacing-4);
}

/* Form Elements */
.form-group {
  margin-bottom: 20px;
}

.form-group-half {
  flex: 1;
  margin-bottom: 0;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  margin-bottom: var(--spacing-2);
}

.form-input {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-border-hover);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-family: var(--font-family-body);
  color: var(--color-text);
  background: var(--color-surface);
  transition: all var(--transition-base);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring-shadow);
}

.form-input::placeholder {
  color: var(--color-text-placeholder);
}

select.form-input {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

/* Product Sections */
.product-section {
  margin-bottom: var(--spacing-8);
  padding-bottom: var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
}

.product-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.product-section h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-3);
}

.help-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-3);
  font-style: italic;
}

.product-row {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
  margin-bottom: var(--spacing-3);
}

.product-row:last-child {
  margin-bottom: 0;
}

.input-with-button {
  flex: 1;
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  min-width: 0;
}

.product-input {
  flex: 1;
  min-width: 0;
}

.btn-tub-size {
  background: var(--color-surface);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family-body);
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-tub-size:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary-hover);
}

.btn-tub-size.active {
  background: var(--color-primary);
  color: var(--color-surface);
  border-color: var(--color-primary);
}

.btn-tub-size.active:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

/* Buttons */
.btn-primary {
  background: var(--color-primary);
  color: var(--color-surface);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-body);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-primary:active {
  transform: translateY(1px);
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family-body);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-primary-light);
  border-color: var(--color-primary-hover);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.script-controls {
  display: flex;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-6);
}

.btn-period {
  background: var(--color-surface);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-5);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family-body);
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.btn-period:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary-hover);
}

.btn-period.active {
  background: var(--color-primary);
  color: var(--color-surface);
  border-color: var(--color-primary);
}

.btn-period.active:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.btn-generate {
  flex: 1;
  padding: 14px 24px;
  font-size: 15px;
}

.script-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.script-label {
  margin: 0;
}

.btn-copy-icon {
  background: transparent;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  padding: var(--spacing-1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  flex-shrink: 0;
}

.btn-copy-icon:hover {
  background: var(--color-primary-light);
  color: var(--color-primary-hover);
}

.btn-copy-icon:active {
  transform: scale(0.95);
}

.btn-copy-icon svg {
  display: block;
}

/* Script Cards */
.scripts-output {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.script-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  transition: all var(--transition-base);
}

.script-card:hover {
  box-shadow: var(--shadow-md);
}

.script-card.script-warning {
  border-color: var(--color-error);
  background: var(--color-red-50);
}

.script-card h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-4);
}

.warning-banner {
  background: var(--color-primary-light);
  border-left: 4px solid var(--color-error);
  padding: var(--spacing-3) var(--spacing-4);
  margin-bottom: var(--spacing-4);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-xs);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
}

.warning-icon {
  font-size: 16px;
}

.script-content {
  margin-bottom: 16px;
}

.script-section {
  margin-bottom: 16px;
}

.script-section:last-child {
  margin-bottom: 0;
}

.script-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.script-text {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* Calculators */
.calculators-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.calculators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

@media (min-width: 1200px) {
  .calculators-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.calc-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.calc-card.compact {
  padding: 1.25rem;
}

.calc-title {
  margin: 0 0 var(--spacing-2) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.calc-card.compact .calc-title {
  font-size: 1rem;
  margin-bottom: 0.375rem;
}

.calc-description {
  margin: 0 0 var(--spacing-5) 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}

.calc-card.compact .calc-description {
  font-size: 0.75rem;
  margin-bottom: 1rem;
}

.calc-fields-horizontal {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.calc-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex: 1;
  min-width: 0;
}

.calc-field label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.calc-field input,
.calc-field select {
  padding: var(--spacing-2) var(--spacing-2);
  border: 1px solid var(--color-border-hover);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  transition: all var(--transition-base);
  background: var(--color-surface);
  font-family: var(--font-family-body);
}

.calc-field input:focus,
.calc-field select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring-shadow);
}

.input-with-unit {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-unit input {
  flex: 1;
  padding-right: 2.5rem;
}

.input-unit {
  position: absolute;
  right: var(--spacing-3);
  color: var(--color-text-placeholder);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  pointer-events: none;
  user-select: none;
}

.strain-fields {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
}

.strain-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.strain-field label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
}

.strain-field input {
  height: 2.5rem;
  padding: var(--spacing-2) 2.5rem var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-border-hover);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: all var(--transition-base);
  font-family: var(--font-family-body);
}

.strain-field input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring-shadow);
}

.strain-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.strain-input-group .input-with-unit {
  flex: 1;
}

.btn-remove-strain {
  width: 28px;
  height: 28px;
  min-width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-red-100);
  color: var(--color-red-600);
  border: none;
  border-radius: var(--radius-md);
  font-size: 1.25rem;
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  cursor: pointer;
  transition: all var(--transition-base);
  padding: 0;
}

.btn-remove-strain:hover {
  background: var(--color-red-200);
  transform: scale(1.05);
}

.btn-add-strain {
  width: 100%;
  padding: var(--spacing-2);
  background: var(--color-primary-light);
  color: var(--color-primary);
  border: 1px dashed var(--color-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  margin-bottom: var(--spacing-3);
  font-family: var(--font-family-body);
}

.btn-add-strain:hover {
  background: var(--color-primary-100);
  border-color: var(--color-primary-hover);
}

.cart-daily-value {
  min-width: 60px;
  padding: var(--spacing-1) var(--spacing-3);
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-align: center;
  white-space: nowrap;
}

.calc-result {
  padding: var(--spacing-4);
  background: var(--color-primary-light);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.calc-result.compact {
  padding: 0.75rem;
}

.result-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-2);
}

.calc-result.compact .result-label {
  font-size: 0.6875rem;
  margin-bottom: 0.375rem;
}

.result-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
  flex-wrap: nowrap;
}

.calc-result.compact .result-value {
  font-size: 1.125rem;
}

.result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.result-row:not(:last-child) {
  border-bottom: 1px solid rgba(112, 82, 156, 0.15);
}

.result-row .result-label {
  margin: 0;
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.result-row .result-value {
  font-size: var(--font-size-xl);
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}

.limit-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.025em;
  white-space: nowrap;
  flex-shrink: 0;
  margin-left: auto;
}

.within-limit .limit-badge {
  background: var(--color-emerald-500);
  color: var(--color-surface);
  box-shadow: 0 1px 3px rgba(28, 192, 125, 0.3);
}

.over-limit {
  color: var(--color-red-600) !important;
}

.over-limit .limit-badge {
  background: var(--color-red-500);
  color: var(--color-surface);
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
}

/* Toast Notification */
.toast {
  position: fixed;
  bottom: var(--spacing-8);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  background: var(--color-primary);
  color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  z-index: 1000;
  pointer-events: none;
  font-family: var(--font-family-body);
}

.toast-icon {
  flex-shrink: 0;
  stroke-width: 2.5;
}

.toast-text {
  white-space: nowrap;
}

/* Toast Transitions */
.toast-enter-active {
  animation: toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  animation: toast-out 0.25s ease-in;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(1rem) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(0.5rem) scale(0.95);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .calculators-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }

  .card-body {
    padding: 20px;
  }

  .product-row {
    flex-direction: column;
    align-items: stretch;
  }

  .product-input {
    width: 100%;
  }

  .tabs-container {
    padding: 0 16px;
  }
  
  .tab {
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
  }
  
  .calculators-grid {
    grid-template-columns: 1fr;
  }
  
  .calc-fields-horizontal {
    flex-direction: column;
  }
  
  .calc-field {
    min-width: 100%;
  }
  
  .limit-badge {
    font-size: 0.6875rem;
    padding: 0.3125rem 0.625rem;
  }
  
  .result-value {
    font-size: 1rem !important;
  }
  
  .calc-result.compact .result-value {
    font-size: 1rem !important;
  }
  
  .btn-add-strain {
    font-size: 0.75rem;
    padding: 0.5rem;
  }
  
  .strain-field label {
    font-size: 0.6875rem;
  }
  
  .result-row .result-label {
    font-size: 0.8125rem;
  }
  
  .result-row .result-value {
    font-size: 1.125rem;
  }
  
  .btn-remove-strain {
    width: 26px;
    height: 26px;
    min-width: 26px;
    font-size: 1.125rem;
  }
  
  .cart-daily-value {
    min-width: 50px;
    font-size: 0.75rem;
    padding: 0.3125rem 0.625rem;
  }
}
</style>