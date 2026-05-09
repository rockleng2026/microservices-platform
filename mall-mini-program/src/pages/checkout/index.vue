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
          <image class="item-image" :src="item.goodsImage || '/static/default.png'" mode="aspectFill"></image>
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
import { API_BASE, ORDER_CREATE, ADDRESS_LIST, COUPON_LIST } from '@/config/api'
import { cartStore, type CartItem } from '@/stores/cart'

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
  const userId = uni.getStorageSync('userId') || '1'
  uni.request({
    url: `${API_BASE}${ADDRESS_LIST}`,
    method: 'GET',
    data: { userId },
    header: { 'x-user-id': userId },
    success: (res: any) => {
      if (res.statusCode === 200 && res.data) {
        addressList.value = Array.isArray(res.data) ? res.data : []
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
  const userId = uni.getStorageSync('userId') || '1'
  uni.request({
    url: `${API_BASE}${COUPON_LIST}`,
    method: 'GET',
    data: { userId, minAmount: productTotal.value },
    header: { 'x-user-id': userId },
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
  uni.navigateTo({ url: '/pages/address/edit' })
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

  const userId = uni.getStorageSync('userId') || '1'
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

// Page onLoad
onLoad((options: any) => {
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
    const allItems = cartStore.getItems()
    orderItems.value = allItems.filter(item => skuIds.includes(item.skuId))
  }

  if (orderItems.value.length === 0) {
    uni.showToast({ title: '订单商品不能为空', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }

  loadAddressList()
  loadCouponList()
})
</script>

<style scoped lang="scss">
@import '@/pages/checkout/checkout.less';
</style>
