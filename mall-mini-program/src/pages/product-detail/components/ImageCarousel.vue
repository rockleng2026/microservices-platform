<template>
  <view class="image-carousel">
    <swiper
      class="carousel-swiper"
      :indicator-dots="true"
      :autoplay="false"
      :circular="true"
      :previous-margin="'0px'"
      :next-margin="'0px'"
      indicator-active-color="#ffffff"
      indicator-color="rgba(255,255,255,0.5)"
    >
      <swiper-item v-for="(image, index) in images" :key="index">
        <image
          class="carousel-image"
          :src="image"
          mode="widthFix"
          :lazy-load="true"
          @error="onImageError(index)"
        />
      </swiper-item>
    </swiper>

    <!-- 加载占位 -->
    <view class="placeholder" v-if="images.length === 0">
      <text>图片加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  images: string[]
}>()

// 处理图片加载失败
const onImageError = (index: number) => {
  console.error(`图片 ${index} 加载失败`)
}
</script>

<style scoped lang="scss">
.image-carousel {
  height: 300px;
  width: 100%;
  background: #f0f0f0;
  position: relative;

  .carousel-swiper {
    height: 100%;
    width: 100%;

    swiper {
      height: 100%;
    }

    .carousel-image {
      width: 100%;
      height: 300px;
      display: block;
    }
  }

  .placeholder {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;

    text {
      font-size: 14px;
      color: #999;
    }
  }
}
</style>
