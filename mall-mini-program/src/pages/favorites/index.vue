<template>
  <view class="favorites-page">
    <!-- Favorites grid -->
    <scroll-view
      class="favorites-grid"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <!-- Empty state -->
      <view v-if="!loading && favorites.length === 0" class="empty-state">
        <text class="empty-icon">❤️</text>
        <text class="empty-text">暂无收藏商品</text>
        <text class="empty-sub">将喜欢的商品加入收藏，方便下次购买</text>
      </view>

      <!-- Product grid -->
      <view v-else class="product-grid">
        <view
          v-for="item in favorites"
          :key="item.id"
          class="product-card"
          @click="goProductDetail(item.goodsId)"
        >
          <image class="product-image" :src="getImageSrc(item.image)" mode="aspectFill" />
          <view class="product-info">
            <text class="product-name">{{ item.goodsName }}</text>
            <view class="product-bottom">
              <text class="product-price">¥{{ item.price }}</text>
              <view class="delete-btn" @click.stop="handleDelete(item.id)">
                <text>删除</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Loading more -->
      <view v-if="loading" class="loading-more">
        <text>加载中...</text>
      </view>
      <view v-else-if="noMore" class="loading-more">
        <text>没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFavorites, removeFavorite } from '@/services/user'
import { getFullImageUrl } from '@/utils/helpers'

const favorites = ref([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const loading = ref(false)
const refreshing = ref(false)
const noMore = ref(false)

const loadFavorites = async (reset = false) => {
  if (loading.value) return
  loading.value = true

  try {
    if (reset) {
      page.value = 1
      favorites.value = []
      noMore.value = false
    }

    const res = await getFavorites(page.value, pageSize)

    if (reset) {
      favorites.value = res.list || []
    } else {
      favorites.value = [...favorites.value, ...(res.list || [])]
    }
    total.value = res.total || 0

    if (favorites.value.length >= total.value) {
      noMore.value = true
    } else {
      page.value++
    }
  } catch (e) {
    console.error('Failed to load favorites:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = () => {
  refreshing.value = true
  loadFavorites(true)
}

const onLoadMore = () => {
  if (!noMore.value && !loading.value) {
    loadFavorites()
  }
}

const handleDelete = async (id) => {
  try {
    await removeFavorite(id)
    // Remove from local list
    favorites.value = favorites.value.filter(item => item.id !== id)
    uni.showToast({ title: '已删除', icon: 'success' })
  } catch (e) {
    console.error('Failed to remove favorite:', e)
    uni.showToast({ title: '删除失败', icon: 'none' })
  }
}

const goProductDetail = (goodsId) => {
  uni.navigateTo({ url: `/pages/product-detail/index?id=${goodsId}` })
}

const getImageSrc = (image) => {
  if (!image) return ''
  if (image.startsWith('data:') || image.startsWith('http') || image.startsWith('//')) {
    return image
  }
  if (image.startsWith('/static/')) {
    return image
  }
  if (image.startsWith('/')) {
    return getFullImageUrl(image)
  }
  return image
}

onMounted(() => {
  loadFavorites(true)
})
</script>

<style scoped lang="scss">
.favorites-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.favorites-grid {
  padding: 20rpx;
  height: calc(100vh - env(safe-area-inset-top));
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 150rpx 0;

  .empty-icon {
    font-size: 100rpx;
  }

  .empty-text {
    font-size: 32rpx;
    color: #333;
    margin-top: 30rpx;
    font-weight: 600;
  }

  .empty-sub {
    font-size: 24rpx;
    color: #999;
    margin-top: 15rpx;
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.product-card {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 340rpx;
  background: #f5f5f5;
}

.product-info {
  padding: 20rpx;
}

.product-name {
  font-size: 26rpx;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  min-height: 72rpx;
}

.product-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 15rpx;
}

.product-price {
  font-size: 30rpx;
  color: #ff5500;
  font-weight: 600;
}

.delete-btn {
  padding: 8rpx 16rpx;
  font-size: 22rpx;
  color: #999;
  border: 1rpx solid #ddd;
  border-radius: 6rpx;
}

.loading-more {
  text-align: center;
  padding: 30rpx;
  font-size: 24rpx;
  color: #999;
}
</style>