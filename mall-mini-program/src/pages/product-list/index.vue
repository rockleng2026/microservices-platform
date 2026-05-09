<template>
  <view class="product-list-page">
    <!-- 筛选栏 -->
    <FilterBar
      :categories="categories"
      :selectedCategoryId="selectedCategoryId"
      :selectedSort="selectedSort"
      :keyword="keyword"
      @filter-change="onFilterChange"
      @sort-change="onSortChange"
    />

    <!-- 商品列表 -->
    <view class="product-list">
      <view class="product-grid">
        <ProductItem
          v-for="item in products"
          :key="item.id"
          :product="item"
          @click="goDetail(item.id)"
        />
      </view>

      <!-- 加载中 -->
      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>

      <!-- 没有更多了 -->
      <view class="no-more" v-if="noMore && products.length > 0">
        <text>没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-if="!loading && products.length === 0">
        <text>暂无商品</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FilterBar from './components/FilterBar.vue'
import ProductItem from './components/ProductItem.vue'
import { getGoodsList } from '@/services/goods'
import { getCategories } from '@/services/home'
import type { MallGoods } from '@/services/home'
import type { Category } from '@/services/home'

// 分类列表
const categories = ref<Category[]>([])

// 选中的分类ID
const selectedCategoryId = ref<number | undefined>(undefined)

// 选中的排序
const selectedSort = ref<{ sortField: string; sortOrder: string }>({
  sortField: 'createTime',
  sortOrder: 'desc'
})

// 搜索关键词
const keyword = ref<string>('')

// 商品列表
const products = ref<MallGoods[]>([])

// 分页
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 状态
const loading = ref(false)
const noMore = ref(false)

// 跳转到商品详情
const goDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages/product-detail/index?id=${id}`
  })
}

// 加载商品列表
const loadGoodsList = async (reset = false) => {
  if (loading.value) return

  if (reset) {
    page.value = 1
    products.value = []
    noMore.value = false
  }

  loading.value = true

  try {
    const result = await getGoodsList({
      page: page.value,
      pageSize: pageSize.value,
      categoryId: selectedCategoryId.value,
      keyword: keyword.value || undefined,
      sortField: selectedSort.value.sortField,
      sortOrder: selectedSort.value.sortOrder
    })

    if (reset) {
      products.value = result.datas || []
    } else {
      products.value = [...products.value, ...(result.datas || [])]
    }

    total.value = result.total || 0

    // 判断是否还有更多
    noMore.value = products.value.length >= total.value
  } catch (error) {
    console.error('加载商品列表失败', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 分类筛选变化
const onFilterChange = (categoryId: number | undefined) => {
  selectedCategoryId.value = categoryId
  loadGoodsList(true)
}

// 排序变化
const onSortChange = (sort: { sortField: string; sortOrder: string }) => {
  selectedSort.value = sort
  loadGoodsList(true)
}

// 页面加载
onLoad((options: any) => {
  // 获取参数
  if (options.categoryId) {
    selectedCategoryId.value = Number(options.categoryId)
  }
  if (options.keyword) {
    keyword.value = decodeURIComponent(options.keyword)
  }

  // 加载分类
  getCategories().then(res => {
    categories.value = (res || []).filter((c: Category) => c.parentId === 0)
  })

  // 加载商品
  loadGoodsList(true)
})

// 触底加载更多
onReachBottom(() => {
  if (!noMore.value && !loading.value) {
    page.value++
    loadGoodsList(false)
  }
})

// 下拉刷新
onPullDownRefresh(() => {
  loadGoodsList(true).then(() => {
    uni.stopPullDownRefresh()
  })
})
</script>

<style scoped lang="scss">
.product-list-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.product-list {
  padding: 8px;
  padding-bottom: 16px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.loading,
.no-more {
  text-align: center;
  padding: 16px;
  color: #999;
  font-size: 14px;
}

.empty {
  text-align: center;
  padding: 100px 0;
  color: #999;
  font-size: 14px;
}
</style>
