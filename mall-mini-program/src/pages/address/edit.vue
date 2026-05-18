<template>
  <view class="address-edit-page">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="nav-title">{{ isEditMode ? '编辑收货地址' : '新增收货地址' }}</view>
      <view class="nav-right" @click="saveAddress">
        <text class="save-btn">保存</text>
      </view>
    </view>

    <!-- 表单内容 -->
    <view class="form-content">
      <!-- 收货人 -->
      <view class="form-item">
        <view class="form-label">收货人</view>
        <view class="form-input">
          <input
            v-model="formData.name"
            placeholder="请输入收货人姓名"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <!-- 手机号 -->
      <view class="form-item">
        <view class="form-label">手机号</view>
        <view class="form-input">
          <input
            v-model="formData.phone"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <!-- 所在地区 -->
      <view class="form-item">
        <!-- #ifdef MP-WEIXIN -->
        <picker mode="region" @change="onRegionChange">
          <view class="form-label">所在地区</view>
          <view class="form-input arrow-right">
            <text :class="selectedRegion ? 'region-text' : 'input-placeholder'">
              {{ selectedRegion || '请选择省/市/区' }}
            </text>
          </view>
        </picker>
        <!-- #endif -->
        <!-- #ifdef H5 -->
        <view class="form-label">所在地区</view>
        <view class="form-input arrow-right" @click="openRegionPicker">
          <text :class="selectedRegion ? 'region-text' : 'input-placeholder'">
            {{ selectedRegion || '请选择省/市/区' }}
          </text>
        </view>
        <!-- #endif -->
      </view>

      <!-- 详细地址 -->
      <view class="form-item">
        <view class="form-label">详细地址</view>
        <view class="form-input">
          <textarea
            v-model="formData.detail"
            placeholder="请输入详细地址"
            placeholder-class="input-placeholder"
            maxlength="100"
            :auto-height="true"
          />
        </view>
      </view>

      <!-- 设为默认地址 -->
      <view class="form-item default-item">
        <view class="form-label">设为默认地址</view>
        <view class="form-input">
          <switch
            :checked="formData.isDefault === 1"
            @change="onDefaultChange"
            color="#ff5500"
          />
        </view>
      </view>

      <!-- 删除按钮 (编辑模式) -->
      <view class="delete-btn" v-if="isEditMode" @click="deleteAddress">
        <text>删除收货地址</text>
      </view>
    </view>

    <!-- 保存按钮 (底部) -->
    <view class="save-fixed-btn" @click="saveAddress">
      <text>保存</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { API_BASE } from '@/config/api'
import { getCurrentUserId } from '@/utils/helpers'

const ADDRESS_API = '/api/mall/address'

interface AddressFormData {
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: number
}

const addressId = ref<number | null>(null)
const isEditMode = computed(() => addressId.value !== null)
const selectedRegion = ref('')

const formData = ref<AddressFormData>({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: 0
})

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 默认地址切换
const onDefaultChange = (e: any) => {
  formData.value.isDefault = e.detail.value ? 1 : 0
}

// 打开地区选择器 (H5)
const openRegionPicker = () => {
  uni.showModal({
    title: '请输入所在地区',
    editable: true,
    placeholderText: '例如：广东省 深圳市 南山区',
    success: (res) => {
      if (res.confirm && res.content) {
        const parts = res.content.trim().split(/\s+/)
        if (parts.length >= 3) {
          formData.value.province = parts[0]
          formData.value.city = parts[1]
          formData.value.district = parts[2]
          selectedRegion.value = `${parts[0]} ${parts[1]} ${parts[2]}`
        } else if (parts.length === 2) {
          formData.value.province = parts[0]
          formData.value.city = parts[1]
          formData.value.district = ''
          selectedRegion.value = `${parts[0]} ${parts[1]}`
        } else if (parts.length === 1) {
          formData.value.province = parts[0]
          formData.value.city = ''
          formData.value.district = ''
          selectedRegion.value = parts[0]
        }
      }
    },
    fail: () => {
      uni.showToast({ title: '请手动输入所在地区', icon: 'none' })
    }
  })
}

// 地区选择变化 (小程序)
const onRegionChange = (e: any) => {
  // picker mode="region" 返回的是数组 [province, city, district]，不是对象
  const [province, city, district] = e.detail.value
  formData.value.province = province || ''
  formData.value.city = city || ''
  formData.value.district = district || ''
  selectedRegion.value = `${province || ''} ${city || ''} ${district || ''}`.trim()
}

// 保存地址
const saveAddress = async () => {
  // 验证
  if (!formData.value.name.trim()) {
    uni.showToast({ title: '请输入收货人姓名', icon: 'none' })
    return
  }

  if (!formData.value.phone.trim() || formData.value.phone.length !== 11) {
    uni.showToast({ title: '请输入11位手机号', icon: 'none' })
    return
  }

  if (!formData.value.province) {
    uni.showToast({ title: '请选择所在地区', icon: 'none' })
    return
  }

  if (!formData.value.detail.trim()) {
    uni.showToast({ title: '请输入详细地址', icon: 'none' })
    return
  }

  uni.showLoading({ title: '保存中...' })

  try {
    // API path without /list suffix for save operations
    const url = addressId.value
      ? `${API_BASE}${ADDRESS_API}/${addressId.value}`
      : `${API_BASE}${ADDRESS_API}`

    const method = addressId.value ? 'PUT' : 'POST'

    const userId = getCurrentUserId()
    const res: any = await new Promise((resolve, reject) => {
      uni.request({
        url,
        method,
        data: formData.value,
        header: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-tenant-header': 'default'
        },
        success: (r: any) => resolve(r),
        fail: reject
      })
    })

    if (res.statusCode === 200 || res.statusCode === 201) {
      uni.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      throw new Error(res.data?.message || '保存失败')
    }
  } catch (e: any) {
    console.error('保存地址失败', e)
    uni.showToast({ title: '保存失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// 删除地址
const deleteAddress = () => {
  if (!addressId.value) return

  uni.showModal({
    title: '提示',
    content: '确定要删除该地址吗？',
    confirmColor: '#ff4d4f',
    success: async (res) => {
      if (res.confirm) {
        try {
          const userId = getCurrentUserId()
          await new Promise((resolve, reject) => {
            uni.request({
              url: `${API_BASE}${ADDRESS_API}/${addressId.value}`,
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

          uni.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

// 加载地址详情
const loadAddressDetail = async (id: number) => {
  uni.showLoading({ title: '加载中...' })
  try {
    const userId = getCurrentUserId()
    const res: any = await new Promise((resolve, reject) => {
      uni.request({
        url: `${API_BASE}${ADDRESS_API}/${id}`,
        method: 'GET',
        header: { 'x-user-id': userId, 'x-tenant-header': 'default' },
        success: (r: any) => resolve(r),
        fail: reject
      })
    })

    if (res.statusCode === 200 && res.data) {
      const data = res.data
      formData.value = {
        name: data.name || '',
        phone: data.phone || '',
        province: data.province || '',
        city: data.city || '',
        district: data.district || '',
        detail: data.detail || '',
        isDefault: data.isDefault || 0
      }

      if (data.province && data.city && data.district) {
        selectedRegion.value = `${data.province} ${data.city} ${data.district}`
      }
    }
  } catch (e) {
    console.error('加载地址详情失败', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

onShow(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const query = (currentPage as any).options || {}

  if (query.id) {
    addressId.value = Number(query.id)
    loadAddressDetail(addressId.value)
  } else {
    // Reset form for new address
    addressId.value = null
    formData.value = {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: 0
    }
    selectedRegion.value = ''
  }
})
</script>

<style scoped lang="scss">
.address-edit-page {
  min-height: 100vh;
  background: #f5f5f5;
}

// 导航栏
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #eee;

  .nav-left {
    width: 40px;
    height: 44px;
    display: flex;
    align-items: center;
  }

  .nav-title {
    font-size: 17px;
    font-weight: 600;
    color: #333;
  }

  .nav-right {
    .save-btn {
      font-size: 15px;
      color: #ff5500;
    }
  }
}

// 表单内容
.form-content {
  padding: 16px;
}

// 表单项
.form-item {
  display: flex;
  align-items: flex-start;
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;

  .form-label {
    width: 80px;
    font-size: 14px;
    color: #333;
    line-height: 24px;
    flex-shrink: 0;
  }

  .form-input {
    flex: 1;
    min-height: 24px;
    display: flex;
    align-items: center;

    input, textarea {
      width: 100%;
      font-size: 14px;
      color: #333;
      background: transparent;
    }

    textarea {
      min-height: 48px;
      line-height: 1.5;
    }

    .input-placeholder {
      color: #999;
    }

    .region-text {
      font-size: 14px;
      color: #333;
    }

    &.arrow-right::after {
      content: '>';
      font-size: 14px;
      color: #999;
      margin-left: 8px;
    }

    switch {
      transform: scale(0.8);
    }
  }

  &.default-item {
    align-items: center;
  }
}

// 删除按钮
.delete-btn {
  margin-top: 24px;
  text-align: center;
  padding: 12px;

  text {
    font-size: 14px;
    color: #ff4d4f;
  }
}

// 保存按钮
.save-fixed-btn {
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