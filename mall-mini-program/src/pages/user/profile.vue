<template>
  <view class="profile-page">
    <view class="profile-header">
      <text class="title">编辑资料</text>
    </view>

    <view class="profile-form">
      <!-- Avatar -->
      <view class="form-item avatar-item">
        <text class="label">头像</text>
        <view class="avatar-row">
          <image
            class="avatar-img"
            :src="getAvatarSrc()"
            mode="aspectFill"
          />
          <view class="avatar-actions">
            <button class="change-avatar-btn" @click="chooseAvatar">更换头像</button>
            <text class="avatar-tip">支持jpg、png格式</text>
          </view>
        </view>
      </view>

      <!-- Nickname -->
      <view class="form-item">
        <text class="label">昵称</text>
        <input
          v-model="nickname"
          class="input"
          type="text"
          maxlength="20"
          placeholder="请输入昵称"
          placeholder-class="placeholder"
        />
      </view>

      <!-- Gender -->
      <view class="form-item">
        <text class="label">性别</text>
        <view class="gender-select">
          <view
            class="gender-option"
            :class="{ active: gender === 1 }"
            @click="gender = 1"
          >
            <text>男</text>
          </view>
          <view
            class="gender-option"
            :class="{ active: gender === 2 }"
            @click="gender = 2"
          >
            <text>女</text>
          </view>
          <view
            class="gender-option"
            :class="{ active: gender === 0 }"
            @click="gender = 0"
          >
            <text>未知</text>
          </view>
        </view>
      </view>

      <!-- Birthday -->
      <view class="form-item">
        <text class="label">生日</text>
        <picker mode="date" :value="birthday" @change="onBirthdayChange">
          <view class="input birthday-input">
            <text :class="{ placeholder: !birthday }">
              {{ birthday || '请选择生日' }}
            </text>
          </view>
        </picker>
      </view>

      <!-- Phone (read-only) -->
      <view class="form-item">
        <text class="label">手机号</text>
        <view class="input phone-input" v-if="phone">
          <text class="phone-text">{{ phone }}</text>
        </view>
        <button class="bind-phone-btn" v-else @click="bindPhone">绑定手机</button>
      </view>

      <!-- Province/City -->
      <view class="form-item">
        <text class="label">所在地区</text>
        <view class="region-row">
          <picker
            mode="region"
            :value="region"
            @change="onRegionChange"
          >
            <view class="input region-input">
              <text :class="{ placeholder: !regionText }">
                {{ regionText || '请选择地区' }}
              </text>
            </view>
          </picker>
        </view>
      </view>

      <button class="save-btn" :loading="loading" @click="handleSave">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getLocalUserInfo, updateProfile } from '@/services/user'
import { getFullImageUrl, DEFAULT_AVATAR_DATAURI } from '@/utils/helpers'

const nickname = ref('')
const avatar = ref('')
const avatarPreview = ref('')
const gender = ref(0)
const birthday = ref('')
const phone = ref('')
const region = ref([])
const regionText = ref('')
const loading = ref(false)

// Helper to get avatar with fallback to data URI default avatar
const getAvatarSrc = () => {
  const src = avatarPreview.value || avatar.value
  if (!src) {
    return DEFAULT_AVATAR_DATAURI
  }
  if (src.startsWith('data:') || src.startsWith('http') || src.startsWith('//')) {
    return src
  }
  // If it's a local static resource, return as-is
  if (src.startsWith('/static/')) {
    return src
  }
  // Otherwise use file server to get full URL
  if (src.startsWith('/')) {
    return getFullImageUrl(src)
  }
  return src
}

// Load current user info
onLoad(() => {
  const userInfo = getLocalUserInfo()
  if (userInfo) {
    nickname.value = userInfo.nickname || ''
    avatarPreview.value = userInfo.avatar || ''
    avatar.value = userInfo.avatar || ''
    gender.value = userInfo.gender || 0
    birthday.value = userInfo.birthday || ''
    phone.value = userInfo.phone || ''
    // 加载地区信息（兼容新旧格式）
    if (userInfo.province) {
      if (userInfo.province.includes(' ')) {
        // 旧格式 "省 市 区"
        const parts = userInfo.province.split(' ').filter(Boolean)
        region.value = parts
        regionText.value = userInfo.province
      } else {
        // 新格式分别存储
        region.value = [userInfo.province, userInfo.city || '']
        regionText.value = userInfo.province + (userInfo.city ? ' ' + userInfo.city : '')
      }
    }
  }
})

// Choose avatar
const chooseAvatar = () => {
  // #ifdef H5
  // H5环境下使用文件选择
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album'],
    success: (res) => {
      const tempFile = res.tempFilePaths[0]
      avatarPreview.value = tempFile
      // TODO: 上传到服务器获取URL
      avatar.value = tempFile
    }
  })
  // #endif
  // #ifndef H5
  // 小程序环境直接拍照或选择
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      const tempFile = res.tempFilePaths[0]
      avatarPreview.value = tempFile
      avatar.value = tempFile
    }
  })
  // #endif
}

// Birthday change
const onBirthdayChange = (e) => {
  birthday.value = e.detail.value
}

// Region change
const onRegionChange = (e) => {
  region.value = e.detail.value
  regionText.value = e.detail.value.join(' ')
}

// Bind phone
const bindPhone = () => {
  // #ifdef H5
  uni.showToast({ title: '请在微信中绑定手机号', icon: 'none' })
  // #endif
  // #ifndef H5
  // 小程序环境可以调用手机号绑定组件
  uni.showToast({ title: '绑定功能开发中', icon: 'none' })
  // #endif
}

// Save profile
const handleSave = async () => {
  if (!nickname.value.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  loading.value = true
  try {
    // Save to local storage (in real app, call API)
    const userInfo = {
      ...uni.getStorageSync('userInfo'),
      nickname: nickname.value,
      avatar: avatar.value,
      gender: gender.value,
      birthday: birthday.value,
      region: regionText.value
    }
    uni.setStorageSync('userInfo', userInfo)

    await updateProfile({
      nickname: nickname.value,
      avatar: avatar.value,
      gender: gender.value,
      birthday: birthday.value,
      province: region.value[0] || '',
      city: region.value[1] || ''
    })

    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (e) {
    console.error('Save profile failed:', e)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.profile-header {
  background: #fff;
  padding: 40rpx 30rpx;
  text-align: center;

  .title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
  }
}

.profile-form {
  background: #fff;
  margin-top: 20rpx;
  padding: 0 30rpx;
}

.form-item {
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  .label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;
    font-weight: 500;
  }

  .input {
    height: 80rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    display: flex;
    align-items: center;
    box-sizing: border-box;

    .placeholder {
      color: #999;
    }
  }
}

.avatar-item {
  .avatar-row {
    display: flex;
    align-items: center;
    gap: 30rpx;
  }

  .avatar-img {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    background: #eee;
  }

  .avatar-actions {
    flex: 1;
  }

  .change-avatar-btn {
    display: inline-block;
    padding: 12rpx 32rpx;
    background: #fff;
    color: #ff5500;
    font-size: 26rpx;
    border: 2rpx solid #ff5500;
    border-radius: 8rpx;

    &::after {
      border: none;
    }
  }

  .avatar-tip {
    display: block;
    font-size: 22rpx;
    color: #999;
    margin-top: 12rpx;
  }
}

.gender-select {
  display: flex;
  gap: 30rpx;

  .gender-option {
    width: 120rpx;
    height: 70rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #666;

    &.active {
      background: #fff0eb;
      color: #ff5500;
      border: 2rpx solid #ff5500;
    }
  }
}

.birthday-input {
  .placeholder {
    color: #999;
  }
}

.phone-input {
  background: #f5f5f5;
  color: #999;

  .phone-text {
    color: #666;
  }
}

.bind-phone-btn {
  display: inline-block;
  padding: 12rpx 32rpx;
  background: #fff;
  color: #ff5500;
  font-size: 26rpx;
  border: 2rpx solid #ff5500;
  border-radius: 8rpx;

  &::after {
    border: none;
  }
}

.region-input {
  .placeholder {
    color: #999;
  }
}

.save-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #ff5500 0%, #ff7a3d 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 44rpx;
  margin: 40rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;

  &::after {
    border: none;
  }
}
</style>