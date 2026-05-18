<template>
  <view class="refund-apply-page">
    <!-- 退款进度状态展示（已有退款申请） -->
    <view class="refund-status-card" v-if="existingRefund">
      <view class="status-header">
        <text class="status-title">退款进度</text>
        <view class="status-badge" :class="getStatusClass(existingRefund.status)">
          {{ getStatusText(existingRefund.status) }}
        </view>
      </view>

      <view class="status-info">
        <view class="info-row">
          <text class="label">退款金额</text>
          <text class="value accent">¥{{ existingRefund.amount }}</text>
        </view>
        <view class="info-row">
          <text class="label">申请时间</text>
          <text class="value">{{ existingRefund.createTime }}</text>
        </view>
        <view class="info-row" v-if="existingRefund.reason">
          <text class="label">退款原因</text>
          <text class="value">{{ existingRefund.reason }}</text>
        </view>
        <view class="info-row" v-if="existingRefund.rejectReason">
          <text class="label">拒绝原因</text>
          <text class="value destructive">{{ existingRefund.rejectReason }}</text>
        </view>
      </view>

      <!-- 取消按钮（仅申请中状态显示） -->
      <view class="cancel-btn-wrap" v-if="existingRefund.status === 0">
        <view class="btn-cancel" @click="onCancelRefund">取消退款申请</view>
      </view>
    </view>

    <!-- 退款申请表单 -->
    <view class="apply-form" v-else>
      <!-- 订单信息卡片 -->
      <view class="order-info-card">
        <view class="card-header">订单信息</view>
        <view class="order-base">
          <text class="order-no">订单号: {{ orderInfo.orderNo }}</text>
          <text class="order-time">{{ orderInfo.createTime }}</text>
        </view>

        <!-- 商品列表 -->
        <view class="goods-list">
          <view class="goods-item" v-for="item in orderInfo.items" :key="item.skuId">
            <image class="goods-image" :src="item.goodsImage" mode="aspectFill" />
            <view class="goods-info">
              <text class="goods-name">{{ item.goodsName }}</text>
              <text class="goods-spec" v-if="item.specs">{{ item.specs }}</text>
              <view class="goods-price-row">
                <text class="goods-price">¥{{ item.price }}</text>
                <text class="goods-qty">x{{ item.quantity }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 退款金额 -->
        <view class="refund-amount-row">
          <text class="label">退款金额</text>
          <text class="amount accent">¥{{ orderInfo.refundAmount || orderInfo.totalAmount }}</text>
        </view>
      </view>

      <!-- 退款原因 -->
      <view class="reason-section">
        <view class="section-header">退款原因 <text class="required">*</text></view>
        <view class="reason-list">
          <view
            class="reason-item"
            v-for="reason in presetReasons"
            :key="reason"
            :class="{ selected: selectedReason === reason }"
            @click="onSelectReason(reason)"
          >
            <view class="radio-wrap">
              <view class="radio" :class="{ checked: selectedReason === reason }">
                <view class="radio-inner" v-if="selectedReason === reason"></view>
              </view>
            </view>
            <text class="reason-text">{{ reason }}</text>
          </view>
        </view>

        <!-- 其他原因输入 -->
        <view class="other-reason-wrap" v-if="selectedReason === '其他'">
          <textarea
            class="other-reason-input"
            v-model="otherReason"
            placeholder="请输入退款原因"
            maxlength="200"
            @input="onOtherReasonInput"
          />
          <view class="char-count">{{ otherReason.length }}/200</view>
        </view>
      </view>

      <!-- 图片上传 -->
      <view class="image-upload-section">
        <view class="section-header">上传凭证 <text class="optional">(选填，最多3张)</text></view>
        <view class="image-grid">
          <view
            class="image-item"
            v-for="(img, index) in uploadedImages"
            :key="index"
          >
            <image class="uploaded-image" :src="img" mode="aspectFill" />
            <view class="image-delete-btn" @click="onDeleteImage(index)">
              <text class="delete-icon">x</text>
            </view>
          </view>
          <view
            class="add-image-btn"
            v-if="uploadedImages.length < 3"
            @click="onChooseImage"
          >
            <text class="add-icon">+</text>
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <view
          class="btn-submit"
          :class="{ disabled: !canSubmit }"
          @click="onSubmit"
        >
          提交退款申请
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { API_BASE, REFUND_APPLY, REFUND_DETAIL, REFUND_CANCEL } from '@/config/api'
import { getCurrentUserId } from '@/utils/helpers'

// 预设退款原因
const presetReasons = ['不想要了', '商品损坏', '发错货', '与描述不符', '其他']

// 订单ID（从页面参数获取）
const orderId = ref<number>(0)

// 订单信息
const orderInfo = ref<any>({
  orderNo: '',
  createTime: '',
  items: [],
  totalAmount: 0,
  refundAmount: 0
})

// 已存在的退款记录
const existingRefund = ref<any>(null)

// 选中的退款原因
const selectedReason = ref<string>('')

// 其他原因文本
const otherReason = ref<string>('')

// 已上传的图片列表
const uploadedImages = ref<string[]>([])

// 是否有图片正在上传
const isUploading = ref(false)

// 能否提交
const canSubmit = computed(() => {
  if (!selectedReason.value) return false
  if (selectedReason.value === '其他' && !otherReason.value.trim()) return false
  return true
})

// 页面加载
onLoad((options: any) => {
  if (options.orderId) {
    orderId.value = Number(options.orderId)
    loadOrderInfo(orderId.value)
    checkExistingRefund(orderId.value)
  } else {
    uni.showToast({ title: '参数错误', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  }
})

// 加载订单信息
const loadOrderInfo = async (id: number) => {
  uni.showLoading({ title: '加载中...' })
  try {
    // 实际从后端获取订单详情
    const res: any = await request(`/api/mall/order/${id}`)
    orderInfo.value = res.data || getMockOrderInfo(id)
  } catch (e) {
    // 使用模拟数据
    orderInfo.value = getMockOrderInfo(id)
  } finally {
    uni.hideLoading()
  }
}

// 获取模拟订单数据（后端对接前使用）
const getMockOrderInfo = (id: number) => ({
  orderNo: `ORDER${id}20260509`,
  createTime: '2026-05-09 10:30:00',
  items: [
    {
      skuId: 1001,
      goodsName: '联想ThinkServer服务器',
      goodsImage: 'https://placehold.co/100x100/f5f5f5/999?text=Server',
      specs: '配置一/16GB/1TB',
      price: 12999.00,
      quantity: 1
    }
  ],
  totalAmount: 12999.00,
  refundAmount: 12999.00
})

// 检查是否有已存在的退款申请
const checkExistingRefund = async (id: number) => {
  try {
    const res: any = await request(`${REFUND_DETAIL}?orderId=${id}`)
    if (res.data) {
      existingRefund.value = res.data
    }
  } catch (e) {
    // 无退款记录，继续显示表单
  }
}

// 选择退款原因
const onSelectReason = (reason: string) => {
  selectedReason.value = reason
  if (reason !== '其他') {
    otherReason.value = ''
  }
}

// 其他原因输入
const onOtherReasonInput = () => {
  // 限制在模板中通过 maxlength 处理
}

// 选择图片
const onChooseImage = () => {
  const remainCount = 3 - uploadedImages.value.length
  if (remainCount <= 0) return

  uni.chooseImage({
    count: remainCount,
    sourceType: ['album', 'camera'],
    success: async (res) => {
      isUploading.value = true
      uni.showLoading({ title: '上传中...' })

      try {
        for (const tempPath of res.tempFilePaths) {
          // 上传图片到后端
          const uploadRes: any = await uploadImage(tempPath)
          if (uploadRes.url) {
            uploadedImages.value.push(uploadRes.url)
          }
        }
      } catch (e) {
        uni.showToast({ title: '图片上传失败', icon: 'none' })
      } finally {
        isUploading.value = false
        uni.hideLoading()
      }
    },
    fail: () => {
      // 用户取消选择
    }
  })
}

// 上传图片
const uploadImage = (filePath: string): Promise<{ url: string }> => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${API_BASE}/api/mall/upload`,
      filePath,
      name: 'file',
      success: (res) => {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data)
          resolve({ url: data.url })
        } else {
          reject(res)
        }
      },
      fail: reject
    })
  })
}

// 删除图片
const onDeleteImage = (index: number) => {
  uploadedImages.value.splice(index, 1)
}

// 获取退款状态样式类
const getStatusClass = (status: number) => {
  switch (status) {
    case 0: return 'pending'    // 申请中
    case 1: return 'approved'  // 已通过
    case 2: return 'rejected'  // 已拒绝
    default: return ''
  }
}

// 获取退款状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '申请中'
    case 1: return '已通过'
    case 2: return '已拒绝'
    default: return ''
  }
}

// 提交退款申请
const onSubmit = async () => {
  if (!canSubmit.value) {
    uni.showToast({ title: '请填写退款原因', icon: 'none' })
    return
  }

  const reason = selectedReason.value === '其他' ? otherReason.value : selectedReason.value

  uni.showLoading({ title: '提交中...' })
  try {
    await request(REFUND_APPLY, {
      method: 'POST',
      data: {
        orderId: orderId.value,
        reason,
        images: uploadedImages.value
      }
    })
    uni.showToast({ title: '退款申请已提交', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } catch (e) {
    uni.showToast({ title: '提交失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// 取消退款申请
const onCancelRefund = () => {
  if (!existingRefund.value?.id) return

  uni.showModal({
    title: '确认取消',
    content: '确定要取消退款申请吗？',
    success: async (res) => {
      if (res.confirm) {
        await doCancelRefund()
      }
    }
  })
}

// 执行取消退款
const doCancelRefund = async () => {
  uni.showLoading({ title: '取消中...' })
  try {
    await request(`${REFUND_CANCEL}/${existingRefund.value.id}/cancel`, {
      method: 'DELETE'
    })
    uni.showToast({ title: '已取消退款申请', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } catch (e) {
    uni.showToast({ title: '取消失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// Request wrapper
const request = <T>(url: string, options?: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${url}`,
      ...options,
      header: {
        ...options?.header,
        'x-tenant-header': TENANT_ID,
        'x-user-id': getCurrentUserId(),
        'Content-Type': 'application/json'
      },
      success: (res: any) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          uni.showToast({ title: '请先登录', icon: 'none' })
          reject(res)
        } else {
          reject(res)
        }
      },
      fail: reject
    })
  })
}
</script>

<style scoped lang="scss">
@import '@/uni.scss';

.refund-apply-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 8px;
  padding-bottom: 32px;
}

// 订单信息卡片
.order-info-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;

  .card-header {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }

  .order-base {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .order-no {
    font-size: 12px;
    color: #333;
  }

  .order-time {
    font-size: 12px;
    color: #999;
  }

  .goods-list {
    .goods-item {
      display: flex;
      padding: 8px 0;
      border-top: 1px solid #f0f0f0;

      &:first-child {
        border-top: none;
      }
    }

    .goods-image {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .goods-info {
      flex: 1;
      margin-left: 12px;
      display: flex;
      flex-direction: column;
    }

    .goods-name {
      font-size: 14px;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .goods-spec {
      font-size: 12px;
      color: #999;
      margin-top: 2px;
    }

    .goods-price-row {
      display: flex;
      justify-content: space-between;
      margin-top: auto;
    }

    .goods-price {
      font-size: 14px;
      color: #ff5500;
      font-weight: 500;
    }

    .goods-qty {
      font-size: 12px;
      color: #999;
    }
  }

  .refund-amount-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;

    .label {
      font-size: 14px;
      color: #666;
    }

    .amount {
      font-size: 18px;
      font-weight: bold;
    }
  }
}

// 退款进度卡片
.refund-status-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;

  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .status-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .status-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;

    &.pending {
      background: #fff7e6;
      color: #fa8c16;
    }

    &.approved {
      background: #f6ffed;
      color: #52c41a;
    }

    &.rejected {
      background: #fff1f0;
      color: #ff4d4f;
    }
  }

  .status-info {
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }
    }

    .label {
      font-size: 14px;
      color: #999;
    }

    .value {
      font-size: 14px;
      color: #333;
    }
  }

  .cancel-btn-wrap {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }

  .btn-cancel {
    width: 100%;
    height: 44px;
    border: 1px solid #ff4d4f;
    color: #ff4d4f;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
}

// 退款原因
.reason-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;

  .section-header {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;

    .required {
      color: #ff4d4f;
      margin-left: 2px;
    }

    .optional {
      font-size: 12px;
      font-weight: normal;
      color: #999;
    }
  }

  .reason-list {
    .reason-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      &.selected {
        .radio {
          border-color: #ff5500;
        }
        .radio-inner {
          background: #ff5500;
        }
      }
    }

    .radio-wrap {
      margin-right: 12px;
    }

    .radio {
      width: 18px;
      height: 18px;
      border: 1px solid #ddd;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      &.checked {
        border-color: #ff5500;
      }
    }

    .radio-inner {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #ff5500;
    }

    .reason-text {
      font-size: 14px;
      color: #333;
    }
  }

  .other-reason-wrap {
    margin-top: 12px;
    position: relative;
  }

  .other-reason-input {
    width: 100%;
    height: 80px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 12px;
    font-size: 14px;
    box-sizing: border-box;
    resize: none;
  }

  .char-count {
    position: absolute;
    right: 12px;
    bottom: 8px;
    font-size: 12px;
    color: #999;
  }
}

// 图片上传
.image-upload-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;

  .section-header {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;

    .optional {
      font-weight: normal;
      color: #999;
    }
  }

  .image-grid {
    display: grid;
    grid-template-columns: repeat(3, 80px);
    gap: 8px;
  }

  .image-item {
    width: 80px;
    height: 80px;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
  }

  .uploaded-image {
    width: 100%;
    height: 100%;
  }

  .image-delete-btn {
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 20px;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0 4px 0 4px;

    .delete-icon {
      color: #fff;
      font-size: 12px;
      font-weight: bold;
    }
  }

  .add-image-btn {
    width: 80px;
    height: 80px;
    border: 1px dashed #ddd;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
  }

  .add-icon {
    font-size: 28px;
    color: #999;
    line-height: 1;
  }
}

// 提交按钮
.submit-section {
  padding: 16px;
}

.btn-submit {
  width: 100%;
  height: 44px;
  background: #ff5500;
  color: #fff;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;

  &.disabled {
    background: #ccc;
    color: #fff;
  }
}

// 颜色辅助类
.accent {
  color: #ff5500;
}

.destructive {
  color: #ff4d4f;
}
</style>