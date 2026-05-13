<template>
  <view class="login-page">
    <view class="login-header">
      <text class="title">欢迎登录</text>
      <text class="subtitle">IT硬件商城</text>
    </view>

    <view class="login-form">
      <view class="form-item">
        <text class="label">手机号/用户名</text>
        <input
          v-model="username"
          class="input"
          type="text"
          placeholder="请输入手机号或用户名"
          placeholder-class="placeholder"
        />
      </view>

      <view class="form-item">
        <text class="label">密码</text>
        <input
          v-model="password"
          class="input"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请输入密码"
          placeholder-class="placeholder"
        />
        <view class="toggle-password" @click="showPassword = !showPassword">
          {{ showPassword ? '🙈' : '👁' }}
        </view>
      </view>

      <button class="login-btn" :loading="loading" @click="handleLogin">登录</button>

      <view class="extra-links">
        <text class="link" @click="goRegister">还没有账号？立即注册</text>
        <text class="separator">|</text>
        <text class="link" @click="goForgotPwd">忘记密码</text>
      </view>

      <view class="divider">
        <view class="divider-line"></view>
        <text class="divider-text">其他登录方式</text>
        <view class="divider-line"></view>
      </view>

      <view class="third-party">
        <view class="third-btn wechat" @click="handleWxLogin">
          <text class="icon">微信</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { login } from '@/services/auth'

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)

// Handle login
const handleLogin = async () => {
  if (!username.value.trim()) {
    uni.showToast({ title: '请输入手机号或用户名', icon: 'none' })
    return
  }
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const result = await login(username.value, password.value)

    // Save token and user info
    uni.setStorageSync('token', result.token)
    uni.setStorageSync('userInfo', {
      userId: result.userId,
      nickname: result.nickname || username.value,
      avatar: result.avatar || '/static/default-avatar.png'
    })

    uni.showToast({ title: '登录成功', icon: 'success' })

    // Delay to show success message, then switch to user tab
    setTimeout(() => {
      uni.switchTab({ url: '/pages/user/index' })
    }, 1500)
  } catch (e) {
    console.error('Login failed:', e)
    uni.showToast({ title: e.message || '登录失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// Go to register page
const goRegister = () => {
  uni.navigateTo({ url: '/pages/register/index' })
}

// Go to forgot password page
const goForgotPwd = () => {
  uni.navigateTo({ url: '/pages/forgot-password/index' })
}

// Handle WeChat login (mock)
const handleWxLogin = () => {
  // #ifdef H5
  uni.showToast({ title: '微信登录开发中', icon: 'none' })
  // #endif
  // #ifndef H5
  uni.showToast({ title: '请在微信小程序中使用', icon: 'none' })
  // #endif
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff5500 0%, #ff7a3d 100%);
  padding: 60rpx 40rpx;
}

.login-header {
  text-align: center;
  padding: 80rpx 0 60rpx;

  .title {
    display: block;
    font-size: 48rpx;
    font-weight: 600;
    color: #fff;
  }

  .subtitle {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 16rpx;
  }
}

.login-form {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 30rpx;
  position: relative;

  .label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 12rpx;
    font-weight: 500;
  }

  .input {
    width: 100%;
    height: 88rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    box-sizing: border-box;
  }

  .placeholder {
    color: #999;
  }

  .toggle-password {
    position: absolute;
    right: 24rpx;
    bottom: 22rpx;
    font-size: 36rpx;
    padding: 10rpx;
  }
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #ff5500 0%, #ff7a3d 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 44rpx;
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;

  &::after {
    border: none;
  }
}

.extra-links {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30rpx;
  gap: 16rpx;

  .link {
    font-size: 26rpx;
    color: #ff5500;
  }

  .separator {
    color: #ddd;
  }
}

.divider {
  display: flex;
  align-items: center;
  margin: 40rpx 0 30rpx;

  .divider-line {
    flex: 1;
    height: 1rpx;
    background: #eee;
  }

  .divider-text {
    padding: 0 24rpx;
    font-size: 24rpx;
    color: #999;
  }
}

.third-party {
  display: flex;
  justify-content: center;
  gap: 60rpx;

  .third-btn {
    display: flex;
    flex-direction: column;
    align-items: center;

    .icon {
      font-size: 80rpx;
    }

    &.wechat .icon {
      color: #07c160;
    }
  }
}
</style>