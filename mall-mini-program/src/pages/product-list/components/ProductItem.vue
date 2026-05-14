<template>
  <view class="product-item" @click="goDetail">
    <!-- 商品图片 -->
    <view class="product-image">
      <image :src="getProductImageSrc()" mode="aspectFill" />
    </view>

    <!-- 商品信息 -->
    <view class="product-info">
      <text class="product-name">{{ product.name }}</text>
      <view class="product-bottom">
        <text class="product-price">¥{{ formatPrice(product.price) }}</text>
        <text class="product-sales">{{ product.sales }}件</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { MallGoods } from '@/services/home'
import { getFullImageUrl, DEFAULT_AVATAR_DATAURI } from '@/utils/helpers'

const props = defineProps<{
  product: MallGoods
}>()

const emit = defineEmits<{
  click: [id: number]
}>()

// 格式化价格
const formatPrice = (price: number): string => {
  return price.toFixed(2)
}

// 获取商品图片
const getProductImageSrc = (): string => {
  if (!props.product.mainImage) return DEFAULT_AVATAR_DATAURI
  // Always use getFullImageUrl to ensure localhost replacement
  return getFullImageUrl(props.product.mainImage)
}

// 跳转到商品详情
const goDetail = () => {
  uni.navigateTo({
    url: `/pages/product-detail/index?id=${props.product.id}`
  })
}
</script>

<style scoped lang="scss">
.product-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;

  .product-image {
    width: 100%;
    aspect-ratio: 1;
    background: #f5f5f5;

    image {
      width: 100%;
      height: 100%;
    }
  }

  .product-info {
    padding: 8px;

    .product-name {
      font-size: 14px;
      color: #333;
      line-height: 1.4;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .product-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;

      .product-price {
        color: #ff5500;
        font-size: 16px;
        font-weight: bold;
      }

      .product-sales {
        color: #999;
        font-size: 12px;
      }
    }
  }
}
</style>
