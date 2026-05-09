<template>
  <view class="product-detail-page">
    <!-- 商品不存在或已下架 -->
    <view class="offline-tip" v-if="isOffline">
      <text>商品已下架</text>
    </view>

    <scroll-view class="detail-scroll" v-else scroll-y>
      <!-- 图片轮播 -->
      <ImageCarousel :images="goodsDetail.images || [goodsDetail.mainImage]" />

      <!-- 商品基础信息 -->
      <view class="goods-info">
        <view class="price-row">
          <text class="price">¥{{ displayPrice }}</text>
          <text class="sales">销量 {{ goodsDetail.sales || 0 }}</text>
        </view>
        <view class="name">{{ goodsDetail.name }}</view>
        <view class="sub-title" v-if="goodsDetail.subTitle">{{ goodsDetail.subTitle }}</view>
        <view class="stock-row">
          <text class="stock" v-if="displayStock > 0">库存 {{ displayStock }} 件</text>
          <text class="stock out" v-else>无货</text>
        </view>
      </view>

      <!-- 规格选择 -->
      <SpecSelector
        v-if="goodsDetail.skus?.length"
        :skus="goodsDetail.skus"
        @select="onSpecSelect"
      />

      <!-- 数量选择 -->
      <QuantityStepper :stock="displayStock" v-model="quantity" />

      <!-- 评价摘要 -->
      <EvalSummary :goodsId="goodsId" />

      <!-- 商品详情描述 -->
      <view class="detail-content" v-if="goodsDetail.detail">
        <view class="title">商品详情</view>
        <!-- 解析HTML详情 -->
        <rich-text :nodes="goodsDetail.detail"></rich-text>
      </view>

      <!-- 底部占位 -->
      <view style="height: 80px"></view>
    </scroll-view>

    <!-- 底部购买栏 -->
    <view class="buy-bar" v-if="!isOffline">
      <view class="left-actions">
        <view class="btn-cart" @click="addToCart">加入购物车</view>
      </view>
      <view class="right-actions">
        <view class="btn-buy" @click="buyNow">立即购买</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ImageCarousel from './components/ImageCarousel.vue'
import SpecSelector from './components/SpecSelector.vue'
import QuantityStepper from './components/QuantityStepper.vue'
import EvalSummary from './components/EvalSummary.vue'
import { getGoodsDetail } from '@/services/goods'
import type { MallGoodsSku } from '@/services/goods'
import { cartStore } from '@/stores/cart'

// 商品ID
const goodsId = ref<number>(0)

// 商品详情
const goodsDetail = ref<any>({})

// 选中的SKU
const selectedSku = ref<MallGoodsSku | null>(null)

// 购买数量
const quantity = ref(1)

// 商品是否已下架
const isOffline = ref(false)

// 显示价格：优先选中的SKU价格，否则用商品原价
const displayPrice = computed(() => {
  if (selectedSku.value) {
    return selectedSku.value.price.toFixed(2)
  }
  return (goodsDetail.value.price || 0).toFixed(2)
})

// 显示库存：优先选中的SKU库存，否则用商品默认库存
const displayStock = computed(() => {
  if (selectedSku.value) {
    return selectedSku.value.stock
  }
  // 商品没有默认stock字段，默认为999
  return 999
})

// 规格选择回调
const onSpecSelect = (sku: MallGoodsSku) => {
  selectedSku.value = sku
  // 切换规格后重置数量
  quantity.value = 1
}

// 加入购物车
const addToCart = async () => {
  if (!selectedSku.value && goodsDetail.value.skus?.length) {
    uni.showToast({ title: '请选择规格', icon: 'none' })
    return
  }
  try {
    const skuId = selectedSku.value?.id || 0
    await cartStore.addToCart(skuId, quantity.value)
    uni.showToast({ title: '已加入购物车', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '加入失败，请重试', icon: 'none' })
  }
}

// 立即购买（后续 Phase 9+ 实现支付，当前仅提示）
const buyNow = () => {
  if (!selectedSku.value && goodsDetail.value.skus?.length) {
    uni.showToast({ title: '请选择规格', icon: 'none' })
    return
  }
  uni.showToast({ title: '支付功能开发中', icon: 'none' })
  // 后续 Phase 跳转结算页: uni.navigateTo({ url: '/pages/checkout/index?skuId=...' })
}

// 页面加载
onLoad((options: any) => {
  if (options.id) {
    goodsId.value = Number(options.id)
    loadGoodsDetail(goodsId.value)
  } else {
    uni.showToast({ title: '参数错误', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  }
})

// 加载商品详情
const loadGoodsDetail = async (id: number) => {
  uni.showLoading({ title: '加载中...' })
  try {
    const detail = await getGoodsDetail(id)
    goodsDetail.value = detail

    // 判断商品状态：1=上架
    if (detail.status !== 1) {
      isOffline.value = true
      uni.hideLoading()
      return
    }

    // 如果只有一个SKU，直接选中
    if (detail.skus?.length === 1) {
      selectedSku.value = detail.skus[0]
    }
  } catch (e) {
    console.error('加载商品详情失败', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  } finally {
    uni.hideLoading()
  }
}
</script>

<style scoped lang="scss">
@import './index.less';
</style>
