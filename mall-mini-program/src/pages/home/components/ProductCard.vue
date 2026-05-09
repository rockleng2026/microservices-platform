<template>
  <view class="product-card" @tap="onProductTap">
    <image
      class="product-image"
      :src="product.mainImage || '/static/images/placeholder.png'"
      mode="aspectFill"
      @error="onImageError"
    />
    <view class="product-info">
      <text class="product-name">{{ product.name }}</text>
      <view class="product-bottom">
        <text class="product-price">¥{{ formatPrice(product.price) }}</text>
        <text class="product-sales">销量 {{ product.sales || 0 }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const formatPrice = (price) => {
  return typeof price === 'number' ? price.toFixed(2) : '0.00'
}

const onProductTap = () => {
  uni.navigateTo({
    url: `/pages/product-detail/index?id=${props.product.id}`
  })
}

const onImageError = (e) => {
  e.target.src = '/static/images/placeholder.png'
}
</script>

<style scoped lang="scss">
.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;

  .product-image {
    width: 100%;
    aspect-ratio: 1;
    background: #f5f5f5;
  }

  .product-info {
    padding: 8px;

    .product-name {
      font-size: 14px;
      color: #333;
      line-height: 1.4;
      height: 2.8em;
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