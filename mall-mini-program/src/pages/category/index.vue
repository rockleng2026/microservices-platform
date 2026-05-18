<template>
  <view class="category-page">
    <view class="category-container">
      <!-- Left sidebar -->
      <scroll-view class="category-left" scroll-y="true">
        <view
          v-for="cat in categories"
          :key="cat.id"
          :class="['category-item', { active: selectedCategory?.id === cat.id }]"
          @click="selectCategory(cat)"
        >
          {{ cat.name }}
        </view>
      </scroll-view>

      <!-- Right content -->
      <scroll-view class="category-right" scroll-y="true">
        <view v-if="selectedCategory" class="sub-categories">
          <view class="sub-title">{{ selectedCategory.name }} 子分类</view>
          <view class="sub-grid" v-if="selectedCategory.children?.length">
            <view
              v-for="sub in selectedCategory.children"
              :key="sub.id"
              class="sub-item"
              @click="goToProductList(sub)"
            >
              <image class="sub-icon" :src="getImageSrc(sub.icon)" mode="aspectFit" />
              <text class="sub-name">{{ sub.name }}</text>
            </view>
          </view>
          <view v-else class="no-sub">暂无子分类</view>
        </view>

        <!-- Products in this category -->
        <view class="products-section" v-if="selectedCategory">
          <view class="section-title">{{ selectedCategory.name }} 商品</view>
          <view class="product-grid" v-if="products.length">
            <view class="product-item" v-for="p in products" :key="p.id" @click="goToDetail(p)">
              <image class="product-image" :src="getImageSrc(p.mainImage)" mode="aspectFill" />
              <view class="product-info">
                <text class="product-name">{{ p.name }}</text>
                <text class="product-price">¥{{ p.price }}</text>
              </view>
            </view>
          </view>
          <view v-else class="no-products">暂无商品</view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCategories } from '@/services/home'
import { getGoodsList } from '@/services/goods'
import { getFullImageUrl, DEFAULT_AVATAR_DATAURI } from '@/utils/helpers'

const categories = ref([])
const selectedCategory = ref(null)
const products = ref([])

const hasLoaded = ref(false)

// Helper to get image src with fallback
const getImageSrc = (path) => {
  if (!path) return DEFAULT_AVATAR_DATAURI
  return getFullImageUrl(path)
}

const loadCategories = async () => {
  try {
    const res = await getCategories()
    categories.value = res || []
    if (categories.value.length > 0 && !selectedCategory.value) {
      selectCategory(categories.value[0])
    }
  } catch (e) {
    console.error('Failed to load categories:', e)
  }
}

const selectCategory = async (cat) => {
  selectedCategory.value = cat
  await loadProducts(cat.id)
}

const loadProducts = async (categoryId) => {
  try {
    const res = await getGoodsList({ categoryId, pageSize: 20 })
    products.value = res?.records || []
  } catch (e) {
    console.error('Failed to load products:', e)
    products.value = []
  }
}

const goToProductList = (sub) => {
  uni.navigateTo({
    url: `/pages/product-list/index?categoryId=${sub.id}&keyword=${sub.name}`
  })
}

const goToDetail = (p) => {
  uni.navigateTo({
    url: `/pages/product-detail/index?id=${p.id}`
  })
}

onShow(() => {
  // For tabBar pages, onShow is called every time tab is switched
  // Only load if we haven't loaded yet or categories are empty
  if (!hasLoaded.value || categories.value.length === 0) {
    hasLoaded.value = true
    loadCategories()
  }
})
</script>

<style scoped lang="scss">
.category-page {
  height: 100vh;
  background: #f5f5f5;
}

.category-container {
  display: flex;
  height: 100%;
}

.category-left {
  width: 180rpx;
  height: 100%;
  background: #fff;
}

.category-item {
  padding: 30rpx 20rpx;
  font-size: 26rpx;
  color: #666;
  text-align: center;
  border-left: 6rpx solid transparent;

  &.active {
    color: #ff5500;
    background: #fff5f0;
    border-left-color: #ff5500;
  }
}

.category-right {
  flex: 1;
  height: 100%;
  padding: 20rpx;
}

.sub-categories {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.sub-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.sub-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.sub-item {
  display: flex;
  flex-direction: column;
  align-items: center;

  .sub-icon {
    width: 80rpx;
    height: 80rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
  }

  .sub-name {
    font-size: 24rpx;
    color: #666;
    margin-top: 10rpx;
    text-align: center;
  }
}

.no-sub,
.no-products {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  padding: 40rpx;
}

.products-section {
  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.product-item {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;

  .product-image {
    width: 100%;
    height: 320rpx;
    background: #f5f5f5;
  }

  .product-info {
    padding: 16rpx;

    .product-name {
      font-size: 26rpx;
      color: #333;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-price {
      font-size: 28rpx;
      color: #ff5500;
      margin-top: 10rpx;
    }
  }
}
</style>
