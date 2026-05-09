import { API_BASE, CART_API } from '@/config/api'

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

// Cart state management
class CartStore {
  private cartItems: CartItem[] = []

  constructor() {
    this.cartItems = loadCart()
  }

  getItems(): CartItem[] {
    return this.cartItems
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
  }

  getTotalCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0)
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
    saveCart(this.cartItems)
  }
}

export const cartStore = new CartStore()