<template>
  <view class="order-list-page">
    <!-- Tab Bar -->
    <view class="tab-bar">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab-item', { active: currentTab === index }]"
        @click="onTabChange(index)"
      >
        {{ tab }}
        <view v-if="currentTab === index" class="tab-underline"></view>
      </view>
    </view>

    <!-- Order List -->
    <scroll-view
      class="order-scroll"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onPullDownRefresh"
      @scrolltolower="onScrollToLower"
    >
      <!-- Loading -->
      <view v-if="isLoading && orders.length === 0" class="loading-state">
        <text>加载中...</text>
      </view>

      <!-- Empty State -->
      <view v-else-if="orders.length === 0" class="empty-state">
        <text class="empty-text">暂无订单</text>
        <text class="empty-sub">看看其他商品吧</text>
      </view>

      <!-- Order Cards -->
      <view
        v-else
        v-for="order in orders"
        :key="order.id"
        class="order-card"
        @click="goToDetail(order.id)"
      >
        <!-- Card Header: Order No + Status Badge -->
        <view class="card-header">
          <view class="order-no-row">
            <text class="order-no">订单号: {{ order.orderNo }}</text>
            <view class="copy-btn" @click.stop="copyOrderNo(order.orderNo)">
              <uni-icons type="paperclip" size="14" color="#999"></uni-icons>
            </view>
          </view>
          <view :class="['status-badge', `status-${order.status}`]">
            {{ getStatusText(order.status) }}
          </view>
        </view>

        <!-- Items: Item list with name, specs, price, quantity -->
        <view class="items-list">
          <view
            v-for="item in order.items"
            :key="item.id"
            class="item-row"
            @click.stop="goToProduct(item.skuId)"
          >
            <view class="item-info">
              <text class="item-name">{{ item.goodsName }}</text>
              <text class="item-specs" v-if="item.specs">{{ item.specs }}</text>
            </view>
            <view class="item-right">
              <text class="item-price">¥{{ item.price.toFixed(2) }}</text>
              <text class="item-qty">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>

        <!-- Card Footer: Price + Time + Actions -->
        <view class="card-footer">
          <view class="footer-left">
            <text class="final-amount">实付: ¥{{ (order.payAmount || order.totalAmount || 0).toFixed(2) }}</text>
            <text class="create-time">{{ formatTime(order.createdAt) }}</text>
          </view>
          <view class="footer-actions">
            <!-- pending_payment: 取消 + 去支付 -->
            <template v-if="order.status === 'PENDING'">
              <view class="btn btn-destroy" @click.stop="onCancelOrder(order.id)">取消</view>
              <view class="btn btn-accent" @click.stop="goToPayment(order.id)">去支付</view>
            </template>
            <!-- PAID/SHIPPED/DELIVERED: 查看明细 -->
            <template v-else-if="order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED'">
              <view class="btn btn-outline" @click.stop="goToDetail(order.id)">查看明细</view>
            </template>
            <!-- COMPLETED: 查看明细 -->
            <template v-else-if="order.status === 'COMPLETED'">
              <view class="btn btn-outline" @click.stop="goToDetail(order.id)">查看明细</view>
            </template>
          </view>
        </view>
      </view>

      <!-- Load More -->
      <view v-if="hasMore && orders.length > 0" class="load-more" @click="loadMore">
        <text>{{ isLoadingMore ? '加载中...' : '加载更多' }}</text>
      </view>
      <view v-else-if="orders.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>

      <!-- Bottom padding for tab bar -->
      <view style="height: 20px"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getOrderList, cancelOrder, confirmReceipt, TAB_STATUS_MAP, type Order } from '@/services/order'

const tabs = ['全部', '待付款', '待发货', '待收货', '已完成']
const currentTab = ref(0)
const orders = ref<Order[]>([])
const page = ref(1)
const pageSize = 10
const isLoading = ref(false)
const isRefreshing = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(true)

// Status badge colors
const statusStyles: Record<string, { bg: string; color: string }> = {
  pending_payment: { bg: '#fff7e6', color: '#fa8c16' },
  paid: { bg: '#e6f7ff', color: '#1890ff' },
  shipped: { bg: '#e6f7ff', color: '#1890ff' },
  delivered: { bg: '#f6ffed', color: '#52c41a' },
  completed: { bg: '#f6ffed', color: '#52c41a' },
  cancelled: { bg: '#f5f5f5', color: '#999999' },
  refunding: { bg: '#fff1f0', color: '#ff4d4f' }
}

// Status text mapping (backend returns English enums: PENDING, PAID, SHIPPED, etc.)
const statusTextMap: Record<string, string> = {
  PENDING: '待付款',
  PAID: '待发货',
  SHIPPED: '已发货',
  DELIVERED: '待收货',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDING: '退款中',
  REFUNDED: '已退款',
  CLOSED: '已关闭'
}

const getStatusText = (status: string) => statusTextMap[status] || status

// Format time
const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

// Load orders for current tab
const loadOrders = async (reset: boolean = false) => {
  if (reset) {
    page.value = 1
    hasMore.value = true
  }
  if (isLoading.value) return
  isLoading.value = true

  try {
    const status = TAB_STATUS_MAP[currentTab.value]
    const res = await getOrderList(status, page.value, pageSize)
    if (reset) {
      orders.value = res.list || []
    } else {
      orders.value = [...orders.value, ...(res.list || [])]
    }
    hasMore.value = orders.value.length < res.total
  } catch (e) {
    console.error('加载订单失败', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    isLoading.value = false
    isRefreshing.value = false
    isLoadingMore.value = false
  }
}

// Tab change
const onTabChange = (index: number) => {
  if (currentTab.value === index) return
  currentTab.value = index
  loadOrders(true)
}

// Pull to refresh
const onPullDownRefresh = async () => {
  isRefreshing.value = true
  page.value = 1
  await loadOrders(true)
  uni.stopPullDownRefresh()
}

// Scroll to lower (load more)
const onScrollToLower = () => {
  if (!hasMore.value || isLoadingMore.value || isLoading.value) return
  isLoadingMore.value = true
  page.value++
  loadOrders(false)
}

// Load more button
const loadMore = () => {
  if (!hasMore.value || isLoadingMore.value || isLoading.value) return
  isLoadingMore.value = true
  page.value++
  loadOrders(false)
}

// Copy order no
const copyOrderNo = (orderNo: string) => {
  uni.setClipboardData({
    data: orderNo,
    success: () => {
      uni.showToast({ title: '订单号已复制', icon: 'success' })
    }
  })
}

// Go to detail
const goToDetail = (orderId: number) => {
  uni.navigateTo({ url: `/pages/order-detail/index?orderId=${orderId}` })
}

// Go to product
const goToProduct = (skuId: number) => {
  uni.navigateTo({ url: `/pages/product-detail/index?id=${skuId}` })
}

// Go to payment
const goToPayment = (orderId: number) => {
  uni.navigateTo({ url: `/pages/payment/index?orderId=${orderId}` })
}

// Cancel order
const onCancelOrder = (orderId: number) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消该订单吗？',
    confirmColor: '#ff4d4f',
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelOrder(orderId)
          uni.showToast({ title: '订单已取消', icon: 'success' })
          loadOrders(true)
        } catch (e) {
          uni.showToast({ title: '取消失败', icon: 'none' })
        }
      }
    }
  })
}

// Confirm receipt
const onConfirmReceipt = (orderId: number) => {
  uni.showModal({
    title: '提示',
    content: '确认收到货物吗？',
    confirmColor: '#ff5500',
    success: async (res) => {
      if (res.confirm) {
        try {
          await confirmReceipt(orderId)
          uni.showToast({ title: '已确认收货', icon: 'success' })
          loadOrders(true)
        } catch (e) {
          uni.showToast({ title: '确认失败', icon: 'none' })
        }
      }
    }
  })
}

onMounted(() => {
  loadOrders(true)
})
</script>

<style scoped lang="scss">
@import '@/uni.scss';

.order-list-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

// Tab Bar
.tab-bar {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.tab-item {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  position: relative;
  transition: color 0.2s;

  &.active {
    color: #ff5500;
    font-weight: 600;
  }
}

.tab-underline {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 2px;
  background: #ff5500;
  border-radius: 1px;
}

// Order Scroll
.order-scroll {
  flex: 1;
  height: calc(100vh - 44px);
}

// Loading
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #999;
}

// Empty
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;

  .empty-text {
    font-size: 16px;
    color: #333;
    margin-bottom: 8px;
  }

  .empty-sub {
    font-size: 14px;
    color: #999;
  }
}

// Order Card
.order-card {
  background: #fff;
  border-radius: 8px;
  margin: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .order-no-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .order-no {
    font-size: 13px;
    color: #333;
  }

  .copy-btn {
    padding: 2px;
  }

  .status-badge {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 500;
  }

  .status-pending_payment {
    background: #fff7e6;
    color: #fa8c16;
  }

  .status-paid,
  .status-shipped {
    background: #e6f7ff;
    color: #1890ff;
  }

  .status-delivered,
  .status-completed {
    background: #f6ffed;
    color: #52c41a;
  }

  .status-cancelled {
    background: #f5f5f5;
    color: #999;
  }

  .status-refunding {
    background: #fff1f0;
    color: #ff4d4f;
  }

  // Items list
  .items-list {
    margin-bottom: 10px;
  }

  .item-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 6px 0;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }
  }

  .item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-right: 12px;
  }

  .item-name {
    font-size: 14px;
    color: #333;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .item-specs {
    font-size: 12px;
    color: #999;
  }

  .item-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    flex-shrink: 0;
  }

  .item-price {
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }

  .item-qty {
    font-size: 12px;
    color: #999;
  }

  // Card footer
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .final-amount {
    font-size: 14px;
    color: #ff5500;
    font-weight: 600;
  }

  .create-time {
    font-size: 12px;
    color: #999;
  }

  .footer-actions {
    display: flex;
    gap: 8px;
  }

  .btn {
    height: 28px;
    line-height: 28px;
    padding: 0 12px;
    border-radius: 14px;
    font-size: 13px;
  }

  .btn-accent {
    background: #ff5500;
    color: #fff;
  }

  .btn-destroy {
    background: #fff;
    color: #ff4d4f;
    border: 1px solid #ff4d4f;
  }

  .btn-outline {
    background: #fff;
    color: #666;
    border: 1px solid #ddd;
  }
}

// Load more
.load-more,
.no-more {
  text-align: center;
  padding: 16px;
  color: #999;
  font-size: 13px;
}
</style>
