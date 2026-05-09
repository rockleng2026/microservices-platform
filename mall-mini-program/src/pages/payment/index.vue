<template>
  <view class="payment-page">
    <!-- Countdown Timer -->
    <view class="countdown-section">
      <view class="countdown-label">订单保留时间</view>
      <view class="countdown-time" :class="{ urgent: countdownMinutes < 5 }">
        {{ countdownMinutes }}:{{ countdownSecondsFormatted }}
      </view>
      <view class="countdown-tip" v-if="isExpired">订单已过期</view>
    </view>

    <!-- Order Info Card -->
    <view class="order-card">
      <view class="order-card-header">
        <text class="order-label">订单号</text>
        <view class="order-no-row">
          <text class="order-no">{{ orderInfo.orderNo || orderId }}</text>
          <view class="copy-btn" @click="copyOrderNo">
            <uni-icons type="paperclip" size="14" color="#666"></uni-icons>
            <text>复制</text>
          </view>
        </view>
      </view>
      <view class="order-card-row">
        <text class="order-label">订单金额</text>
        <text class="order-amount">¥{{ (orderInfo.amount || 0).toFixed(2) }}</text>
      </view>
      <view class="order-card-row" v-if="orderInfo.createdAt">
        <text class="order-label">创建时间</text>
        <text class="order-time">{{ orderInfo.createdAt }}</text>
      </view>
    </view>

    <!-- Payment Methods -->
    <view class="payment-methods">
      <view class="payment-method-title">支付方式</view>
      <view class="payment-method wechat">
        <image class="wechat-icon" src="/static/wechat-pay.png" mode="aspectFit"></image>
        <text class="method-name">微信支付</text>
        <view class="check-icon">
          <uni-icons type="checkmark" size="14" color="#fff"></uni-icons>
        </view>
      </view>
    </view>

    <!-- Spacer -->
    <view style="height: 120px"></view>

    <!-- Bottom Pay Bar -->
    <view class="pay-bar">
      <view class="pay-amount-info">
        <text class="pay-label">应付金额</text>
        <text class="pay-amount">¥{{ (orderInfo.amount || 0).toFixed(2) }}</text>
      </view>
      <view
        class="pay-btn"
        :class="{ disabled: isExpired || isPaying }"
        @click="handlePay"
      >
        <text v-if="isPaying">正在唤起支付...</text>
        <text v-else-if="isExpired">订单已过期</text>
        <text v-else>微信支付 ¥{{ (orderInfo.amount || 0).toFixed(2) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { API_BASE, PAY_CREATE, ORDER_DETAIL } from '@/config/api'

const orderId = ref<string>('')
const orderInfo = ref<any>({})
const isPaying = ref(false)
const isExpired = ref(false)

// Countdown: 30 minutes = 1800 seconds
const totalSeconds = ref(1800)
let timer: ReturnType<typeof setInterval> | null = null

const countdownMinutes = computed(() => Math.floor(totalSeconds.value / 60))
const countdownSeconds = computed(() => totalSeconds.value % 60)
const countdownSecondsFormatted = computed(() =>
  countdownSeconds.value < 10 ? `0${countdownSeconds.value}` : countdownSeconds.value.toString()
)

const startCountdown = () => {
  timer = setInterval(() => {
    if (totalSeconds.value > 0) {
      totalSeconds.value--
    } else {
      isExpired.value = true
      if (timer) clearInterval(timer)
    }
  }, 1000)
}

// Load order info
const loadOrderInfo = () => {
  const userId = uni.getStorageSync('userId') || '1'
  uni.request({
    url: `${API_BASE}${ORDER_DETAIL}/${orderId.value}`,
    method: 'GET',
    data: { userId },
    header: { 'x-user-id': userId },
    success: (res: any) => {
      if (res.statusCode === 200 && res.data) {
        orderInfo.value = res.data
        // Use server countdown if available
        if (res.data.expireSeconds && res.data.expireSeconds > 0) {
          totalSeconds.value = Math.min(res.data.expireSeconds, 1800)
        }
        // Check if order already paid or expired
        if (res.data.status === 'PAID' || res.data.status === 'EXPIRED') {
          isExpired.value = true
        }
      }
    }
  })
}

// Copy order number
const copyOrderNo = () => {
  const no = orderInfo.value.orderNo || orderId.value
  uni.setClipboardData({
    data: no,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' })
    }
  })
}

// Handle pay button click
const handlePay = () => {
  if (isExpired.value || isPaying.value) return

  isPaying.value = true
  uni.showLoading({ title: '正在唤起支付...' })

  const userId = uni.getStorageSync('userId') || '1'

  uni.request({
    url: `${API_BASE}${PAY_CREATE}`,
    method: 'POST',
    data: { orderId: orderId.value, userId },
    header: { 'x-user-id': userId, 'Content-Type': 'application/json' },
    success: (res: any) => {
      uni.hideLoading()
      if (res.statusCode === 200 && res.data) {
        const payData = res.data
        // Call WeChat JSAPI payment
        wx.requestPayment({
          timeStamp: payData.timestamp || payData.timeStamp,
          nonceStr: payData.nonceStr,
          package: `prepay_id=${payData.prepay_id}`,
          signType: payData.signType || 'MD5',
          paySign: payData.paySign,
          success: () => {
            // Payment success
            uni.redirectTo({
              url: `/pages/payment/result?orderId=${orderId.value}&status=success`
            })
          },
          fail: (err) => {
            // Payment cancelled or failed
            console.log('wx.requestPayment fail', err)
            uni.redirectTo({
              url: `/pages/payment/result?orderId=${orderId.value}&status=fail`
            })
          }
        })
      } else {
        isPaying.value = false
        uni.showToast({ title: res.data?.message || '获取支付参数失败', icon: 'none' })
      }
    },
    fail: (err) => {
      uni.hideLoading()
      isPaying.value = false
      uni.showToast({ title: '网络错误，请重试', icon: 'none' })
      console.error('PAY_CREATE request failed', err)
    }
  })
}

// Page lifecycle
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  if (currentPage?.options?.orderId) {
    orderId.value = currentPage.options.orderId
  }

  if (!orderId.value) {
    uni.showToast({ title: '订单参数错误', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }

  loadOrderInfo()
  startCountdown()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped lang="scss">
@import '@/pages/payment/payment.less';
</style>
