import { API_BASE, CART_API } from '@/config/api'
import { getCartList, syncCartToServer } from '@/services/cart'

export interface CartItem {
  skuId: number
  quantity: number
  goodsName?: string
  goodsImage?: string
  price?: number
  specs?: string
}

export interface CartState {
  cartItems: CartItem[]
  totalPrice: number
  totalCount: number
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
const saveCart = (items: CartItem[]): void => {
  uni.setStorageSync('cart', JSON.stringify(items))
}

// Check if user is logged in
const isLoggedIn = (): boolean => {
  return !!uni.getStorageSync('userId')
}

// Cart state management
class CartStore {
  private cartItems: CartItem[] = []
  private selectedItems: Set<number> = new Set()

  constructor() {
    this.init()
  }

  private async init(): Promise<void> {
    this.cartItems = loadCart()
    if (isLoggedIn()) {
      await this.loadFromServer()
    }
  }

  private async loadFromServer(): Promise<void> {
    const userId = uni.getStorageSync('userId') || '1'
    try {
      const serverItems = await getCartList(userId)
      if (serverItems && serverItems.length > 0) {
        // Merge server items with local items (local takes priority for duplicates)
        const localMap = new Map(this.cartItems.map(item => [item.skuId, item]))
        for (const serverItem of serverItems) {
          if (!localMap.has(serverItem.skuId)) {
            this.cartItems.push(serverItem)
          }
        }
        saveCart(this.cartItems)
      }
    } catch (e) {
      // Fall back to local storage on API failure
      console.warn('Failed to load cart from server, using local cache', e)
    }
  }

  getItems(): CartItem[] {
    return this.cartItems
  }

  async reload(): Promise<void> {
    // Reload from local storage first (clear existing)
    this.cartItems = loadCart()
    // Then fetch latest from server and merge
    await this.loadFromServer()
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
  }

  getTotalCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  // Get selected items (if none selected, return all as default for checkout)
  getSelectedItems(): CartItem[] {
    if (this.selectedItems.size === 0) {
      return [...this.cartItems]
    }
    return this.cartItems.filter(item => this.selectedItems.has(item.skuId))
  }

  // Get total price of selected items
  getSelectedTotal(): number {
    return this.getSelectedItems().reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
  }

  // Toggle selection of a single item
  toggleSelect(skuId: number): void {
    if (this.selectedItems.has(skuId)) {
      this.selectedItems.delete(skuId)
    } else {
      this.selectedItems.add(skuId)
    }
  }

  // Select or deselect all items
  selectAll(selected: boolean): void {
    if (selected) {
      this.cartItems.forEach(item => this.selectedItems.add(item.skuId))
    } else {
      this.selectedItems.clear()
    }
  }

  // Check if all items are selected
  isAllSelected(): boolean {
    return this.cartItems.length > 0 && this.selectedItems.size === this.cartItems.length
  }

  // Get array of selected skuIds for checkout navigation
  getSelectedSkuIds(): number[] {
    const selected = this.getSelectedItems()
    return selected.map(item => item.skuId)
  }

  // Sync local cart to server (called on login)
  async syncToServer(): Promise<void> {
    if (!isLoggedIn()) return
    const userId = uni.getStorageSync('userId') || '1'
    try {
      await syncCartToServer(this.cartItems, userId)
    } catch (e) {
      console.warn('Failed to sync cart to server', e)
    }
  }

  addToCart(skuId: number, quantity: number): Promise<void> {
    return new Promise((resolve, reject) => {
      uni.request({
        url: `${API_BASE}${CART_API}`,
        method: 'POST',
        data: { skuId, quantity },
        header: { 'x-user-id': uni.getStorageSync('userId') || '1' },
        success: (res: any) => {
          if (res.statusCode === 200) {
            const existing = this.cartItems.find(item => item.skuId === skuId)
            if (existing) {
              existing.quantity += quantity
            } else {
              this.cartItems.push({ skuId, quantity })
            }
            // Auto-select newly added items
            this.selectedItems.add(skuId)
            saveCart(this.cartItems)
            resolve()
          } else {
            reject(res)
          }
        },
        fail: reject
      })
    })
  }

  removeFromCart(skuId: number): void {
    this.cartItems = this.cartItems.filter(item => item.skuId !== skuId)
    this.selectedItems.delete(skuId)
    saveCart(this.cartItems)
  }

  updateQuantity(skuId: number, quantity: number): void {
    const item = this.cartItems.find(item => item.skuId === skuId)
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(skuId)
      } else {
        item.quantity = quantity
        saveCart(this.cartItems)
      }
    }
  }

  clearCart(): void {
    this.cartItems = []
    this.selectedItems.clear()
    saveCart(this.cartItems)
  }
}

export const cartStore = new CartStore()