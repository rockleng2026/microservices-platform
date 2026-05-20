<template>
  <view class="product-detail-page">
    <!-- 商品不存在或已下架 -->
    <view class="offline-tip" v-if="isOffline">
      <text>商品已下架</text>
    </view>

    <scroll-view class="detail-scroll" v-else scroll-y>
      <!-- 图片轮播 -->
      <ImageCarousel :images="carouselImages" />

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
        :initialSkuId="specifiedSkuId"
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
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ImageCarousel from './components/ImageCarousel.vue'
import SpecSelector from './components/SpecSelector.vue'
import QuantityStepper from './components/QuantityStepper.vue'
import EvalSummary from './components/EvalSummary.vue'
import { getGoodsDetail } from '@/services/goods'
import type { MallGoodsSku } from '@/services/goods'
import { cartStore } from '@/stores/cart'

// 商品ID
const goodsId = ref<number>(0)

// 指定的SKU ID（从订单页跳转时传入，用于自动选中规格）
const specifiedSkuId = ref<number | null>(null)

// 商品详情
const goodsDetail = ref<any>({})

// 选中的SKU
const selectedSku = ref<MallGoodsSku | null>(null)

// 购买数量
const quantity = ref(1)

// 商品是否已下架
const isOffline = ref(false)

const carouselImages = computed(() => {
  const imgs = goodsDetail.value.images
  let arr: string[] = []
  if (imgs) {
    try { arr = JSON.parse(imgs) } catch {}
  }
  const main = goodsDetail.value.mainImage
  if (main && !arr.includes(main)) arr.unshift(main)
  return arr
})

// 显示库存：优先选中的SKU库存，否则用商品默认库存
const displayStock = computed(() => {
  if (selectedSku.value) {
    return selectedSku.value.stock
  }
  // 商品没有默认stock字段，默认为999
  return 999
})

// 显示价格：优先选中的SKU价格，否则用商品默认价格
const displayPrice = computed(() => {
  if (selectedSku.value) {
    return selectedSku.value.price
  }
  return goodsDetail.value.price || 0
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

// 立即购买
const buyNow = () => {
  // Check login first
  const userInfo = uni.getStorageSync('userInfo')
  if (!userInfo || !userInfo.userId) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/index' })
    }, 1000)
    return
  }

  // Auto-select if only one SKU
  if (!selectedSku.value) {
    if (goodsDetail.value.skus?.length === 1) {
      selectedSku.value = goodsDetail.value.skus[0]
    } else if (goodsDetail.value.skus?.length > 1) {
      uni.showToast({ title: '请选择规格', icon: 'none' })
      return
    }
  }
  if (!selectedSku.value) {
    uni.showToast({ title: '商品不可购买', icon: 'none' })
    return
  }
  const skuId = selectedSku.value.id
  const goodsId = goodsDetail.value.id
  uni.navigateTo({ url: `/pages/checkout/index?skuId=${skuId}&goodsId=${goodsId}&quantity=${quantity.value}` })
}

// 页面加载
onLoad((options: any) => {
  if (options.id) {
    goodsId.value = Number(options.id)
    // 如果跳转时传入了 skuId，则自动选中该规格
    if (options.skuId) {
      specifiedSkuId.value = Number(options.skuId)
    }
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

    // 如果只有一个 SKU，直接选中（SpecSelector 会处理 initialSkuId 的情况）
    if (!specifiedSkuId.value && detail.skus?.length === 1) {
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
.product-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;
}

.offline-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f5f5f5;
  text {
    font-size: 16px;
    color: #999;
  }
}

.detail-scroll {
  height: calc(100vh - 50px);
}

.goods-info {
  padding: 16px;
  background: #fff;
  margin-bottom: 8px;

  .price-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .price {
    color: #ff5500;
    font-size: 24px;
    font-weight: bold;
  }

  .sales {
    color: #999;
    font-size: 12px;
  }

  .name {
    font-size: 16px;
    color: #333;
    margin-top: 8px;
    font-weight: 500;
  }

  .sub-title {
    font-size: 14px;
    color: #666;
    margin-top: 4px;
  }

  .stock-row {
    margin-top: 8px;
  }

  .stock {
    font-size: 12px;
    color: #666;
  }

  .stock.out {
    color: #ff4d4f;
  }
}

.detail-content {
  padding: 16px;
  background: #fff;
  margin-top: 8px;

  .title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }
}

.buy-bar {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 100;

  .left-actions {
    margin-right: 8px;
  }

  .btn-cart {
    width: 80px;
    height: 36px;
    border: 1px solid #ff5500;
    color: #ff5500;
    border-radius: 18px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }

  .right-actions {
    flex: 1;
  }

  .btn-buy {
    flex: 1;
    height: 36px;
    background: #ff5500;
    color: #fff;
    border-radius: 18px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
}
</style>
