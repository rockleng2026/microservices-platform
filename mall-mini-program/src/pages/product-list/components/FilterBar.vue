<template>
  <view class="filter-bar">
    <!-- 分类筛选区域 -->
    <view class="filter-section">
      <view class="section-header" @click="toggleCategoryCollapse">
        <text>分类</text>
        <text class="arrow" :class="{ down: categoryCollapsed }">›</text>
      </view>
      <view class="section-content" :class="{ collapsed: categoryCollapsed }">
        <scroll-view scroll-x class="category-scroll">
          <view class="category-list">
            <!-- 全部 -->
            <view
              class="category-tag"
              :class="{ active: selectedCategoryId === undefined }"
              @click="onCategorySelect(undefined)"
            >
              全部
            </view>
            <!-- 分类项 -->
            <view
              v-for="category in categories"
              :key="category.id"
              class="category-tag"
              :class="{ active: selectedCategoryId === category.id }"
              @click="onCategorySelect(category.id)"
            >
              {{ category.name }}
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 排序区域 -->
    <view class="sort-bar">
      <view
        v-for="item in sortOptions"
        :key="item.sortField"
        class="sort-item"
        :class="{
          active: selectedSort.sortField === item.sortField && selectedSort.sortOrder === item.sortOrder
        }"
        @click="onSortSelect(item)"
      >
        {{ item.label }}
      </view>
    </view>

    <!-- 搜索关键词显示 -->
    <view class="search-keyword" v-if="keyword">
      <text>搜索: {{ keyword }}</text>
      <text class="clear-btn" @click="onClearKeyword">×</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Category } from '@/services/home'

const props = defineProps<{
  categories: Category[]
  selectedCategoryId: number | undefined
  selectedSort: { sortField: string; sortOrder: string }
  keyword: string
}>()

const emit = defineEmits<{
  'filter-change': [categoryId: number | undefined]
  'sort-change': [sort: { sortField: string; sortOrder: string }]
}>()

// 分类折叠状态
const categoryCollapsed = ref(false)

// 排序选项
const sortOptions = [
  { label: '综合', sortField: 'createTime', sortOrder: 'desc' },
  { label: '价格最低', sortField: 'price', sortOrder: 'asc' },
  { label: '价格最高', sortField: 'price', sortOrder: 'desc' },
  { label: '销量优先', sortField: 'sales', sortOrder: 'desc' }
]

// 切换分类折叠状态
const toggleCategoryCollapse = () => {
  categoryCollapsed.value = !categoryCollapsed.value
}

// 分类选择
const onCategorySelect = (categoryId: number | undefined) => {
  emit('filter-change', categoryId)
}

// 排序选择
const onSortSelect = (item: { label: string; sortField: string; sortOrder: string }) => {
  emit('sort-change', { sortField: item.sortField, sortOrder: item.sortOrder })
}

// 清除搜索关键词
const onClearKeyword = () => {
  emit('filter-change', props.selectedCategoryId)
}
</script>

<style scoped lang="scss">
.filter-bar {
  position: sticky;
  top: 0;
  z-index: 99;
  background: #fff;

  .filter-section {
    .section-header {
      display: flex;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      text {
        font-size: 14px;
        color: #333;
      }
      .arrow {
        transition: transform 0.3s;
        font-size: 16px;
        color: #999;
      }
      .arrow.down {
        transform: rotate(90deg);
      }
    }

    .section-content {
      padding: 12px 16px;
      &.collapsed {
        display: none;
      }
    }

    .category-scroll {
      white-space: nowrap;
    }

    .category-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .category-tag {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 16px;
        background: #f5f5f5;
        font-size: 13px;
        color: #333;

        &.active {
          background: #ff5500;
          color: #fff;
        }
      }
    }
  }

  .sort-bar {
    display: flex;
    justify-content: space-around;
    padding: 12px 16px;
    border-top: 1px solid #f0f0f0;

    .sort-item {
      font-size: 14px;
      color: #666;
      padding: 4px 8px;

      &.active {
        color: #ff5500;
        font-weight: 600;
      }
    }
  }

  .search-keyword {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: #fff0e6;
    font-size: 13px;
    color: #ff5500;

    .clear-btn {
      font-size: 18px;
      color: #999;
      padding: 0 4px;
    }
  }
}
</style>
