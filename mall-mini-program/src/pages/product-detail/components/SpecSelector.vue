<template>
  <!-- SKU维度完全不同，直接列出每个SKU -->
  <view class="sku-list" v-if="!sameSpecKeys">
    <view class="sku-item" v-for="sku in validSkus" :key="sku.id"
      :class="{ selected: selectedSkuId === sku.id }"
      @click="selectSkuItem(sku)">
      <view class="sku-specs">{{ formatSkuSpecs(sku) }}</view>
      <view class="sku-right">
        <text class="sku-price">¥{{ sku.price }}</text>
        <text class="sku-stock">{{ sku.stock > 0 ? '有货' : '无货' }}</text>
      </view>
    </view>
  </view>

  <!-- SKU规格维度相同，按规格组展示 -->
  <view class="spec-selector" v-else>
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
  initialSkuId?: number | null
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

// 解析 SKU specs（支持字符串格式和 JSON字符串/对象格式）
const parseSpecs = (specs: any): Record<string, string> => {
  if (!specs) return {}
  // 如果是字符串，尝试解析为 JSON 对象
  if (typeof specs === 'string') {
    try {
      specs = JSON.parse(specs)
    } catch {
      // 不是 JSON，尝试字符串格式 "颜色:黑色;内存:256GB"
      const result: Record<string, string> = {}
      const parts = specs.split(';')
      for (const part of parts) {
        const idx = part.indexOf(':')
        if (idx > 0) {
          const name = part.substring(0, idx).trim()
          const value = part.substring(idx + 1).trim()
          if (name && value) result[name] = value
        }
      }
      return result
    }
  }
  // 现在应该是纯 JSON 对象
  if (typeof specs === 'object' && specs !== null) {
    return specs
  }
  return {}
}

// 格式化单个SKU的规格为易读字符串
const formatSkuSpecs = (sku: MallGoodsSku): string => {
  const specMap = parseSpecs(sku.specs)
  return Object.entries(specMap).map(([k, v]) => `${k}: ${v}`).join(' | ')
}

// 当前选中的规格组
const specGroups = ref<SpecGroup[]>([])

// 当前选中的 SKU ID（SKU列表模式）
const selectedSkuId = ref<number | null>(null)

// 过滤出有效的SKU
const validSkus = computed(() => props.skus.filter(s => s.status === 1 && s.stock > 0))

// 判断所有SKU的规格key是否完全相同（用于决定展示模式）
const sameSpecKeys = computed(() => {
  if (validSkus.value.length <= 1) return true
  const firstKeys = Object.keys(parseSpecs(validSkus.value[0].specs)).sort()
  return validSkus.value.every(sku => {
    const keys = Object.keys(parseSpecs(sku.specs)).sort()
    return keys.length === firstKeys.length && keys.every((k, i) => k === firstKeys[i])
  })
})

// 解析 SKU specs 字符串，构建规格组（仅在规格维度相同时使用）
const parseSpecGroups = (): SpecGroup[] => {
  const groups: Map<string, Set<string>> = new Map()

  for (const sku of props.skus) {
    const specMap = parseSpecs(sku.specs)
    for (const [name, value] of Object.entries(specMap)) {
      if (!groups.has(name)) {
        groups.set(name, new Set())
      }
      groups.get(name)!.add(value)
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

// 根据当前选中的规格查找匹配的 SKU
const findMatchedSku = (): MallGoodsSku | null => {
  if (specGroups.value.length === 0) return null

  // 构建当前选择的规格
  const selectedSpecs: Record<string, string> = {}
  for (const group of specGroups.value) {
    if (!group.selected) return null
    selectedSpecs[group.name] = group.selected
  }

  // 遍历 SKU 找到匹配项
  for (const sku of props.skus) {
    if (sku.status !== 1) continue
    const specMap = parseSpecs(sku.specs)
    let matchCount = 0
    for (const [name, value] of Object.entries(specMap)) {
      if (selectedSpecs[name] === value) {
        matchCount++
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
    if (sku.status !== 1) continue
    const specMap = parseSpecs(sku.specs)
    let matchCount = 0
    for (const [name, value] of Object.entries(specMap)) {
      if (tempSelected[name] === value) {
        matchCount++
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
    } else {
      // 没有精确匹配时，尝试找一个有库存的SKU作为候补
      const fallbackSku = props.skus.find(s => s.status === 1 && s.stock > 0)
      if (fallbackSku) {
        emit('select', fallbackSku)
      }
    }
  }
}

// 选择单个SKU项（SKU列表模式）
const selectSkuItem = (sku: MallGoodsSku) => {
  selectedSkuId.value = sku.id
  emit('select', sku)
}

// 初始化规格组
watch(
  () => props.skus,
  (newSkus) => {
    if (newSkus && newSkus.length > 0) {
      // 如果传入了初始 SKU ID，直接选中该 SKU 并设置规格组
      if (props.initialSkuId) {
        const targetSku = newSkus.find((s: MallGoodsSku) => s.id === props.initialSkuId)
        if (targetSku) {
          selectedSkuId.value = targetSku.id

          // 如果是规格组模式（sameSpecKeys=true），需要同步设置 specGroups 的选中值
          const firstKeys = Object.keys(parseSpecs(newSkus[0].specs)).sort()
          const skuKeys = Object.keys(parseSpecs(targetSku.specs)).sort()
          const sameKeys = skuKeys.length === firstKeys.length && skuKeys.every((k, i) => k === firstKeys[i])

          if (sameKeys) {
            const targetSpecMap = parseSpecs(targetSku.specs)
            specGroups.value = parseSpecGroups()
            // 用目标 SKU 的规格值覆盖默认选择
            for (const group of specGroups.value) {
              if (targetSpecMap[group.name]) {
                group.selected = targetSpecMap[group.name]
              }
            }
          }

          emit('select', targetSku)
          return
        }
      }

      specGroups.value = parseSpecGroups()
      selectedSkuId.value = null
      // 触发首次选择的 SKU
      const matchedSku = findMatchedSku()
      if (matchedSku) {
        emit('select', matchedSku)
      } else {
        // 没有精确匹配时，尝试找一个有库存的SKU作为候补
        const fallbackSku = newSkus.find((s: MallGoodsSku) => s.status === 1 && s.stock > 0)
        if (fallbackSku) {
          emit('select', fallbackSku)
        }
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

.sku-list {
  padding: 16px;
  background: #fff;
  margin-bottom: 8px;
}

.sku-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #fff;

  &.selected {
    border-color: #ff5500;
    background: #fff5f0;
  }

  .sku-specs {
    flex: 1;
    font-size: 13px;
    color: #333;
    line-height: 1.4;
  }

  .sku-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .sku-price {
    font-size: 14px;
    color: #ff5500;
    font-weight: 600;
  }

  .sku-stock {
    font-size: 12px;
    color: #999;
  }
}
</style>
