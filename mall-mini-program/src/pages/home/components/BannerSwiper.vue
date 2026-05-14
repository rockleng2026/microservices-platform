<template>
  <swiper
    class="banner-swiper"
    indicator-dots
    autoplay
    circular
    :interval="3000"
    :duration="500"
    @click="onBannerTap"
  >
    <swiper-item v-for="banner in banners" :key="banner.id" :data-index="$index">
      <image
        class="banner-image"
        :src="banner.imageUrl"
        mode="aspectFill"
        :placeholder="placeholderImage"
        @error="onImageError"
      />
    </swiper-item>
  </swiper>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  banners: {
    type: Array,
    default: () => []
  }
})

const placeholderImage = '/static/default.png'

const onBannerTap = (e) => {
  const currentIndex = e.detail.current
  const banner = props.banners[currentIndex]
  if (!banner) return

  if (banner.linkType === 1 && banner.goodsId) {
    uni.navigateTo({
      url: `/pages/product-detail/index?id=${banner.goodsId}`
    })
  } else if (banner.linkType === 2 && banner.externalUrl) {
    uni.navigateTo({
      url: `/pages/web-view/index?url=${encodeURIComponent(banner.externalUrl)}`
    })
  } else {
    uni.showToast({ title: '链接无效', icon: 'none' })
  }
}

const onImageError = (e) => {
  // Fallback to placeholder on error
  e.target.src = placeholderImage
}
</script>

<style scoped lang="scss">
.banner-swiper {
  height: 160px;
  width: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
}
</style>