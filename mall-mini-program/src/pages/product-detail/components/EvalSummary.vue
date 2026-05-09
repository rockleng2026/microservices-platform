<template>
  <view class="eval-summary" @click="goToEvalList">
    <view class="eval-info" v-if="totalCount > 0">
      <text class="score">{{ averageStar }}</text>
      <text class="count">{{ totalCount }}条评价</text>
    </view>
    <view class="eval-info" v-else>
      <text class="count">暂无评价</text>
    </view>
    <view class="arrow" v-if="totalCount > 0">
      <text>></text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getEvaluateList } from '@/services/goods'
import type { EvaluateDTO } from '@/services/goods'

const props = defineProps<{
  goodsId: number
}>()

// 评价列表
const evaluations = ref<EvaluateDTO[]>([])

// 总评价数
const totalCount = ref(0)

// 平均评分
const averageStar = computed(() => {
  if (evaluations.value.length === 0) return '0.0'
  const sum = evaluations.value.reduce((acc, e) => acc + e.star, 0)
  return (sum / evaluations.value.length).toFixed(1)
})

// 跳转到评价列表页面
const goToEvalList = () => {
  uni.navigateTo({
    url: `/pages/evaluate-list/index?goodsId=${props.goodsId}`
  })
}

// 加载评价摘要
onMounted(async () => {
  try {
    const result = await getEvaluateList(props.goodsId, 1, 10)
    evaluations.value = result.datas || []
    totalCount.value = result.total || 0
  } catch (e) {
    console.error('加载评价摘要失败', e)
    totalCount.value = 0
  }
})
</script>

<style scoped lang="scss">
.eval-summary {
  padding: 16px;
  background: #fff;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .eval-info {
    display: flex;
    align-items: center;

    .score {
      color: #ff5500;
      font-size: 18px;
      font-weight: bold;
    }

    .count {
      color: #999;
      font-size: 14px;
      margin-left: 8px;
    }
  }

  .arrow {
    color: #999;
    font-size: 14px;
  }

  &:active {
    background: #f5f5f5;
  }
}
</style>
