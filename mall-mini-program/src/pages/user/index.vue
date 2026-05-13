<template>
  <view class="user-page">
    <!-- User header -->
    <view class="user-header">
      <view class="user-info" @click="goLogin">
        <image class="avatar" :src="userInfo?.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="info">
          <text class="nickname">{{ userInfo?.nickname || '点击登录' }}</text>
          <text class="tip">登录后享受更多服务</text>
        </view>
      </view>
    </view>

    <!-- Order section -->
    <view class="order-section">
      <view class="section-header">
        <text class="title">我的订单</text>
        <text class="more" @click="goOrderList">全部订单 ></text>
      </view>
      <view class="order-tabs">
        <view class="tab-item" @click="goOrderList('1')">
          <text class="icon">⏳</text>
          <text class="label">待付款</text>
        </view>
        <view class="tab-item" @click="goOrderList('2')">
          <text class="icon">📦</text>
          <text class="label">待发货</text>
        </view>
        <view class="tab-item" @click="goOrderList('3')">
          <text class="icon">🚚</text>
          <text class="label">待收货</text>
        </view>
        <view class="tab-item" @click="goOrderList('4')">
          <text class="icon">⭐</text>
          <text class="label">待评价</text>
        </view>
      </view>
    </view>

    <!-- Menu list -->
    <view class="menu-section">
      <view class="menu-item" @click="goAddress">
        <text class="icon">📍</text>
        <text class="label">收货地址</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item" @click="goCoupons">
        <text class="icon">🎫</text>
        <text class="label">优惠券</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item" @click="goPoints">
        <text class="icon">💰</text>
        <text class="label">我的积分</text>
        <text class="arrow">></text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const userInfo = ref(null)

const goLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' })
}

const goOrderList = (status) => {
  const url = status ? `/pages/order-list/index?status=${status}` : '/pages/order-list/index'
  uni.navigateTo({ url })
}

const goAddress = () => {
  uni.navigateTo({ url: '/pages/address/index' })
}

const goCoupons = () => {
  uni.showToast({ title: '优惠券功能开发中', icon: 'none' })
}

const goPoints = () => {
  uni.showToast({ title: '积分功能开发中', icon: 'none' })
}

onShow(() => {
  // Check login status
  const token = uni.getStorageSync('token')
  if (token) {
    // Load user info
    userInfo.value = uni.getStorageSync('userInfo') || { nickname: '用户' }
  } else {
    userInfo.value = null
  }
})
</script>

<style scoped lang="scss">
.user-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.user-header {
  background: linear-gradient(135deg, #ff5500 0%, #ff7a3d 100%);
  padding: 40rpx 30rpx;

  .user-info {
    display: flex;
    align-items: center;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
      background: #fff;
    }

    .info {
      margin-left: 30rpx;

      .nickname {
        font-size: 36rpx;
        color: #fff;
        font-weight: 600;
      }

      .tip {
        font-size: 24rpx;
        color: rgba(255,255,255,0.8);
        margin-top: 10rpx;
        display: block;
      }
    }
  }
}

.order-section {
  background: #fff;
  margin: 20rpx;
  border-radius: 12rpx;
  padding: 30rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;

    .title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }

    .more {
      font-size: 24rpx;
      color: #999;
    }
  }

  .order-tabs {
    display: flex;
    justify-content: space-around;

    .tab-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .icon {
        font-size: 48rpx;
      }

      .label {
        font-size: 24rpx;
        color: #666;
        margin-top: 10rpx;
      }
    }
  }
}

.menu-section {
  background: #fff;
  margin: 20rpx;
  border-radius: 12rpx;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .icon {
      font-size: 40rpx;
      margin-right: 20rpx;
    }

    .label {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }

    .arrow {
      color: #ccc;
      font-size: 28rpx;
    }
  }
}
</style>
