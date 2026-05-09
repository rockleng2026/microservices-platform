<template>
  <view class="category-grid">
    <view
      v-for="category in displayCategories"
      :key="category.id"
      class="category-item"
      @tap="onCategoryTap(category)"
    >
      <view class="category-icon">
        <text v-if="category.icon && category.icon.startsWith('http')">🖼️</text>
        <text v-else>{{ getCategoryEmoji(category.id) }}</text>
      </view>
      <text class="category-name">{{ category.name }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  }
})

const displayCategories = computed(() => {
  return props.categories.slice(0, 8)
})

const getCategoryEmoji = (id) => {
  const emojis = ['📦', '💻', '🖥️', '🧰', '🔧', '⚙️', '📱', '🎮']
  return emojis[id % emojis.length]
}

const onCategoryTap = (category) => {
  uni.navigateTo({
    url: `/pages/product-list/index?categoryId=${category.id}`
  })
}
</script>

<style scoped lang="scss">
.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 16px;
  background: #fff;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;

  .category-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .category-name {
    margin-top: 8px;
    font-size: 12px;
    color: #666;
    max-width: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>