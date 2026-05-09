<template>
  <view class="address-list-page">
    <!-- 顶部导航 (standalone mode) -->
    <view class="nav-bar" v-if="!isDrawerMode">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="nav-title">收货地址</view>
      <view class="nav-right" @click="goToAdd">
        <text class="add-icon">+</text>
      </view>
    </view>

    <!-- 关闭按钮 (drawer mode) -->
    <view class="drawer-header" v-if="isDrawerMode">
      <text class="drawer-title">选择收货地址</text>
      <view class="close-btn" @click="closeDrawer">✕</view>
    </view>

    <!-- 地址列表 -->
    <scroll-view class="address-scroll" scroll-y>
      <view class="address-list" v-if="addressList.length > 0">
        <view
          class="address-card"
          v-for="item in addressList"
          :key="item.id"
          @click="onAddressSelect(item)"
        >
          <!-- 默认标识 -->
          <view class="default-badge" v-if="item.isDefault === 1">默认</view>

          <!-- 地址内容 -->
          <view class="address-content">
            <view class="user-info">
              <text class="receiver-name">{{ item.receiverName }}</text>
              <text class="receiver-phone">{{ item.receiverPhone }}</text>
            </view>
            <view class="address-detail">
              {{ item.province }}{{ item.city }}{{ item.district }}{{ item.detailAddress }}
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="action-buttons">
            <!-- 默认选择 radio -->
            <view
              class="radio-btn"
              :class="{ active: item.isDefault === 1 }"
              @click.stop="setDefault(item)"
            >
              <view class="radio-inner"></view>
            </view>

            <!-- 编辑按钮 -->
            <view class="action-icon" @click.stop="goToEdit(item.id)">
              <text>✎</text>
            </view>

            <!-- 删除按钮 -->
            <view class="action-icon delete" @click.stop="deleteAddress(item.id)">
              <text>🗑</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">📍</text>
        <text class="empty-text">暂无收货地址</text>
        <text class="empty-hint">点击右上角添加新地址</text>
      </view>
    </scroll-view>

    <!-- 添加地址按钮 (standalone mode) -->
    <view class="add-address-btn" v-if="!isDrawerMode" @click="goToAdd">
      <text>新增地址</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { API_BASE, ADDRESS_LIST } from '@/config/api'

interface Address {
  id: number
  userId: number
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detailAddress: string
  isDefault: number
  createdAt: string
}

const addressList = ref<Address[]>([])
const isDrawerMode = ref(false)

// 获取地址列表
const loadAddressList = async () => {
  uni.showLoading({ title: '加载中...' })
  try {
    const userId = uni.getStorageSync('userId') || '1'
    const res: any = await new Promise((resolve, reject) => {
      uni.request({
        url: `${API_BASE}${ADDRESS_LIST}`,
        method: 'GET',
        header: { 'x-user-id': userId },
        success: (r: any) => resolve(r),
        fail: reject
      })
    })

    if (res.statusCode === 200 && res.data) {
      addressList.value = Array.isArray(res.data) ? res.data : []
    }
  } catch (e) {
    console.error('获取地址列表失败', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// 设置默认地址
const setDefault = async (item: Address) => {
  if (item.isDefault === 1) return

  try {
    const userId = uni.getStorageSync('userId') || '1'
    await new Promise((resolve, reject) => {
      uni.request({
        url: `${API_BASE}${ADDRESS_LIST}/${item.id}/default`,
        method: 'PUT',
        header: { 'x-user-id': userId },
        success: (res: any) => {
          if (res.statusCode === 200 || res.statusCode === 204) {
            resolve(res)
          } else {
            reject(res)
          }
        },
        fail: reject
      })
    })

    // 更新本地状态
    addressList.value.forEach(addr => {
      addr.isDefault = addr.id === item.id ? 1 : 0
    })
    uni.showToast({ title: '已设为默认', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '设置失败', icon: 'none' })
  }
}

// 删除地址
const deleteAddress = (id: number) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该地址吗？',
    confirmColor: '#ff4d4f',
    success: async (res) => {
      if (res.confirm) {
        try {
          const userId = uni.getStorageSync('userId') || '1'
          await new Promise((resolve, reject) => {
            uni.request({
              url: `${API_BASE}${ADDRESS_LIST}/${id}`,
              method: 'DELETE',
              header: { 'x-user-id': userId },
              success: (r: any) => {
                if (r.statusCode === 200 || r.statusCode === 204) {
                  resolve(r)
                } else {
                  reject(r)
                }
              },
              fail: reject
            })
          })

          addressList.value = addressList.value.filter(item => item.id !== id)
          uni.showToast({ title: '已删除', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

// 跳转编辑页
const goToEdit = (id: number) => {
  uni.navigateTo({ url: `/pages/address/edit?id=${id}` })
}

// 跳转新增页
const goToAdd = () => {
  uni.navigateTo({ url: '/pages/address/edit' })
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 地址选择回调 (drawer mode)
const onAddressSelect = (item: Address) => {
  if (isDrawerMode.value) {
    // 向父页面传递选中的地址
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage) {
      prevPage.setData?.({ selectedAddress: item })
      prevPage.onAddressSelected?.(item)
    }
    closeDrawer()
  }
}

// 关闭抽屉
const closeDrawer = () => {
  uni.navigateBack()
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const query = (currentPage as any).options || {}

  // 判断是否为 drawer 模式
  isDrawerMode.value = query.drawer === 'true'

  loadAddressList()
})
</script>

<style scoped lang="scss">
.address-list-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

// 导航栏 (standalone mode)
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #eee;

  .nav-left, .nav-right {
    width: 40px;
    height: 44px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .nav-title {
    font-size: 17px;
    font-weight: 600;
    color: #333;
  }

  .add-icon {
    font-size: 24px;
    color: #ff5500;
  }
}

// 抽屉头部 (drawer mode)
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #fff;
  border-radius: 16px 16px 0 0;
  border-top: 1px solid #eee;

  .drawer-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .close-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #999;
  }
}

// 地址滚动区域
.address-scroll {
  flex: 1;
  max-height: 60vh;
}

// 地址列表
.address-list {
  padding: 8px;
}

// 地址卡片
.address-card {
  position: relative;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  // 默认标识
  .default-badge {
    position: absolute;
    top: 16px;
    right: 60px;
    padding: 2px 8px;
    font-size: 10px;
    color: #fff;
    background: #ff5500;
    border-radius: 4px;
  }

  .address-content {
    padding-right: 80px;

    .user-info {
      display: flex;
      align-items: baseline;
      margin-bottom: 8px;

      .receiver-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-right: 12px;
      }

      .receiver-phone {
        font-size: 14px;
        color: #666;
      }
    }

    .address-detail {
      font-size: 14px;
      color: #666;
      line-height: 1.5;
    }
  }

  // 操作按钮
  .action-buttons {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 12px;

    .radio-btn {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &.active {
        border-color: #ff5500;

        .radio-inner {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ff5500;
        }
      }

      .radio-inner {
        width: 0;
        height: 0;
        border-radius: 50%;
        transition: all 0.2s;
      }
    }

    .action-icon {
      font-size: 18px;
      color: #999;
      cursor: pointer;
      transition: color 0.2s;

      &:active {
        color: #666;
      }

      &.delete {
        color: #ff4d4f;

        &:active {
          color: #e64d4f;
        }
      }
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .empty-text {
    font-size: 16px;
    color: #333;
    margin-bottom: 8px;
  }

  .empty-hint {
    font-size: 14px;
    color: #999;
  }
}

// 添加地址按钮
.add-address-btn {
  position: fixed;
  bottom: 20px;
  left: 16px;
  right: 16px;
  height: 44px;
  background: #ff5500;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255, 85, 0, 0.3);

  &:active {
    background: #e64d00;
  }
}
</style>