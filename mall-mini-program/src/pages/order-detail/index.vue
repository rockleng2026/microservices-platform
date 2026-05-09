<template>
  <view class="order-detail-page">
    <!-- Loading -->
    <view v-if="isLoading" class="loading-state">
      <text>加载中...</text>
    </view>

    <scroll-view v-else-if="order" class="detail-scroll" scroll-y>
      <!-- Status Banner -->
      <view :class="['status-banner', `status-${order.status}`]">
        <text class="status-text">{{ getStatusText(order.status) }}</text>
        <text class="status-desc">{{ getStatusDesc(order.status) }}</text>
      </view>

      <!-- Logistics Section (only for shipped/delivered) -->
      <view v-if="order.logistics" class="section logistics-section">
        <view class="section-header">物流信息</view>
        <view class="logistics-info">
          <view class="logistics-company">
            <text class="label">快递公司:</text>
            <text class="value">{{ order.logistics.company }}</text>
          </view>
          <view class="logistics-no-row">
            <text class="label">运单号:</text>
            <text class="value">{{ order.logistics.trackingNo }}</text>
            <view class="copy-btn" @click="copyTrackingNo">
              <uni-icons type="paperclip" size="14" color="#1890ff"></uni-icons>
            </view>
          </view>
        </view>
        <!-- Timeline -->
        <view class="timeline" v-if="order.logistics.timeline?.length">
          <view
            v-for="(event, index) in order.logistics.timeline"
            :key="index"
            :class="['timeline-item', { latest: index === 0 }]"
          >
            <view class="timeline-dot"></view>
            <view class="timeline-content">
              <text class="timeline-time">{{ event.time }}</text>
              <text class="timeline-text">{{ event.content }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Order Info Card -->
      <view class="section order-info-card">
        <view class="section-header">订单信息</view>
        <view class="info-row">
          <text class="label">订单号</text>
          <view class="value-row">
            <text class="value">{{ order.orderNo }}</text>
            <view class="copy-btn" @click="copyOrderNo">
              <uni-icons type="paperclip" size="14" color="#1890ff"></uni-icons>
            </view>
          </view>
        </view>
        <view class="info-row">
          <text class="label">下单时间</text>
          <text class="value">{{ order.createdAt }}</text>
        </view>
      </view>

      <!-- Address Section -->
      <view class="section address-section">
        <view class="section-header">收货信息</view>
        <view v-if="order.address" class="address-info">
          <view class="receiver">
            <text class="name">{{ order.address.receiverName }}</text>
            <text class="phone">{{ order.address.phone }}</text>
          </view>
          <text class="address-text">
            {{ order.address.province }}{{ order.address.city }}{{ order.address.district }}{{ order.address.detail }}
          </text>
        </view>
        <view v-else class="address-info">
          <text class="no-address">无需收货</text>
        </view>
      </view>

      <!-- Order Items Section -->
      <view class="section items-section">
        <view class="section-header">商品信息</view>
        <view
          v-for="item in order.items"
          :key="item.id"
          class="order-item"
          @click="goToProduct(item.skuId)"
        >
          <image class="item-image" :src="item.goodsImage" mode="aspectFill"></image>
          <view class="item-info">
            <text class="item-name">{{ item.goodsName }}</text>
            <text class="item-specs" v-if="item.specs">{{ item.specs }}</text>
            <view class="item-price-row">
              <text class="item-price">¥{{ item.price.toFixed(2) }}</text>
              <text class="item-qty">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Payment Info Section -->
      <view class="section payment-section">
        <view class="section-header">支付信息</view>
        <view class="info-row">
          <text class="label">商品总价</text>
          <text class="value">¥{{ order.totalAmount.toFixed(2) }}</text>
        </view>
        <view class="info-row">
          <text class="label">运费</text>
          <text class="value">¥{{ order.freightFee.toFixed(2) }}</text>
        </view>
        <view class="info-row">
          <text class="label">优惠</text>
          <text class="value discount">-¥{{ order.discountAmount.toFixed(2) }}</text>
        </view>
        <view class="info-row total-row">
          <text class="label">实付金额</text>
          <text class="value total-amount">¥{{ order.finalAmount.toFixed(2) }}</text>
        </view>
        <view v-if="order.paidAt" class="info-row">
          <text class="label">支付时间</text>
          <text class="value">{{ order.paidAt }}</text>
        </view>
      </view>

      <!-- Bottom padding -->
      <view style="height: 70px"></view>
    </scroll-view>

    <!-- Fixed Bottom Action Bar -->
    <view v-if="order" class="action-bar">
      <view class="total-left">
        <text class="total-label">合计:</text>
        <text class="total-amount">¥{{ order.finalAmount.toFixed(2) }}</text>
      </view>
      <view class="action-right">
        <!-- pending_payment: 取消订单 + 去支付 -->
        <template v-if="order.status === 'pending_payment'">
          <view class="btn btn-destroy-outline" @click="onCancelOrder">取消订单</view>
          <view class="btn btn-accent-filled" @click="goToPayment">去支付</view>
        </template>
        <!-- paid: 等待发货 -->
        <template v-else-if="order.status === 'paid'">
          <text class="waiting-text">等待发货中</text>
        </template>
        <!-- shipped: 查看物流 + 确认收货 -->
        <template v-else-if="order.status === 'shipped'">
          <view class="btn btn-outline" @click="viewLogistics">查看物流</view>
          <view class="btn btn-accent-filled" @click="onConfirmReceipt">确认收货</view>
        </template>
        <!-- delivered/completed: 评价 + 申请退款 -->
        <template v-else-if="order.status === 'delivered' || order.status === 'completed'">
          <view class="btn btn-outline" @click="goToEvaluate">评价</view>
          <view class="btn btn-destroy-outline" @click="onApplyRefund">申请退款</view>
        </template>
        <!-- refunding: 查看退款进度 -->
        <template v-else-if="order.status === 'refunding'">
          <view class="btn btn-outline" @click="viewRefundProgress">查看退款进度</view>
        </template>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getOrderDetail, cancelOrder, confirmReceipt, type Order } from '@/services/order'

const orderId = ref<number>(0)
const order = ref<Order | null>(null)
const isLoading = ref(false)

// Status text mapping
const statusTextMap: Record<string, string> = {
  pending_payment: '待付款',
  paid: '待发货',
  shipped: '运输中',
  delivered: '待收货',
  completed: '已完成',
  cancelled: '已取消',
  refunding: '退款中'
}

// Status descriptions
const statusDescMap: Record<string, string> = {
  pending_payment: '请在30分钟内完成支付',
  paid: '商家正在准备商品',
  shipped: '商品已在运输途中',
  delivered: '请确认收到货物',
  completed: '交易已完成',
  cancelled: '订单已取消',
  refunding: '退款申请处理中'
}

const getStatusText = (status: string) => statusTextMap[status] || status
const getStatusDesc = (status: string) => statusDescMap[status] || ''

// Load order detail
const loadOrderDetail = async () => {
  if (!orderId.value) return
  isLoading.value = true
  try {
    order.value = await getOrderDetail(orderId.value)
  } catch (e) {
    console.error('加载订单详情失败', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    isLoading.value = false
  }
}

// Copy order no
const copyOrderNo = () => {
  if (!order.value) return
  uni.setClipboardData({
    data: order.value.orderNo,
    success: () => {
      uni.showToast({ title: '订单号已复制', icon: 'success' })
    }
  })
}

// Copy tracking no
const copyTrackingNo = () => {
  if (!order.value?.logistics) return
  uni.setClipboardData({
    data: order.value.logistics.trackingNo,
    success: () => {
      uni.showToast({ title: '运单号已复制', icon: 'success' })
    }
  })
}

// Go to product
const goToProduct = (skuId: number) => {
  uni.navigateTo({ url: `/pages/product-detail/index?id=${skuId}` })
}

// Go to payment
const goToPayment = () => {
  if (!order.value) return
  uni.navigateTo({ url: `/pages/payment/index?orderId=${order.value.id}` })
}

// Cancel order
const onCancelOrder = () => {
  if (!order.value) return
  uni.showModal({
    title: '提示',
    content: '确定要取消该订单吗？',
    confirmColor: '#ff4d4f',
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelOrder(order.value!.id)
          uni.showToast({ title: '订单已取消', icon: 'success' })
          setTimeout(() => uni.navigateBack(), 1500)
        } catch (e) {
          uni.showToast({ title: '取消失败', icon: 'none' })
        }
      }
    }
  })
}

// Confirm receipt
const onConfirmReceipt = () => {
  if (!order.value) return
  uni.showModal({
    title: '提示',
    content: '确认收到货物吗？',
    confirmColor: '#ff5500',
    success: async (res) => {
      if (res.confirm) {
        try {
          await confirmReceipt(order.value!.id)
          uni.showToast({ title: '已确认收货', icon: 'success' })
          loadOrderDetail()
        } catch (e) {
          uni.showToast({ title: '确认失败', icon: 'none' })
        }
      }
    }
  })
}

// View logistics
const viewLogistics = () => {
  if (!order.value?.logistics) return
  uni.showToast({ title: '物流详情开发中', icon: 'none' })
}

// Go to evaluate
const goToEvaluate = () => {
  if (!order.value) return
  uni.showToast({ title: '评价功能开发中', icon: 'none' })
}

// Apply refund
const onApplyRefund = () => {
  if (!order.value) return
  uni.navigateTo({ url: `/pages/refund/apply?orderId=${order.value.id}` })
}

// View refund progress
const viewRefundProgress = () => {
  if (!order.value) return
  uni.navigateTo({ url: `/pages/refund/apply?orderId=${order.value.id}` })
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const options = currentPage.options || {}
  if (options.orderId) {
    orderId.value = Number(options.orderId)
    loadOrderDetail()
  } else {
    uni.showToast({ title: '参数错误', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  }
})
</script>

<style scoped lang="scss">
@import '@/uni.scss';

.order-detail-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

// Loading
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
}

// Detail scroll
.detail-scroll {
  flex: 1;
  height: calc(100vh - 60px);
}

// Status Banner
.status-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80px;
  padding: 16px;
  color: #fff;

  .status-text {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .status-desc {
    font-size: 13px;
    opacity: 0.9;
  }

  &.status-pending_payment { background: linear-gradient(135deg, #fa8c16, #ff5500); }
  &.status-paid { background: linear-gradient(135deg, #1890ff, #096dd9); }
  &.status-shipped { background: linear-gradient(135deg, #1890ff, #096dd9); }
  &.status-delivered { background: linear-gradient(135deg, #52c41a, #389e0d); }
  &.status-completed { background: linear-gradient(135deg, #52c41a, #389e0d); }
  &.status-cancelled { background: linear-gradient(135deg, #999, #666); }
  &.status-refunding { background: linear-gradient(135deg, #ff4d4f, #cf1322); }
}

// Section
.section {
  background: #fff;
  border-radius: 8px;
  margin: 8px;
  padding: 12px;
}

.section-header {
  font-size: 14px;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

// Logistics
.logistics-section {
  .logistics-info {
    margin-bottom: 12px;
  }

  .logistics-company,
  .logistics-no-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .label {
    font-size: 13px;
    color: #999;
  }

  .value {
    font-size: 13px;
    color: #333;
  }

  .copy-btn {
    padding: 2px 4px;
  }

  .timeline {
    padding-left: 8px;
  }

  .timeline-item {
    display: flex;
    padding-left: 16px;
    position: relative;
    padding-bottom: 12px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 6px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #d9d9d9;
    }

    &.latest::before {
      background: #52c41a;
    }
  }

  .timeline-dot {
    display: none;
  }

  .timeline-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .timeline-time {
    font-size: 12px;
    color: #999;
  }

  .timeline-text {
    font-size: 13px;
    color: #333;
  }
}

// Order Info
.order-info-card {
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;

    &:last-child {
      border-bottom: none;
    }
  }

  .label {
    font-size: 13px;
    color: #999;
  }

  .value-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .value {
    font-size: 13px;
    color: #333;
  }

  .copy-btn {
    padding: 2px 4px;
  }
}

// Address
.address-section {
  .address-info {
    .receiver {
      display: flex;
      gap: 12px;
      margin-bottom: 8px;
    }

    .name {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }

    .phone {
      font-size: 14px;
      color: #666;
    }

    .address-text {
      font-size: 13px;
      color: #666;
      line-height: 1.5;
    }

    .no-address {
      font-size: 13px;
      color: #999;
    }
  }
}

// Items
.items-section {
  .order-item {
    display: flex;
    padding: 8px 0;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }
  }

  .item-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
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
    margin-top: 2px;
  }

  .item-price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;
  }

  .item-price {
    font-size: 14px;
    color: #ff5500;
    font-weight: 500;
  }

  .item-qty {
    font-size: 13px;
    color: #999;
  }
}

// Payment
.payment-section {
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
  }

  .label {
    font-size: 13px;
    color: #999;
  }

  .value {
    font-size: 13px;
    color: #333;
  }

  .discount {
    color: #52c41a;
  }

  .total-row {
    padding-top: 10px;
    margin-top: 4px;
    border-top: 1px solid #f0f0f0;
  }

  .total-amount {
    font-size: 18px;
    font-weight: 700;
    color: #ff5500;
  }
}

// Action Bar
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
}

.total-left {
  display: flex;
  align-items: baseline;
  gap: 4px;

  .total-label {
    font-size: 13px;
    color: #666;
  }

  .total-amount {
    font-size: 18px;
    font-weight: 700;
    color: #ff5500;
  }
}

.action-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn {
  height: 32px;
  line-height: 32px;
  padding: 0 16px;
  border-radius: 16px;
  font-size: 13px;
  border: none;
}

.btn-accent-filled {
  background: #ff5500;
  color: #fff;
}

.btn-outline {
  background: #fff;
  color: #333;
  border: 1px solid #d9d9d9;
}

.btn-destroy-outline {
  background: #fff;
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
}

.waiting-text {
  font-size: 13px;
  color: #999;
}
</style>
