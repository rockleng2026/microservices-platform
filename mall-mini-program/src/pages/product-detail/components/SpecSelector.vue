<template>
  <view class="spec-selector">
    <view class="spec-group" v-for="group in specGroups" :key="group.name">
      <view class="spec-name">{{ group.name }}</view>
      <view class="spec-options">
        <view
          v-for="option in group.options"
          :key="option"
          class="spec-btn"
          :class="{
            selected: group.selected === option,
            disabled: isOptionDisabled(group.name, option)
          }"
          @click="selectOption(group.name, option)"
        >
          {{ option }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { MallGoodsSku } from '@/services/goods'

const props = defineProps<{
  skus: MallGoodsSku[]
}>()

const emit = defineEmits<{
  select: [sku: MallGoodsSku]
}>()

// 规格组结构
interface SpecGroup {
  name: string
  options: string[]
  selected: string
}

// 解析 SKU specs 字符串，构建规格组
const parseSpecGroups = (): SpecGroup[] => {
  const groups: Map<string, Set<string>> = new Map()

  for (const sku of props.skus) {
    if (!sku.specs) continue
    // specs 格式: "颜色:黑色;内存:256GB"
    const parts = sku.specs.split(';')
    for (const part of parts) {
      const [name, value] = part.split(':')
      if (name && value) {
        const trimmedName = name.trim()
        const trimmedValue = value.trim()
        if (!groups.has(trimmedName)) {
          groups.set(trimmedName, new Set())
        }
        groups.get(trimmedName)!.add(trimmedValue)
      }
    }
  }

  // 转换为数组，默认选择第一个选项
  const result: SpecGroup[] = []
  groups.forEach((options, name) => {
    result.push({
      name,
      options: Array.from(options),
      selected: ''
    })
  })

  // 默认选中每个规格的第一个选项
  for (const group of result) {
    if (group.options.length > 0) {
      group.selected = group.options[0]
    }
  }

  return result
}

// 当前选中的规格组
const specGroups = ref<SpecGroup[]>([])

// 根据当前选中的规格查找匹配的 SKU
const findMatchedSku = (): MallGoodsSku | null => {
  if (specGroups.value.length === 0) return null

  // 构建当前选择的规格字符串
  const selectedSpecs: Record<string, string> = {}
  for (const group of specGroups.value) {
    if (!group.selected) return null
    selectedSpecs[group.name] = group.selected
  }

  // 遍历 SKU 找到匹配项
  for (const sku of props.skus) {
    if (!sku.specs || sku.status !== 1) continue
    const parts = sku.specs.split(';')
    let matchCount = 0
    for (const part of parts) {
      const [name, value] = part.split(':')
      if (name && value) {
        const trimmedName = name.trim()
        const trimmedValue = value.trim()
        if (selectedSpecs[trimmedName] === trimmedValue) {
          matchCount++
        }
      }
    }
    if (matchCount === specGroups.value.length) {
      return sku
    }
  }

  return null
}

// 检查某选项是否应该禁用（当前组合不存在对应 SKU）
const isOptionDisabled = (groupName: string, option: string): boolean => {
  // 构建临时选择
  const tempSelected: Record<string, string> = {}
  for (const group of specGroups.value) {
    if (group.name === groupName) {
      tempSelected[group.name] = option
    } else {
      tempSelected[group.name] = group.selected
    }
  }

  // 检查是否存在匹配 SKU 且有库存
  for (const sku of props.skus) {
    if (!sku.specs || sku.status !== 1) continue
    const parts = sku.specs.split(';')
    let matchCount = 0
    for (const part of parts) {
      const [name, value] = part.split(':')
      if (name && value) {
        const trimmedName = name.trim()
        const trimmedValue = value.trim()
        if (tempSelected[trimmedName] === trimmedValue) {
          matchCount++
        }
      }
    }
    if (matchCount === specGroups.value.length && sku.stock > 0) {
      return false
    }
  }

  return true
}

// 选择某规格选项
const selectOption = (groupName: string, option: string) => {
  const group = specGroups.value.find(g => g.name === groupName)
  if (group) {
    group.selected = option
    const matchedSku = findMatchedSku()
    if (matchedSku) {
      emit('select', matchedSku)
    }
  }
}

// 初始化规格组
watch(
  () => props.skus,
  (newSkus) => {
    if (newSkus && newSkus.length > 0) {
      specGroups.value = parseSpecGroups()
      // 触发首次选择的 SKU
      const matchedSku = findMatchedSku()
      if (matchedSku) {
        emit('select', matchedSku)
      }
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.spec-selector {
  padding: 16px;
  background: #fff;
  margin-bottom: 8px;

  .spec-group {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .spec-name {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .spec-options {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .spec-btn {
        padding: 6px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 13px;
        color: #333;
        background: #fff;
        min-width: 44px;
        text-align: center;

        &.selected {
          border-color: #ff5500;
          color: #ff5500;
          background: #fff5f0;
        }

        &.disabled {
          opacity: 0.4;
          pointer-events: none;
        }
      }
    }
  }
}
</style>
