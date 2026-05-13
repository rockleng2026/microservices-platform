<template>
  <view class="register-page">
    <view class="register-header">
      <text class="title">创建账号</text>
      <text class="subtitle">加入IT硬件商城</text>
    </view>

    <view class="register-form">
      <view class="form-item">
        <text class="label">手机号</text>
        <view class="phone-row">
          <input
            v-model="phone"
            class="input phone-input"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
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
        <text class="label">验证码</text>
        <input
          v-model="code"
          class="input"
          type="number"
          maxlength="6"
          placeholder="请输入验证码"
          placeholder-class="placeholder"
        />
      </view>

      <view class="form-item">
        <text class="label">设置昵称</text>
        <input
          v-model="nickname"
          class="input"
          type="text"
          maxlength="20"
          placeholder="请输入昵称（选填）"
          placeholder-class="placeholder"
        />
      </view>

      <view class="form-item">
        <text class="label">设置密码</text>
        <input
          v-model="password"
          class="input"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请设置登录密码（6位以上）"
          placeholder-class="placeholder"
        />
        <view class="toggle-password" @click="showPassword = !showPassword">
          {{ showPassword ? '🙈' : '👁' }}
        </view>
      </view>

      <view class="form-item">
        <text class="label">确认密码</text>
        <input
          v-model="confirmPassword"
          class="input"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请再次输入密码"
          placeholder-class="placeholder"
        />
      </view>

      <button class="register-btn" :loading="loading" @click="handleRegister">注册</button>

      <view class="extra-links">
        <text class="link" @click="goLogin">已有账号？立即登录</text>
      </view>

      <view class="agreement">
        <view class="checkbox" :class="{ checked: agreed }" @click="agreed = !agreed">
          <text v-if="agreed">✓</text>
        </view>
        <text class="agreement-text">
          登录即表示同意
          <text class="link" @click.stop="showAgreement">《用户协议》</text>
          和
          <text class="link" @click.stop="showPrivacy">《隐私政策》</text>
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { register, sendCode } from '@/services/auth'

const phone = ref('')
const code = ref('')
const nickname = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const agreed = ref(false)
const countdown = ref(0)
let countdownTimer = null

// Send verification code
const handleSendCode = async () => {
  if (!phone.value || phone.value.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  try {
    await sendCode(phone.value, 'register')
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

// Handle register
const handleRegister = async () => {
  if (!phone.value || phone.value.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  if (!code.value || code.value.length !== 6) {
    uni.showToast({ title: '请输入6位验证码', icon: 'none' })
    return
  }
  if (!password.value || password.value.length < 6) {
    uni.showToast({ title: '密码至少6位', icon: 'none' })
    return
  }
  if (password.value !== confirmPassword.value) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }
  if (!agreed.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const username = nickname.value.trim() || phone.value
    const result = await register({
      username,
      password: password.value,
      phone: phone.value,
      code: code.value
    })

    // Save token and user info
    uni.setStorageSync('token', result.token)
    uni.setStorageSync('userInfo', {
      userId: result.userId,
      nickname: result.nickname || username,
      avatar: result.avatar || '/static/default-avatar.png'
    })

    uni.showToast({ title: '注册成功', icon: 'success' })

    setTimeout(() => {
      // 跳转到登录页面
      uni.reLaunch({ url: '/pages/login/index' })
    }, 1500)
  } catch (e) {
    console.error('Register failed:', e)
    uni.showToast({ title: e.message || '注册失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// Go to login page
const goLogin = () => {
  uni.navigateBack()
}

// Show user agreement
const showAgreement = () => {
  uni.showModal({
    title: '用户协议',
    content: '这里是用户协议内容...',
    showCancel: false
  })
}

// Show privacy policy
const showPrivacy = () => {
  uni.showModal({
    title: '隐私政策',
    content: '这里是隐私政策内容...',
    showCancel: false
  })
}
</script>

<style scoped lang="scss">
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff5500 0%, #ff7a3d 100%);
  padding: 60rpx 40rpx;
}

.register-header {
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

.register-form {
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

  .phone-row {
    display: flex;
    gap: 16rpx;

    .phone-input {
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

.register-btn {
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

.agreement {
  display: flex;
  align-items: flex-start;
  margin-top: 30rpx;
  gap: 12rpx;

  .checkbox {
    width: 36rpx;
    height: 36rpx;
    border: 2rpx solid #ddd;
    border-radius: 6rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 4rpx;

    &.checked {
      background: #ff5500;
      border-color: #ff5500;
      color: #fff;
      font-size: 24rpx;
    }
  }

  .agreement-text {
    font-size: 24rpx;
    color: #666;
    line-height: 1.5;

    .link {
      color: #ff5500;
    }
  }
}
</style>