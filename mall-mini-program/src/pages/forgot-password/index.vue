<template>
  <view class="forgot-page">
    <view class="forgot-header">
      <text class="title">找回密码</text>
      <text class="subtitle">通过手机号验证身份</text>
    </view>

    <view class="forgot-form">
      <view class="form-item">
        <text class="label">手机号</text>
        <input
          v-model="phone"
          class="input"
          type="number"
          maxlength="11"
          placeholder="请输入注册的手机号"
          placeholder-class="placeholder"
        />
      </view>

      <view class="form-item">
        <text class="label">验证码</text>
        <view class="code-row">
          <input
            v-model="code"
            class="input code-input"
            type="number"
            maxlength="6"
            placeholder="请输入验证码"
            placeholder-class="placeholder"
          />
          <button
            class="send-code-btn"
            :disabled="countdown > 0"
            @click="handleSendCode"
          >
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </button>
        </view>
      </view>

      <view class="form-item">
        <text class="label">新密码</text>
        <input
          v-model="newPassword"
          class="input"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请输入新密码（6位以上）"
          placeholder-class="placeholder"
        />
        <view class="toggle-password" @click="showPassword = !showPassword">
          {{ showPassword ? '🙈' : '👁' }}
        </view>
      </view>

      <view class="form-item">
        <text class="label">确认新密码</text>
        <input
          v-model="confirmPassword"
          class="input"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请再次输入新密码"
          placeholder-class="placeholder"
        />
      </view>

      <button class="submit-btn" :loading="loading" @click="handleReset">重置密码</button>

      <view class="extra-links">
        <text class="link" @click="goLogin">想起密码了？立即登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { sendCode, resetPassword } from '@/services/auth'

const phone = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const countdown = ref(0)
let countdownTimer = null

// Send verification code
const handleSendCode = async () => {
  if (!phone.value || phone.value.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  try {
    await sendCode(phone.value, 'reset')
    uni.showToast({ title: '验证码已发送', icon: 'success' })
    // Start countdown
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        if (countdownTimer) clearInterval(countdownTimer)
      }
    }, 1000)
  } catch (e) {
    uni.showToast({ title: e.message || '发送失败', icon: 'none' })
  }
}

// Handle reset password
const handleReset = async () => {
  if (!phone.value || phone.value.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  if (!code.value || code.value.length !== 6) {
    uni.showToast({ title: '请输入6位验证码', icon: 'none' })
    return
  }
  if (!newPassword.value || newPassword.value.length < 6) {
    uni.showToast({ title: '新密码至少6位', icon: 'none' })
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }

  loading.value = true
  try {
    await resetPassword(phone.value, code.value, newPassword.value)
    uni.showToast({ title: '密码重置成功', icon: 'success' })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (e) {
    console.error('Reset password failed:', e)
    uni.showToast({ title: e.message || '重置失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// Go to login page
const goLogin = () => {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.forgot-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff5500 0%, #ff7a3d 100%);
  padding: 60rpx 40rpx;
}

.forgot-header {
  text-align: center;
  padding: 60rpx 0 40rpx;

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

.forgot-form {
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

  .code-row {
    display: flex;
    gap: 16rpx;

    .code-input {
      flex: 1;
    }

    .send-code-btn {
      width: 220rpx;
      height: 88rpx;
      background: #fff;
      color: #ff5500;
      font-size: 24rpx;
      border: 2rpx solid #ff5500;
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;

      &[disabled] {
        color: #999;
        border-color: #ddd;
      }

      &::after {
        border: none;
      }
    }
  }

  .toggle-password {
    position: absolute;
    right: 24rpx;
    bottom: 22rpx;
    font-size: 36rpx;
    padding: 10rpx;
  }
}

.submit-btn {
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
  text-align: center;
  margin-top: 30rpx;

  .link {
    font-size: 26rpx;
    color: #ff5500;
  }
}
</style>