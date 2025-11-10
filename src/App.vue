<template>
  <div class="app-container">
    <!-- Header Bar -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-text">EK</span>
          <span class="logo-subtitle">Calculator</span>
        </div>
        <button @click="resetAll" class="btn-reset">
          Reset All
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <div class="content-wrapper">
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
                          @click="(e: MouseEvent) => copyInstructions(script, e)" 
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
                          @click="(e: MouseEvent) => copyNoteToPharmacy(script, e)" 
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Product, ProductType, Limits, GeneratedScript } from './types'
import { generateScriptsLogic } from './scriptGenerator'

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
    name: '', // Not used in UI, but kept for type compatibility
    thcPercent: type.includes('flower') ? undefined : undefined,
    ratio: type === 'oral-oil' || type === 'pastilles' ? '' : undefined,
    tubSize: type.includes('flower') ? 15 : undefined, // Default tub size for flowers
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
  // If user is typing in the last field and it has a value, add a new one
  if (index === typeProducts.length - 1 && typeProducts[index].thcPercent !== undefined && typeProducts[index].thcPercent !== null) {
    addProduct(type)
  }
}

function onRatioInput(type: 'oral-oil' | 'pastilles', index: number) {
  const typeProducts = type === 'oral-oil' ? oralOils.value : pastilles.value
  // If user is typing in the last field and it has a value, add a new one
  if (index === typeProducts.length - 1 && typeProducts[index].ratio && typeProducts[index].ratio.trim() !== '') {
    addProduct(type)
  }
}

function removeProduct(id: string) {
  const productToRemove = products.value.find(p => p.id === id)
  if (!productToRemove) return
  
  const typeProducts = products.value.filter(p => p.type === productToRemove.type)
  
  // Don't allow removing if it's the last one of its type
  if (typeProducts.length <= 1) {
    return
  }
  
  products.value = products.value.filter(p => p.id !== id)
}

function generateScripts() {
  // Filter out empty products (no THC% for flowers, no ratio for oils/pastilles)
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

function copyInstructions(script: GeneratedScript, event: MouseEvent) {
  const text = script.instructions
  
  navigator.clipboard.writeText(text).then(() => {
    // Show brief feedback
    const button = (event?.currentTarget as HTMLElement) || (event?.target as HTMLElement)?.closest('button')
    if (button) {
      const originalHTML = button.innerHTML
      button.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      setTimeout(() => {
        button.innerHTML = originalHTML
      }, 1000)
    }
  })
}

function copyNoteToPharmacy(script: GeneratedScript, event: MouseEvent) {
  if (!script.noteToPharmacy) return
  
  const text = script.noteToPharmacy
  
  navigator.clipboard.writeText(text).then(() => {
    // Show brief feedback
    const button = (event?.currentTarget as HTMLElement) || (event?.target as HTMLElement)?.closest('button')
    if (button) {
      const originalHTML = button.innerHTML
      button.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      setTimeout(() => {
        button.innerHTML = originalHTML
      }, 1000)
    }
  })
}

function resetAll() {
  if (confirm('Are you sure you want to reset everything? This will clear all products and generated scripts.')) {
    // Reset limits to defaults
    limits.value = {
      maxTHCDailyInhaled: 500,
      maxTHCDailyOral: 40,
      monthlyFlowerLimit: 30,
    }
    
    // Reset products to initial state
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
    
    // Clear generated scripts
    generatedScripts.value = []
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #F5F5F5;
}

/* Header */
.app-header {
  background: #FFFFFF;
  border-bottom: 1px solid #E0E0E0;
  padding: 16px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-reset {
  background: #FFFFFF;
  color: #6B3E9E;
  border: 1px solid #6B3E9E;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset:hover {
  background: #EFE8F7;
  border-color: #5A2E85;
}

.logo {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: #6B3E9E;
  letter-spacing: -0.5px;
}

.logo-subtitle {
  font-size: 16px;
  font-weight: 500;
  color: #666666;
}

/* Main Content */
.main-content {
  padding: 24px;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* Cards */
.card {
  background: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #F0F0F0;
}

.card-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.card-body {
  padding: 24px;
}

.limits-card-body {
  display: flex;
  gap: 16px;
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
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #D0D0D0;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  color: #333333;
  background: #FFFFFF;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #6B3E9E;
  box-shadow: 0 0 0 3px rgba(107, 62, 158, 0.1);
}

.form-input::placeholder {
  color: #999999;
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
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #F0F0F0;
}

.product-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.product-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12px;
}

.help-text {
  font-size: 13px;
  color: #666666;
  margin-bottom: 12px;
  font-style: italic;
}

.product-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.product-row:last-child {
  margin-bottom: 0;
}

.input-with-button {
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.product-input {
  flex: 1;
  min-width: 0;
}

.btn-tub-size {
  background: #FFFFFF;
  color: #6B3E9E;
  border: 1px solid #6B3E9E;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-tub-size:hover {
  background: #EFE8F7;
  border-color: #5A2E85;
}

.btn-tub-size.active {
  background: #6B3E9E;
  color: #FFFFFF;
  border-color: #6B3E9E;
}

.btn-tub-size.active:hover {
  background: #5A2E85;
  border-color: #5A2E85;
}

/* Buttons */
.btn-primary {
  background: #6B3E9E;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #5A2E85;
}

.btn-primary:active {
  transform: translateY(1px);
}

.btn-secondary {
  background: #FFFFFF;
  color: #6B3E9E;
  border: 1px solid #6B3E9E;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover:not(:disabled) {
  background: #EFE8F7;
  border-color: #5A2E85;
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
  gap: 12px;
  margin-bottom: 24px;
}

.btn-period {
  background: #FFFFFF;
  color: #6B3E9E;
  border: 1px solid #6B3E9E;
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-period:hover {
  background: #EFE8F7;
  border-color: #5A2E85;
}

.btn-period.active {
  background: #6B3E9E;
  color: #FFFFFF;
  border-color: #6B3E9E;
}

.btn-period.active:hover {
  background: #5A2E85;
  border-color: #5A2E85;
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
  color: #6B3E9E;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-copy-icon:hover {
  background: #EFE8F7;
  color: #5A2E85;
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
  gap: 16px;
}

.script-card {
  background: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
}

.script-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.script-card.script-warning {
  border-color: #E53E3E;
  background: #FFF5F5;
}

.script-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16px;
}

.warning-banner {
  background: #EFE8F7;
  border-left: 4px solid #E53E3E;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #333333;
  font-weight: 500;
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
  font-size: 13px;
  font-weight: 600;
  color: #666666;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.script-text {
  font-size: 14px;
  color: #333333;
  line-height: 1.6;
  margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-wrapper {
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
}
</style>
