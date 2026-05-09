<template>
  <view class="result-page">
    <!-- Success State -->
    <view class="result-container success" v-if="status === 'success'">
      <view class="result-icon success-icon">
        <uni-icons type="checkmark-circle" size="80" color="#52c41a"></uni-icons>
      </view>
      <view class="result-title success-title">支付成功</view>
      <view class="result-subtitle">您的订单已支付成功</view>

      <view class="result-order-card">
        <view class="result-order-row">
          <text class="result-label">订单号</text>
          <view class="result-order-no-row">
            <text class="result-order-no">{{ orderId }}</text>
            <view class="copy-btn" @click="copyOrderId">
              <uni-icons type="paperclip" size="12" color="#666"></uni-icons>
            </view>
          </view>
        </view>
      </view>

      <view class="result-actions">
        <view class="action-btn primary" @click="viewOrder">
          <text>查看订单</text>
        </view>
        <view class="action-btn secondary" @click="goHome">
          <text>返回首页</text>
        </view>
      </view>
    </view>

    <!-- Failure State -->
    <view class="result-container failure" v-else-if="status === 'fail'">
      <view class="result-icon failure-icon">
        <uni-icons type="close-circle" size="80" color="#ff4d4f"></uni-icons>
      </view>
      <view class="result-title failure-title">支付失败</view>
      <view class="result-subtitle">支付结果以账单为准</view>

      <view class="result-order-card">
        <view class="result-order-row">
          <text class="result-label">订单号</text>
          <view class="result-order-no-row">
            <text class="result-order-no">{{ orderId }}</text>
            <view class="copy-btn" @click="copyOrderId">
              <uni-icons type="paperclip" size="12" color="#666"></uni-icons>
            </view>
          </view>
        </view>
      </view>

      <view class="result-actions">
        <view class="action-btn primary" @click="retryPayment">
          <text>重新支付</text>
        </view>
        <view class="action-btn secondary" @click="viewOrderList">
          <text>返回订单列表</text>
        </view>
      </view>
    </view>

    <!-- Default/Unknown State -->
    <view class="result-container unknown" v-else>
      <view class="result-icon">
        <uni-icons type="info-circle" size="80" color="#999"></uni-icons>
      </view>
      <view class="result-title">支付状态未知</view>
      <view class="result-subtitle">请稍后查看订单状态</view>

      <view class="result-actions">
        <view class="action-btn primary" @click="viewOrder">
          <text>查看订单</text>
        </view>
        <view class="action-btn secondary" @click="goHome">
          <text>返回首页</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const orderId = ref<string>('')
const status = ref<string>('')

const copyOrderId = () => {
  if (orderId.value) {
    uni.setClipboardData({
      data: orderId.value,
      success: () => {
        uni.showToast({ title: '已复制', icon: 'success' })
      }
    })
  }
}

const viewOrder = () => {
  if (orderId.value) {
    uni.navigateTo({ url: `/pages/order-detail/index?orderId=${orderId.value}` })
  } else {
    uni.switchTab({ url: '/pages/user/index' })
  }
}

const goHome = () => {
  uni.switchTab({ url: '/pages/home/index' })
}

const retryPayment = () => {
  if (orderId.value) {
    uni.redirectTo({ url: `/pages/payment/index?orderId=${orderId.value}` })
  }
}

const viewOrderList = () => {
  uni.navigateTo({ url: '/pages/order-list/index' })
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  if (currentPage?.options) {
    orderId.value = currentPage.options.orderId || ''
    status.value = currentPage.options.status || ''
  }
})
</script>

<style scoped lang="scss">
@import '@/pages/payment/result.less';
</style>
