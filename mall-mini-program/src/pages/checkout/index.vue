<template>
  <view class="checkout-page">
    <scroll-view class="checkout-scroll" scroll-y>
      <!-- Address Section -->
      <view class="section address-section" @click="openAddressDrawer">
        <view class="section-label">
          <uni-icons type="location" size="16" color="#ff5500"></uni-icons>
          <text>收货地址</text>
        </view>
        <view class="address-content" v-if="selectedAddress">
          <view class="address-info">
            <view class="address-name">{{ selectedAddress.name }} {{ selectedAddress.phone }}</view>
            <view class="address-detail">{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}</view>
          </view>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
        <view class="address-placeholder" v-else>
          <text>请选择收货地址</text>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
      </view>

      <!-- Coupon Section -->
      <view class="section coupon-section" @click="openCouponPicker">
        <view class="section-label">
          <uni-icons type="gift" size="16" color="#ff5500"></uni-icons>
          <text>优惠券</text>
        </view>
        <view class="coupon-content">
          <text class="coupon-value" v-if="selectedCoupon">{{ selectedCoupon.name }} - {{ selectedCoupon.discount }}元</text>
          <text class="coupon-placeholder" v-else>选择优惠券</text>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
      </view>

      <!-- Order Items Section -->
      <view class="section order-items-section">
        <view class="section-label">
          <uni-icons type="shop" size="16" color="#ff5500"></uni-icons>
          <text>商品清单</text>
        </view>
        <view class="order-item" v-for="item in orderItems" :key="item.skuId">
          <image class="item-image" :src="getImageSrc(item.goodsImage)" mode="aspectFill"></image>
          <view class="item-info">
            <view class="item-name">{{ item.goodsName }}</view>
            <view class="item-specs" v-if="item.specs">{{ item.specs }}</view>
            <view class="item-price-row">
              <text class="item-price">¥{{ (item.price || 0).toFixed(2) }}</text>
              <text class="item-quantity">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Remark Section -->
      <view class="section remark-section">
        <view class="section-label">备注</view>
        <textarea
          class="remark-input"
          v-model="remark"
          placeholder="备注信息（选填）"
          maxlength="200"
        ></textarea>
      </view>

      <!-- Spacer for bottom bar -->
      <view style="height: 100px"></view>
    </scroll-view>

    <!-- Bottom Submit Bar -->
    <view class="submit-bar">
      <view class="total-info">
        <text class="total-label">合计:</text>
        <text class="total-amount">¥{{ finalAmount.toFixed(2) }}</text>
      </view>
      <view class="submit-btn" :class="{ disabled: isSubmitting }" @click="submitOrder">
        <text v-if="!isSubmitting">提交订单</text>
        <text v-else>提交中...</text>
      </view>
    </view>

    <!-- Address Drawer -->
    <view class="address-drawer-mask" v-if="showAddressDrawer" @click="closeAddressDrawer"></view>
    <view class="address-drawer" :class="{ open: showAddressDrawer }">
      <view class="drawer-header">
        <text class="drawer-title">选择收货地址</text>
        <view class="drawer-close" @click="closeAddressDrawer">
          <uni-icons type="close" size="20" color="#999"></uni-icons>
        </view>
      </view>
      <scroll-view class="drawer-content" scroll-y>
        <view
          class="address-item"
          :class="{ selected: selectedAddress && addr.id === selectedAddress.id }"
          v-for="addr in addressList"
          :key="addr.id"
          @click="selectAddress(addr)"
        >
          <view class="address-item-radio">
            <radio :checked="selectedAddress && addr.id === selectedAddress.id" color="#ff5500"></radio>
          </view>
          <view class="address-item-info">
            <view class="address-item-name">{{ addr.name }} {{ addr.phone }}</view>
            <view class="address-item-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}</view>
          </view>
        </view>
        <view class="address-empty" v-if="addressList.length === 0">
          <text>暂无收货地址</text>
        </view>
      </scroll-view>
      <view class="drawer-footer">
        <view class="add-address-btn" @click="navigateToAddAddress">
          <uni-icons type="plus" size="16" color="#fff"></uni-icons>
          <text>新增地址</text>
        </view>
      </view>
    </view>

    <!-- Coupon Picker Popup -->
    <view class="coupon-popup-mask" v-if="showCouponPicker" @click="closeCouponPicker"></view>
    <view class="coupon-popup" :class="{ open: showCouponPicker }">
      <view class="popup-header">
        <text class="popup-title">选择优惠券</text>
        <view class="popup-close" @click="closeCouponPicker">
          <uni-icons type="close" size="20" color="#999"></uni-icons>
        </view>
      </view>
      <scroll-view class="popup-content" scroll-y>
        <view
          class="coupon-item"
          :class="{ selected: selectedCoupon && coupon.id === selectedCoupon.id }"
          v-for="coupon in couponList"
          :key="coupon.id"
          @click="selectCoupon(coupon)"
        >
          <view class="coupon-item-radio">
            <radio :checked="selectedCoupon && coupon.id === selectedCoupon.id" color="#ff5500"></radio>
          </view>
          <view class="coupon-item-info">
            <view class="coupon-item-name">{{ coupon.name }}</view>
            <view class="coupon-item-desc">{{ coupon.desc || '满' + coupon.threshold + '减' + coupon.discount }}</view>
            <view class="coupon-item-time">有效期至 {{ coupon.endTime }}</view>
          </view>
          <view class="coupon-item-discount">-¥{{ coupon.discount }}</view>
        </view>
        <view class="coupon-item no-coupon" @click="selectNoCoupon">
          <view class="coupon-item-radio">
            <radio :checked="!selectedCoupon" color="#ff5500"></radio>
          </view>
          <view class="coupon-item-info">
            <view class="coupon-item-name">不使用优惠券</view>
          </view>
        </view>
      </scroll-view>
      <view class="popup-footer">
        <view class="confirm-coupon-btn" @click="confirmCoupon">
          <text>确定</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { API_BASE, ORDER_CREATE, ADDRESS_LIST, COUPON_LIST } from '@/config/api'
import { cartStore, type CartItem } from '@/stores/cart'
import { getGoodsDetail } from '@/services/goods'
import { getCurrentUserId } from '@/utils/helpers'
import { getFullImageUrl, DEFAULT_AVATAR_DATAURI } from '@/utils/helpers'

// Helper to get image src with fallback
const getImageSrc = (path: string) => {
  if (!path) return DEFAULT_AVATAR_DATAURI
  if (path.startsWith('data:') || path.startsWith('http') || path.startsWith('//')) return path
  if (path.startsWith('/')) return getFullImageUrl(path)
  return path
}

// Order items from skuIds
const orderItems = ref<CartItem[]>([])

// Address state
const selectedAddress = ref<any>(null)
const addressList = ref<any[]>([])
const showAddressDrawer = ref(false)

// Coupon state
const selectedCoupon = ref<any>(null)
const couponList = ref<any[]>([])
const showCouponPicker = ref(false)

// Remark
const remark = ref('')

// Submit state
const isSubmitting = ref(false)

// Computed amounts
const productTotal = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
})

const shippingFee = computed(() => {
  // Simplified: free shipping for orders over 99, otherwise 10
  return productTotal.value >= 99 ? 0 : 10
})

const discountAmount = computed(() => {
  return selectedCoupon.value ? Number(selectedCoupon.value.discount) || 0 : 0
})

const finalAmount = computed(() => {
  const total = productTotal.value + shippingFee.value - discountAmount.value
  return Math.max(0, total)
})

// Load address list
const loadAddressList = () => {
  const userId = getCurrentUserId()
  uni.request({
    url: `${API_BASE}${ADDRESS_LIST}`,
    method: 'GET',
    header: {
      'x-user-id': userId,
      'x-tenant-header': 'default'
    },
    success: (res: any) => {
      if (res.statusCode === 200 && res.data) {
        // API返回格式: { datas: [...], resp_code: 0 }
        addressList.value = Array.isArray(res.data.datas) ? res.data.datas : []
        // Auto-select default address
        const defaultAddr = addressList.value.find((a: any) => a.isDefault === 1)
        if (defaultAddr) {
          selectedAddress.value = defaultAddr
        } else if (addressList.value.length > 0) {
          selectedAddress.value = addressList.value[0]
        }
      }
    }
  })
}

// Load coupon list
const loadCouponList = () => {
  const userId = getCurrentUserId()
  uni.request({
    url: `${API_BASE}${COUPON_LIST}`,
    method: 'GET',
    data: { userId, minAmount: productTotal.value },
    header: { 'x-user-id': userId, 'x-tenant-header': 'default' },
    success: (res: any) => {
      if (res.statusCode === 200 && res.data) {
        couponList.value = Array.isArray(res.data) ? res.data : []
      }
    }
  })
}

// Address drawer
const openAddressDrawer = () => {
  showAddressDrawer.value = true
}

const closeAddressDrawer = () => {
  showAddressDrawer.value = false
}

const selectAddress = (addr: any) => {
  selectedAddress.value = addr
  closeAddressDrawer()
}

const navigateToAddAddress = () => {
  closeAddressDrawer()
  uni.navigateTo({
    url: '/pages/address/edit'
  })
}

// Coupon picker
const openCouponPicker = () => {
  showCouponPicker.value = true
}

const closeCouponPicker = () => {
  showCouponPicker.value = false
}

const selectCoupon = (coupon: any) => {
  selectedCoupon.value = coupon
}

const selectNoCoupon = () => {
  selectedCoupon.value = null
}

const confirmCoupon = () => {
  closeCouponPicker()
}

// Submit order
const submitOrder = () => {
  if (!selectedAddress.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }
  if (isSubmitting.value) return
  isSubmitting.value = true

  const userId = getCurrentUserId()
  const skuIds = orderItems.value.map(item => item.skuId)

  uni.request({
    url: `${API_BASE}${ORDER_CREATE}`,
    method: 'POST',
    data: {
      userId,
      skuIds,
      addressId: selectedAddress.value.id,
      couponId: selectedCoupon.value?.id || null,
      remark: remark.value
    },
    header: { 'x-user-id': userId, 'Content-Type': 'application/json' },
    success: (res: any) => {
      if (res.statusCode === 200 && res.data && res.data.orderId) {
        uni.showToast({ title: '订单创建成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateTo({ url: `/pages/payment/index?orderId=${res.data.orderId}` })
        }, 500)
      } else {
        uni.showToast({ title: res.data?.message || '创建订单失败', icon: 'none' })
        isSubmitting.value = false
      }
    },
    fail: () => {
      uni.showToast({ title: '网络错误，请重试', icon: 'none' })
      isSubmitting.value = false
    }
  })
}

// Check if user is logged in
const isLoggedIn = (): boolean => {
  const userInfo = uni.getStorageSync('userInfo')
  return !!(userInfo && userInfo.userId)
}

// Page onLoad
onLoad(async (options: any) => {
  // Check login first
  if (!isLoggedIn()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/index' })
    }, 1000)
    return
  }

  // Get skuIds from query param
  let skuIds: number[] = []
  if (options.skuIds) {
    skuIds = options.skuIds.split(',').map(Number)
  } else if (options.skuId) {
    // Single skuId from direct buy
    skuIds = [Number(options.skuId)]
  }

  if (skuIds.length === 0) {
    // Fall back to selected items from cart
    orderItems.value = cartStore.getSelectedItems()
  } else {
    // Filter cart items by skuIds
    const allItems = cartStore.cartItems
    orderItems.value = allItems.filter(item => skuIds.includes(item.skuId))

    // If still no items (direct buy without cart), fetch goods detail
    if (orderItems.value.length === 0 && options.goodsId) {
      try {
        const detail = await getGoodsDetail(Number(options.goodsId))
        const sku = detail.skus?.find((s: any) => s.id === Number(options.skuId))
        if (sku) {
          orderItems.value = [{
            skuId: sku.id,
            quantity: 1,
            goodsName: detail.name,
            goodsImage: detail.mainImage,
            price: sku.price,
            specs: sku.specs
          }]
        }
      } catch (e) {
        console.error('Failed to fetch goods detail', e)
      }
    }
  }

  if (orderItems.value.length === 0) {
    uni.showToast({ title: '订单商品不能为空', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }

  loadAddressList()
  loadCouponList()
})

// Reload address list when page is shown (tabBar page)
onShow(() => {
  if (isLoggedIn()) {
    loadAddressList()
  }
})
</script>

<style scoped lang="scss">
.checkout-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  position: relative;
}

.checkout-scroll {
  height: calc(100vh - 60px);
}

.section {
  background-color: #fff;
  margin-bottom: 8px;
  padding: 12px 16px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.address-section { cursor: pointer; }
.address-content, .coupon-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.address-info { flex: 1; }
.address-name { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 4px; }
.address-detail { font-size: 13px; color: #666; line-height: 1.4; }
.address-placeholder {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #999;
}
.coupon-section { cursor: pointer; }
.coupon-value { font-size: 14px; color: #ff5500; }
.coupon-placeholder { font-size: 14px; color: #999; }

.order-item {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid #f0f0f0;
  &:first-of-type { border-top: none; }
}
.item-image { width: 60px; height: 60px; border-radius: 4px; background-color: #f5f5f5; flex-shrink: 0; }
.item-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.item-name { font-size: 14px; color: #333; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.item-specs { font-size: 12px; color: #999; margin-top: 2px; }
.item-price-row { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
.item-price { font-size: 14px; color: #ff5500; font-weight: 600; }
.item-quantity { font-size: 13px; color: #999; }

.remark-input {
  width: 100%; min-height: 80px; padding: 10px; border: 1px solid #e8e8e8;
  border-radius: 8px; font-size: 14px; color: #333; resize: none; box-sizing: border-box;
  &:focus { border-color: #ff5500; }
}

.submit-bar {
  position: fixed; bottom: 0; left: 0; right: 0; height: 60px;
  background-color: #fff; display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px; box-shadow: 0 -2px 8px rgba(0,0,0,0.06); z-index: 100;
}
.total-info { display: flex; align-items: baseline; gap: 4px; }
.total-label { font-size: 14px; color: #666; }
.total-amount { font-size: 20px; font-weight: 700; color: #ff5500; }
.submit-btn {
  background-color: #ff5500; color: #fff; font-size: 16px; font-weight: 600;
  padding: 12px 32px; border-radius: 24px;
  &.disabled { background-color: #ccc; pointer-events: none; }
}

.address-drawer-mask, .coupon-popup-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.5); z-index: 200;
}
.address-drawer, .coupon-popup {
  position: fixed; bottom: 0; left: 0; right: 0; max-height: 60vh;
  background-color: #fff; border-radius: 16px 16px 0 0; z-index: 201;
  transform: translateY(100%); transition: transform 0.3s ease;
  &.open { transform: translateY(0); }
}
.drawer-header, .popup-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px; border-bottom: 1px solid #f0f0f0;
}
.drawer-title, .popup-title { font-size: 16px; font-weight: 600; color: #333; }
.drawer-close, .popup-close { padding: 4px; }
.drawer-content, .popup-content { max-height: calc(60vh - 120px); padding: 0 16px; }

.address-item {
  display: flex; align-items: flex-start; gap: 10px; padding: 14px 0;
  border-bottom: 1px solid #f5f5f5; cursor: pointer;
  &.selected { background-color: #fff5f0; margin: 0 -16px; padding-left: 16px; padding-right: 16px; border-left: 3px solid #ff5500; }
  &:last-child { border-bottom: none; }
}
.address-item-radio { padding-top: 2px; }
.address-item-info { flex: 1; }
.address-item-name { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 4px; }
.address-item-detail { font-size: 13px; color: #666; line-height: 1.4; }
.address-empty { text-align: center; padding: 32px 0; font-size: 14px; color: #999; }
.drawer-footer { padding: 12px 16px; border-top: 1px solid #f0f0f0; }
.add-address-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; height: 44px; background-color: #ff5500; color: #fff;
  font-size: 15px; font-weight: 600; border-radius: 8px;
}

.coupon-popup { max-height: 70vh; }
.popup-content { max-height: calc(70vh - 120px); }
.coupon-item {
  display: flex; align-items: center; gap: 10px; padding: 14px 0;
  border-bottom: 1px solid #f5f5f5; cursor: pointer;
  &.selected { background-color: #fff5f0; margin: 0 -16px; padding-left: 16px; padding-right: 16px; border-left: 3px solid #ff5500; }
  &:last-child { border-bottom: none; }
  &.no-coupon { border-top: 1px solid #f0f0f0; margin-top: 8px; padding-top: 16px; }
}
.coupon-item-radio { padding-top: 2px; }
.coupon-item-info { flex: 1; }
.coupon-item-name { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 2px; }
.coupon-item-desc { font-size: 12px; color: #666; margin-bottom: 2px; }
.coupon-item-time { font-size: 11px; color: #999; }
.coupon-item-discount { font-size: 18px; font-weight: 700; color: #ff5500; }
.popup-footer { padding: 12px 16px; border-top: 1px solid #f0f0f0; }
.confirm-coupon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 100%; height: 44px; background-color: #ff5500; color: #fff;
  font-size: 15px; font-weight: 600; border-radius: 8px;
}
</style>
