<template>
  <view class="cart-page">
    <!-- Cart items list -->
    <scroll-view class="cart-scroll" scroll-y v-if="cartItems.length > 0">
      <view class="cart-list">
        <view
          v-for="(item, index) in cartItems"
          :key="item.skuId"
          class="cart-item"
        >
          <view class="swipe-item" :class="{ 'swipe-open': activeSwipe === item.skuId }">
            <view class="item-content">
              <!-- Selection checkbox -->
              <view class="item-checkbox" :data-sku="item.skuId" @click="() => handleToggle(item.skuId)">
                <view
                  class="checkbox-icon"
                  :class="{ checked: isItemSelected(index) }"
                >
                  <uni-icons
                    v-if="isItemSelected(index)"
                    type="checkmark"
                    size="12"
                    color="#ffffff"
                  />
                </view>
              </view>

              <!-- Product image -->
              <image
                class="item-image"
                :src="item.goodsImage || '/static/images/placeholder.png'"
                mode="aspectFill"
              />

              <!-- Product info -->
              <view class="item-info">
                <view class="item-name">{{ item.goodsName || '商品' }}</view>
                <view class="item-spec" v-if="item.specs">{{ item.specs }}</view>
                <view class="item-bottom">
                  <view class="item-price">¥{{ (item.price || 0).toFixed(2) }}</view>
                  <view class="quantity-stepper">
                    <view
                      class="stepper-btn minus"
                      :data-sku="item.skuId"
                      @click="() => handleMinus(item.skuId)"
                    >-</view>
                    <view class="stepper-num">{{ item.quantity }}</view>
                    <view
                      class="stepper-btn plus"
                      :data-sku="item.skuId"
                      @click="() => handlePlus(item.skuId)"
                    >+</view>
                  </view>
                </view>
              </view>
            </view>

            <!-- Delete button -->
            <view
              class="delete-btn"
              :data-sku="item.skuId"
              @click="() => handleDelete(item.skuId)"
            >
              <text>删除</text>
            </view>
          </view>
        </view>
      </view>

      <view style="height: 120px"></view>
    </scroll-view>

    <!-- Empty state -->
    <view class="empty-state" v-else>
      <view class="empty-icon">
        <uni-icons type="cart" size="60" color="#cccccc" />
      </view>
      <text class="empty-text">购物车是空的</text>
      <view class="empty-btn" @click="goShopping">去逛逛</view>
    </view>

    <!-- Bottom fixed bar -->
    <view class="bottom-bar" v-if="cartItems.length > 0">
      <!-- Select all -->
      <view class="select-all" @click="handleSelectAll">
        <view
          class="checkbox-icon"
          :class="{ checked: isAllSelected }"
        >
          <uni-icons
            v-if="isAllSelected"
            type="checkmark"
            size="12"
            color="#ffffff"
          />
        </view>
        <text class="select-all-text">全选</text>
      </view>

      <!-- Total -->
      <view class="total-section">
        <text class="total-label">合计:</text>
        <text class="total-price">¥{{ selectedTotal.toFixed(2) }}</text>
      </view>

      <!-- Checkout button -->
      <view
        class="checkout-btn"
        :class="{ disabled: selectedCount === 0 }"
        @click="goCheckout"
      >
        结算({{ selectedCount }})
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { cartStore } from '@/stores/cart'

onMounted(async () => {
  console.log('[cart:page] onMounted, calling init')
  await cartStore.init()
})

// Also reload on page show (covers hot reload scenarios)
onShow(() => {
  console.log('[cart:page] onShow, reloading cart')
  cartStore.reload()
})

const activeSwipe = ref<number | null>(null)

// Use toRefs to create a reactive reference to cartStore's cartItems
// This ensures v-for can properly track the reactive array
const cartItems = computed(() => cartStore.cartItems)

// Check if item at index is selected
const isItemSelected = (index: number): boolean => {
  const item = cartItems.value[index]
  if (!item) return false
  return cartStore.getSelectedItems().some(i => i.skuId === item.skuId)
}

const selectedCount = computed(() => cartStore.getSelectedItems().length)
const selectedTotal = computed(() => cartStore.getSelectedTotal())
const isAllSelected = computed(() => cartStore.isAllSelected())

// Simple handler functions for each item - no data-idx needed
// Use arrow function () => handleToggle(item.skuId) in template to avoid v-for @click compiler bug
const handleToggle = (skuId: number) => {
  console.log('[cart:page] handleToggle skuId=', skuId)
  cartStore.toggleSelect(skuId)
}

const handleMinus = (skuId: number) => {
  console.log('[cart:page] handleMinus skuId=', skuId)
  const item = cartStore.cartItems.find(i => i.skuId === skuId)
  if (item && item.quantity > 1) {
    cartStore.updateQuantity(skuId, item.quantity - 1)
  } else if (item) {
    cartStore.removeFromCart(skuId)
  }
}

const handlePlus = (skuId: number) => {
  console.log('[cart:page] handlePlus skuId=', skuId)
  const item = cartStore.cartItems.find(i => i.skuId === skuId)
  if (item) {
    cartStore.updateQuantity(skuId, item.quantity + 1)
  }
}

const handleDelete = (skuId: number) => {
  console.log('[cart:page] handleDelete skuId=', skuId)
  uni.showModal({
    title: '确认删除',
    content: '确定要从购物车删除该商品吗？',
    confirmColor: '#ff4d4f',
    success: (res) => {
      if (res.confirm) {
        cartStore.removeFromCart(skuId)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

const handleSelectAll = () => {
  cartStore.selectAll(!isAllSelected.value)
}

const goShopping = () => {
  uni.switchTab({ url: '/pages/home/index' })
}

const goCheckout = () => {
  const skuIds = cartStore.getSelectedSkuIds()
  if (skuIds.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pages/checkout/index?skuIds=${skuIds.join(',')}`
  })
}
</script>

<style scoped lang="scss">
.cart-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.cart-scroll {
  flex: 1;
  height: calc(100vh - 120px);
}

.cart-list {
  padding: 8px;
}

.cart-item {
  margin-bottom: 8px;
}

.swipe-item {
  position: relative;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.item-content {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #ffffff;
}

.item-checkbox {
  padding: 8px;
  flex-shrink: 0;
}

.checkbox-icon {
  width: 20px;
  height: 20px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  transition: all 0.2s;
}

.checkbox-icon.checked {
  background-color: #ff5500;
  border-color: #ff5500;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  flex-shrink: 0;
  margin-left: 4px;
}

.item-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-spec {
  font-size: 12px;
  color: #999999;
  margin-top: 4px;
}

.item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.item-price {
  font-size: 14px;
  color: #ff5500;
  font-weight: 600;
}

.quantity-stepper {
  display: flex;
  align-items: center;
}

.stepper-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 16px;
  color: #666666;
  background-color: #ffffff;
}

.stepper-btn.plus {
  background-color: #f5f5f5;
}

.stepper-num {
  min-width: 32px;
  text-align: center;
  font-size: 14px;
  color: #333333;
}

.delete-btn {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  background-color: #ff4d4f;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 14px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.empty-icon {
  margin-bottom: 20px;
}

.empty-text {
  font-size: 14px;
  color: #999999;
  margin-bottom: 20px;
}

.empty-btn {
  padding: 10px 32px;
  background-color: #ff5500;
  color: #ffffff;
  border-radius: 20px;
  font-size: 14px;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50px;
  background-color: #ffffff;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.select-all {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.select-all-text {
  margin-left: 8px;
  font-size: 14px;
  color: #333333;
}

.total-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
}

.total-label {
  font-size: 14px;
  color: #666666;
}

.total-price {
  font-size: 16px;
  color: #ff5500;
  font-weight: 600;
  margin-left: 4px;
}

.checkout-btn {
  background-color: #ff5500;
  color: #ffffff;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.checkout-btn.disabled {
  background-color: #cccccc;
  color: #ffffff;
}
</style>