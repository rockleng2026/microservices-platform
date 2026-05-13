<template>
  <view class="home-page">
    <SearchBar />
    <BannerSwiper :banners="banners" />
    <CategoryGrid :categories="categories" />
    <view class="section-title">热门推荐</view>
    <view class="product-grid">
      <ProductCard v-for="p in hotGoods" :key="p.id" :product="p" />
    </view>
    <view v-if="loading" class="loading-tip">加载中...</view>
    <view v-if="!loading && hotGoods.length === 0" class="empty-tip">暂无推荐商品</view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import SearchBar from './components/SearchBar.vue'
import BannerSwiper from './components/BannerSwiper.vue'
import CategoryGrid from './components/CategoryGrid.vue'
import ProductCard from './components/ProductCard.vue'
import { getBannerList, getCategories, getHotGoods } from '@/services/home'

const banners = ref([])
const categories = ref([])
const hotGoods = ref([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const [bannerRes, categoryRes, hotRes] = await Promise.all([
      getBannerList(),
      getCategories(),
      getHotGoods(10)
    ])
    banners.value = bannerRes || []
    categories.value = categoryRes || []
    hotGoods.value = hotRes || []
  } catch (e) {
    console.error('Failed to load home data:', e)
    uni.showToast({ title: '加载失败，请刷新', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onLoad(() => {
  loadData()
})

onShow(() => {
  // Refresh on show to catch any changes
  loadData()
})

onPullDownRefresh(() => {
  loadData().finally(() => {
    uni.stopPullDownRefresh()
  })
})
</script>

<style scoped lang="scss">
.home-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.section-title {
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  background: #fff;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 8px;
}

.loading-tip,
.empty-tip {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}
</style>