<template>
  <view class="search-bar">
    <view class="search-box">
      <input
        v-model="keyword"
        type="text"
        placeholder="搜索商品..."
        confirm-type="search"
        @confirm="onSearch"
        @focus="onFocus"
        @blur="onBlur"
      />
      <button @tap="onSearch">搜索</button>
    </view>
    <view v-if="showHistory" class="search-history">
      <view class="history-header">
        <text class="history-title">搜索历史</text>
        <text class="clear-btn" @tap="clearHistory">清除</text>
      </view>
      <view class="history-list">
        <text
          v-for="(item, index) in historyList"
          :key="index"
          class="history-item"
          @tap="onHistoryTap(item)"
        >{{ item }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const keyword = ref('')
const showHistory = ref(false)
const historyList = ref([])

const loadHistory = () => {
  try {
    const history = uni.getStorageSync('searchHistory')
    historyList.value = history ? JSON.parse(history) : []
  } catch {
    historyList.value = []
  }
}

const saveHistory = (kw) => {
  if (!kw) return
  const list = historyList.value.filter(h => h !== kw)
  list.unshift(kw)
  historyList.value = list.slice(0, 10)
  uni.setStorageSync('searchHistory', JSON.stringify(historyList.value))
}

const clearHistory = () => {
  historyList.value = []
  uni.removeStorageSync('searchHistory')
  showHistory.value = false
}

const onSearch = () => {
  const kw = keyword.value.trim()
  if (!kw) {
    uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
    return
  }
  saveHistory(kw)
  showHistory.value = false
  uni.navigateTo({
    url: `/pages/product-list/index?keyword=${encodeURIComponent(kw)}`
  })
}

const onHistoryTap = (kw) => {
  keyword.value = kw
  showHistory.value = false
  uni.navigateTo({
    url: `/pages/product-list/index?keyword=${encodeURIComponent(kw)}`
  })
}

const onFocus = () => {
  if (historyList.value.length > 0) {
    showHistory.value = true
  }
}

const onBlur = () => {
  setTimeout(() => {
    showHistory.value = false
  }, 200)
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="scss">
.search-bar {
  position: sticky;
  top: 0;
  z-index: 99;
  background: #fff;
  padding: 8px 16px;

  .search-box {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 16px;
    padding: 0 12px;
    height: 32px;

    input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 14px;
    }

    button {
      border: none;
      background: transparent;
      color: #999;
      padding: 0;
      font-size: 14px;
    }
  }
}

.search-history {
  background: #fff;
  padding: 8px 16px;
  border-top: 1px solid #f5f5f5;

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .history-title {
      font-size: 12px;
      color: #999;
    }

    .clear-btn {
      font-size: 12px;
      color: #ff5500;
    }
  }

  .history-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .history-item {
      padding: 4px 12px;
      background: #f5f5f5;
      border-radius: 12px;
      font-size: 13px;
      color: #666;
    }
  }
}
</style>