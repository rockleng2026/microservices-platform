<template>
  <view class="coupons-page">
    <!-- Tabs -->
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab-item', { active: currentTab === tab.value }]"
        @click="onTabChange(tab.value)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- Coupon list -->
    <scroll-view
      class="coupon-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <!-- Empty state -->
      <view v-if="!loading && coupons.length === 0" class="empty-state">
        <text class="empty-icon">🎫</text>
        <text class="empty-text">暂无优惠券</text>
      </view>

      <!-- Coupon cards -->
      <view v-else class="coupon-cards">
        <view
          v-for="coupon in coupons"
          :key="coupon.id"
          :class="['coupon-card', getStatusClass(coupon.status)]"
        >
          <view class="coupon-left">
            <view class="discount">
              <text v-if="coupon.type === 'discount'" class="discount-value">{{ coupon.discount }}折</text>
              <text v-else class="discount-value">¥{{ coupon.discount }}</text>
            </view>
            <view class="min-amount" v-if="coupon.minAmount > 0">
              满{{ coupon.minAmount }}元可用
            </view>
          </view>
          <view class="coupon-right">
            <view class="coupon-name">{{ coupon.name }}</view>
            <view class="coupon-type">{{ getTypeName(coupon.type) }}</view>
            <view class="valid-period">
              {{ formatDate(coupon.validStartTime) }} - {{ formatDate(coupon.validEndTime) }}
            </view>
          </view>
          <view :class="['status-badge', getStatusClass(coupon.status)]">
            {{ getStatusText(coupon.status) }}
          </view>
        </view>
      </view>

      <!-- Loading more -->
      <view v-if="loading" class="loading-more">
        <text>加载中...</text>
      </view>
      <view v-else-if="noMore" class="loading-more">
        <text>没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMyCoupons } from '@/services/user'

const tabs = [
  { label: '全部', value: -1 },
  { label: '未使用', value: 0 },
  { label: '已使用', value: 1 },
  { label: '已过期', value: 2 }
]

const currentTab = ref(-1)
const coupons = ref([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const loading = ref(false)
const refreshing = ref(false)
const noMore = ref(false)

const loadCoupons = async (reset = false) => {
  if (loading.value) return
  loading.value = true

  try {
    if (reset) {
      page.value = 1
      coupons.value = []
      noMore.value = false
    }

    const params = {}
    if (currentTab.value !== -1) {
      params.status = currentTab.value
    }

    const res = await getMyCoupons(currentTab.value === -1 ? undefined : currentTab.value)

    if (reset) {
      coupons.value = res.list || []
    } else {
      coupons.value = [...coupons.value, ...(res.list || [])]
    }
    total.value = res.total || 0

    if (coupons.value.length >= total.value) {
      noMore.value = true
    } else {
      page.value++
    }
  } catch (e) {
    console.error('Failed to load coupons:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onTabChange = (value) => {
  currentTab.value = value
  loadCoupons(true)
}

const onRefresh = () => {
  refreshing.value = true
  loadCoupons(true)
}

const onLoadMore = () => {
  if (!noMore.value && !loading.value) {
    loadCoupons()
  }
}

const getTypeName = (type) => {
  const map = { discount: '折扣券', fixed: '代金券' }
  return map[type] || type
}

const getStatusClass = (status) => {
  const map = { unused: '', used: 'used', expired: 'expired' }
  return map[status] || ''
}

const getStatusText = (status) => {
  const map = { unused: '未使用', used: '已使用', expired: '已过期' }
  return map[status] || status
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

onLoad(() => {
  loadCoupons(true)
})
</script>

<style scoped lang="scss">
.coupons-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  background: #fff;
  padding: 0 20rpx;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    font-size: 28rpx;
    color: #666;
    border-bottom: 4rpx solid transparent;

    &.active {
      color: #ff5500;
      border-bottom-color: #ff5500;
    }
  }
}

.coupon-list {
  flex: 1;
  padding: 20rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;

  .empty-icon {
    font-size: 80rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-top: 20rpx;
  }
}

.coupon-cards {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.coupon-card {
  display: flex;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;

  &.used {
    opacity: 0.6;
  }

  &.expired {
    opacity: 0.5;
    filter: grayscale(1);
  }
}

.coupon-left {
  width: 200rpx;
  background: linear-gradient(135deg, #ff5500 0%, #ff7a3d 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30rpx 20rpx;

  .discount-value {
    font-size: 40rpx;
    color: #fff;
    font-weight: 600;
  }

  .min-amount {
    font-size: 20rpx;
    color: rgba(255,255,255,0.8);
    margin-top: 10rpx;
  }
}

.coupon-right {
  flex: 1;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .coupon-name {
    font-size: 28rpx;
    color: #333;
    font-weight: 600;
  }

  .coupon-type {
    font-size: 22rpx;
    color: #999;
    margin-top: 8rpx;
  }

  .valid-period {
    font-size: 20rpx;
    color: #ccc;
    margin-top: 8rpx;
  }
}

.status-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 6rpx 16rpx;
  font-size: 20rpx;
  border-radius: 0 12rpx 0 12rpx;

  &.unused {
    background: #07c160;
    color: #fff;
  }

  &.used {
    background: #999;
    color: #fff;
  }

  &.expired {
    background: #ff5500;
    color: #fff;
  }
}

.loading-more {
  text-align: center;
  padding: 30rpx;
  font-size: 24rpx;
  color: #999;
}
</style>