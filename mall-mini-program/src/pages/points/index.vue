<template>
  <view class="points-page">
    <!-- Points balance header -->
    <view class="balance-header">
      <view class="balance-label">当前积分</view>
      <view class="balance-value">{{ balance }}</view>
      <view class="balance-tip">每消费1元可获得1积分</view>
    </view>

    <!-- Points history -->
    <scroll-view
      class="history-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <!-- Empty state -->
      <view v-if="!loading && history.length === 0" class="empty-state">
        <text class="empty-icon">💰</text>
        <text class="empty-text">暂无积分记录</text>
      </view>

      <!-- History items -->
      <view v-else class="history-items">
        <view
          v-for="item in history"
          :key="item.id"
          class="history-item"
        >
          <view class="item-left">
            <view :class="['type-icon', item.type]">{{ item.type === 'earn' ? '+' : '-' }}</view>
            <view class="item-info">
              <view class="item-reason">{{ item.reason }}</view>
              <view class="item-date">{{ formatDate(item.createTime) }}</view>
            </view>
          </view>
          <view :class="['item-points', item.type]">
            {{ item.type === 'earn' ? '+' : '-' }}{{ item.points }}
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
import { ref, onMounted } from 'vue'
import { getPointsLog, getMemberInfo } from '@/services/user'

const balance = ref(0)
const history = ref([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const loading = ref(false)
const refreshing = ref(false)
const noMore = ref(false)

const loadBalance = async () => {
  try {
    const memberInfo = await getMemberInfo()
    balance.value = memberInfo.points || 0
  } catch (e) {
    console.error('Failed to load balance:', e)
  }
}

const loadHistory = async (reset = false) => {
  if (loading.value) return
  loading.value = true

  try {
    if (reset) {
      page.value = 1
      history.value = []
      noMore.value = false
    }

    const res = await getPointsLog(page.value, pageSize)

    if (reset) {
      history.value = res.list || []
    } else {
      history.value = [...history.value, ...(res.list || [])]
    }
    total.value = res.total || 0

    if (history.value.length >= total.value) {
      noMore.value = true
    } else {
      page.value++
    }
  } catch (e) {
    console.error('Failed to load points history:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = () => {
  refreshing.value = true
  loadBalance()
  loadHistory(true)
}

const onLoadMore = () => {
  if (!noMore.value && !loading.value) {
    loadHistory()
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  loadBalance()
  loadHistory(true)
})
</script>

<style scoped lang="scss">
.points-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.balance-header {
  background: linear-gradient(135deg, #ff5500 0%, #ff7a3d 100%);
  padding: 50rpx 30rpx;
  text-align: center;

  .balance-label {
    font-size: 28rpx;
    color: rgba(255,255,255,0.8);
  }

  .balance-value {
    font-size: 72rpx;
    color: #fff;
    font-weight: 600;
    margin-top: 10rpx;
  }

  .balance-tip {
    font-size: 22rpx;
    color: rgba(255,255,255,0.7);
    margin-top: 10rpx;
  }
}

.history-list {
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

.history-items {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  background: #f5f5f5;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 30rpx;
}

.item-left {
  display: flex;
  align-items: center;

  .type-icon {
    width: 60rpx;
    height: 60rpx;
    border-radius: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: 600;

    &.earn {
      background: #e6f7ed;
      color: #07c160;
    }

    &.deduct {
      background: #fff2e6;
      color: #ff5500;
    }
  }

  .item-info {
    margin-left: 20rpx;

    .item-reason {
      font-size: 28rpx;
      color: #333;
    }

    .item-date {
      font-size: 22rpx;
      color: #999;
      margin-top: 8rpx;
    }
  }
}

.item-points {
  font-size: 32rpx;
  font-weight: 600;

  &.earn {
    color: #07c160;
  }

  &.deduct {
    color: #ff5500;
  }
}

.loading-more {
  text-align: center;
  padding: 30rpx;
  font-size: 24rpx;
  color: #999;
}
</style>