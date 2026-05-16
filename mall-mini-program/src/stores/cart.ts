import { reactive, computed, watch } from 'vue'
import { API_BASE, CART_API, TENANT_ID } from '@/config/api'
import { getCartList, syncCartToServer } from '@/services/cart'

export interface CartItem {
  skuId: number
  quantity: number
  goodsName?: string
  goodsImage?: string
  price?: number
  specs?: string
  checked?: number
}

// Load cart from storage
const loadCart = (): CartItem[] => {
  try {
    const cart = uni.getStorageSync('cart')
    return cart ? JSON.parse(cart) : []
  } catch {
    return []
  }
}

// Save cart to storage
const saveCart = (items: CartItem[]) => {
  uni.setStorageSync('cart', JSON.stringify(items))
}

// Check if user is logged in
const isLoggedIn = (): boolean => {
  return !!uni.getStorageSync('userId')
}

// Reactive state using Vue 3 reactive()
const state = reactive<{
  cartItems: CartItem[]
  _selectedItems: number[]
  _inited: boolean
  _selectionTouched: boolean  // true after user first interacts with selection
}>({
  cartItems: loadCart(),
  _selectedItems: [],
  _inited: false,
  _selectionTouched: false
})

// Init cart from server
const init = async () => {
  if (state._inited || !isLoggedIn()) return
  state._inited = true
  const userId = uni.getStorageSync('userId') || '1'
  try {
    const serverItems = await getCartList(userId)
    if (serverItems && serverItems.length > 0) {
      const serverSkuIds = new Set(serverItems.map((item: any) => item.skuId))
      const localOnlyItems = state.cartItems.filter(item => !serverSkuIds.has(item.skuId))
      state.cartItems = [...localOnlyItems, ...serverItems]
      state._selectedItems = state.cartItems
        .filter(item => item.checked !== 0)
        .map(item => item.skuId)
      saveCart(state.cartItems)
    }
  } catch (e) {
    console.warn('Failed to load cart from server', e)
  }
}

// Reload cart
const reload = async () => {
  state.cartItems = loadCart()
  state._selectedItems = []
  state._inited = false
  await init()
  // Explicitly select all items on load, matching the visual checked state.
  // This avoids relying on getSelectedItems() empty-array convention.
  state._selectedItems = state.cartItems.map(item => item.skuId)
}

// Get selected items
const getSelectedItems = (): CartItem[] => {
  return state.cartItems.filter(item => state._selectedItems.includes(item.skuId))
}

// Get selected total
const getSelectedTotal = (): number => {
  return getSelectedItems().reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
}

// Toggle select single item
const toggleSelect = (skuId: number) => {
  console.log('[cart:store] toggleSelect BEFORE, _selectedItems=', [...state._selectedItems], 'length=', state._selectedItems.length)
  // First interaction: pre-populate with all skuIds so the visual "all selected"
  // state matches the internal array, allowing deselect to work correctly
  if (!state._selectionTouched) {
    state._selectedItems = state.cartItems.map(item => item.skuId)
  }
  state._selectionTouched = true
  const idx = state._selectedItems.indexOf(skuId)
  if (idx >= 0) {
    state._selectedItems.splice(idx, 1)
  } else {
    state._selectedItems.push(skuId)
  }
  console.log('[cart:store] toggleSelect AFTER, _selectedItems=', [...state._selectedItems], 'length=', state._selectedItems.length)
  console.log('[cart:store] toggleSelect AFTER, cartItems length=', state.cartItems.length)
}

// Select all
const selectAll = (selected: boolean) => {
  state._selectionTouched = true
  if (selected) {
    state._selectedItems = state.cartItems.map(item => item.skuId)
  } else {
    // Clear all - splice(0) removes all elements from index 0
    state._selectedItems.splice(0, state._selectedItems.length)
  }
}

// Is all selected
const isAllSelected = (): boolean => {
  if (!state._selectionTouched) return true
  return state.cartItems.length > 0 && state._selectedItems.length === state.cartItems.length
}

// Get selected skuIds for checkout
const getSelectedSkuIds = (): number[] => {
  return getSelectedItems().map(item => item.skuId)
}

// Sync to server
const syncToServer = async () => {
  if (!isLoggedIn()) return
  const userId = uni.getStorageSync('userId') || '1'
  try {
    await syncCartToServer(state.cartItems, userId)
  } catch (e) {
    console.warn('Failed to sync cart to server', e)
  }
}

// Add to cart
const addToCart = (skuId: number, quantity: number) => {
  return new Promise<void>((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${CART_API}`,
      method: 'POST',
      data: { skuId, quantity },
      header: { 'x-tenant-header': TENANT_ID, 'x-user-id': uni.getStorageSync('userId') || '1' },
      success: (res: any) => {
        if (res.statusCode === 200) {
          const existing = state.cartItems.find(item => item.skuId === skuId)
          if (existing) {
            existing.quantity += quantity
          } else {
            state.cartItems.push({ skuId, quantity, checked: 1 })
          }
          state._selectedItems.push(skuId)
          saveCart(state.cartItems)
          resolve()
        } else {
          reject(res)
        }
      },
      fail: reject
    })
  })
}

// Remove from cart
const removeFromCart = (skuId: number) => {
  state.cartItems = state.cartItems.filter(item => item.skuId !== skuId)
  const idx = state._selectedItems.indexOf(skuId)
  if (idx >= 0) state._selectedItems.splice(idx, 1)
  saveCart(state.cartItems)
}

// Update quantity
const updateQuantity = (skuId: number, quantity: number) => {
  const item = state.cartItems.find(item => item.skuId === skuId)
  if (item) {
    if (quantity <= 0) {
      removeFromCart(skuId)
    } else {
      item.quantity = quantity
      saveCart(state.cartItems)
    }
  }
}

// Clear cart
const clearCart = () => {
  state.cartItems = []
  state._selectedItems = []
  saveCart(state.cartItems)
}

// Export as cartStore proxy - directly expose the reactive state object
export const cartStore = {
  // Direct reactive state references
  get cartItems() { return state.cartItems },
  get _selectedItems() { return state._selectedItems },

  getSelectedItems,
  getSelectedTotal,
  toggleSelect,
  selectAll,
  isAllSelected,
  getSelectedSkuIds,
  syncToServer,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  reload,
  init
}