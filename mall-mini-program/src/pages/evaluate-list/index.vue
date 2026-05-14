<template>
  <view class="evaluate-list-page">
    <!-- Header -->
    <view class="header">
      <text class="title">商品评价</text>
      <text class="count">共 {{ total }} 条评价</text>
    </view>

    <!-- Evaluate List -->
    <scroll-view
      class="evaluate-scroll"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onPullDownRefresh"
      @scrolltolower="onScrollToLower"
    >
      <!-- Loading -->
      <view v-if="isLoading && evaluations.length === 0" class="loading-state">
        <text>加载中...</text>
      </view>

      <!-- Empty -->
      <view v-else-if="evaluations.length === 0" class="empty-state">
        <text>暂无评价</text>
      </view>

      <!-- Evaluate Cards -->
      <view
        v-else
        v-for="item in evaluations"
        :key="item.id"
        class="eval-card"
      >
        <view class="eval-header">
          <view class="user-info">
            <view class="avatar">
              <text>{{ (item.userNickname || '匿名').slice(0, 1) }}</text>
            </view>
            <text class="nickname">{{ item.userNickname || '匿名用户' }}</text>
          </view>
          <view class="star-row">
            <text v-for="n in 5" :key="n" :class="['star', { active: n <= item.star }]">★</text>
          </view>
        </view>
        <view class="eval-content">{{ item.content || '该用户未填写评价内容' }}</view>
        <view class="eval-images" v-if="item.images?.length">
          <image
            v-for="(img, idx) in item.images"
            :key="idx"
            :src="img"
            class="eval-img"
            mode="aspectFill"
            @click="previewImage(idx)"
          />
        </view>
        <view class="eval-time">{{ formatTime(item.createTime) }}</view>
      </view>

      <!-- Load More -->
      <view v-if="hasMore && evaluations.length > 0" class="load-more" @click="loadMore">
        <text>{{ isLoadingMore ? '加载中...' : '加载更多' }}</text>
      </view>
      <view v-else-if="evaluations.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>

      <view style="height: 20px"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getEvaluateList } from '@/services/goods'
import type { EvaluateDTO } from '@/services/goods'

const goodsId = ref<number>(0)
const evaluations = ref<EvaluateDTO[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const isLoading = ref(false)
const isRefreshing = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(true)

const loadEvaluations = async (reset = false) => {
  if (reset) {
    page.value = 1
    hasMore.value = true
  }
  if (isLoading.value) return
  isLoading.value = true

  try {
    const res: any = await getEvaluateList(goodsId.value, page.value, pageSize)
    const records = res?.records || res || []
    const count = res?.total || 0

    if (reset) {
      evaluations.value = records
    } else {
      evaluations.value = [...evaluations.value, ...records]
    }
    total.value = count
    hasMore.value = evaluations.value.length < count
  } catch (e) {
    console.error('加载评价失败', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    isLoading.value = false
    isRefreshing.value = false
    isLoadingMore.value = false
  }
}

const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

const previewImage = (index: number) => {
  const urls = evaluations.value.flatMap(e => e.images || [])
  uni.previewImage({ urls, current: index })
}

const onPullDownRefresh = async () => {
  isRefreshing.value = true
  page.value = 1
  await loadEvaluations(true)
  uni.stopPullDownRefresh()
}

const onScrollToLower = () => {
  if (!hasMore.value || isLoadingMore.value || isLoading.value) return
  isLoadingMore.value = true
  page.value++
  loadEvaluations(false)
}

const loadMore = () => {
  if (!hasMore.value || isLoadingMore.value || isLoading.value) return
  isLoadingMore.value = true
  page.value++
  loadEvaluations(false)
}

onLoad((options: any) => {
  if (options.goodsId) {
    goodsId.value = Number(options.goodsId)
    loadEvaluations(true)
  }
})
</script>

<style scoped lang="scss">
.evaluate-list-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.header {
  background: #fff;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;

  .title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .count {
    font-size: 13px;
    color: #999;
  }
}

.evaluate-scroll {
  flex: 1;
  height: calc(100vh - 60px);
}

.loading-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #999;
}

.eval-card {
  background: #fff;
  margin: 8px;
  padding: 16px;
  border-radius: 8px;

  .eval-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .avatar {
      width: 32px;
      height: 32px;
      background: #ff5500;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      text {
        color: #fff;
        font-size: 14px;
        font-weight: 600;
      }
    }

    .nickname {
      font-size: 14px;
      color: #333;
    }
  }

  .star-row {
    display: flex;
    gap: 2px;

    .star {
      font-size: 14px;
      color: #ddd;

      &.active {
        color: #ff5500;
      }
    }
  }

  .eval-content {
    font-size: 14px;
    color: #333;
    line-height: 1.6;
    margin-bottom: 10px;
  }

  .eval-images {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;

    .eval-img {
      width: 80px;
      height: 80px;
      border-radius: 4px;
    }
  }

  .eval-time {
    font-size: 12px;
    color: #999;
  }
}

.load-more,
.no-more {
  text-align: center;
  padding: 16px;
  color: #999;
  font-size: 13px;
}
</style>