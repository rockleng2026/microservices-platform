<template>
  <view class="quantity-stepper">
    <text class="label">购买数量</text>
    <view class="stepper">
      <view
        class="btn"
        :class="{ disabled: modelValue <= 1 || stock <= 0 }"
        @click="decrease"
      >
        <text>-</text>
      </view>
      <view class="num">
        <text>{{ modelValue }}</text>
      </view>
      <view
        class="btn"
        :class="{ disabled: modelValue >= stock || stock <= 0 }"
        @click="increase"
      >
        <text>+</text>
      </view>
    </view>
    <!-- 无货提示 -->
    <text class="out-tip" v-if="stock <= 0">无货</text>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  stock: number
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

// 减少数量
const decrease = () => {
  if (props.modelValue > 1 && props.stock > 0) {
    emit('update:modelValue', props.modelValue - 1)
  }
}

// 增加数量
const increase = () => {
  if (props.modelValue < props.stock && props.stock > 0) {
    emit('update:modelValue', props.modelValue + 1)
  }
}
</script>

<style scoped lang="scss">
.quantity-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #fff;
  margin-bottom: 8px;

  .label {
    font-size: 14px;
    color: #333;
  }

  .stepper {
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;

    .btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      font-size: 16px;
      color: #666;

      &.disabled {
        opacity: 0.3;
      }

      &:active:not(.disabled) {
        background: #e5e5e5;
      }
    }

    .num {
      width: 40px;
      text-align: center;
      font-size: 14px;
      color: #333;
      border-left: 1px solid #ddd;
      border-right: 1px solid #ddd;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .out-tip {
    font-size: 12px;
    color: #ff4d4f;
  }
}
</style>
