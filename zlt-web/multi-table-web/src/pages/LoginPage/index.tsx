import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, message, Row, Col, Image, Divider } from 'antd'
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { login, getCaptcha, LoginForm as ApiLoginForm, getCurrentUser } from '../../services/auth'
import './index.scss'

interface LoginForm {
  username: string
  password: string
  validCode: string
}

const LoginPage: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [uuid, setUuid] = useState<string>(uuidv4())
  const navigate = useNavigate()

  // 刷新验证码
  const refreshCaptcha = () => {
    setUuid(uuidv4())
  }

  // 页面初始化
  useEffect(() => {
    // 检查是否已登录
    const token = localStorage.getItem('access_token')
    if (token) {
      navigate('/dashboard')
    }
  }, [navigate])

  // 登录失败处理
  const onFinishFailed = (errorInfo: any) => {
    console.log('表单验证失败:', errorInfo)
    message.error('请检查输入信息！')
  }

  // 登录提交
  const onFinish = async (values: LoginForm) => {
    console.log('开始登录，表单值:', values)
    setLoading(true)
    
    try {
      // 调用登录接口
      const response = await login({
        username: values.username,
        password: values.password,
        validCode: values.validCode,
        deviceId: uuid
      })

      console.log('登录响应:', response)

      if (response.resp_code === 0) {
        const { access_token, refresh_token } = response.datas

        // 存储token
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        
        // 存储登录接口返回的基础用户信息
        if (response.datas.userInfo) {
          localStorage.setItem('basicUserInfo', JSON.stringify(response.datas.userInfo))
        }

        // 获取完整用户信息
        try {
          console.log('开始获取用户详细信息...')
          const userInfoResponse = await getCurrentUser()
          
          if (userInfoResponse.resp_code === 0) {
            // 存储完整用户信息
            localStorage.setItem('userInfo', JSON.stringify(userInfoResponse.datas))
            localStorage.setItem('currentUser', JSON.stringify(userInfoResponse.datas))
            
            console.log('用户详细信息获取成功:', userInfoResponse.datas)
            message.success(`欢迎回来，${userInfoResponse.datas.nickname || userInfoResponse.datas.username}！`)
          } else {
            console.warn('获取用户详细信息失败:', userInfoResponse.resp_msg)
            message.warning('登录成功，但获取用户信息失败')
          }
        } catch (userInfoError) {
          console.error('获取用户详细信息异常:', userInfoError)
          message.warning('登录成功，但获取用户详细信息失败')
        }

        // 跳转到控制台
        navigate('/dashboard')
      } else {
        message.error(response.resp_msg || '登录失败')
        refreshCaptcha() // 刷新验证码
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      
      if (error.response?.status === 400) {
        message.error('用户名或密码错误')
      } else if (error.response?.status === 401) {
        message.error('认证失败，请检查验证码')
      } else if (error.response?.data?.resp_msg) {
        message.error(error.response.data.resp_msg)
      } else {
        message.error('登录失败，请稍后重试')
      }
      
      // 刷新验证码
      refreshCaptcha()
    } finally {
      setLoading(false)
    }
  }

  // 验证码URL
  const captchaUrl = getCaptcha(uuid)

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-banner">
          <div className="banner-content">
            <h1 className="banner-title">多维表格系统</h1>
            <p className="banner-subtitle">Modern Multi-dimensional Table Platform</p>
            <div className="banner-features">
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <div>智能数据分析</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔒</div>
                <div>企业级安全</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <div>高性能处理</div>
              </div>
            </div>
          </div>
        </div>

        <div className="login-form-container">
          <Card className="login-card" bordered={false}>
            <div className="login-header">
              <h2>登录系统</h2>
              <p>欢迎使用多维表格管理平台</p>
            </div>

            <Form
              form={form}
              name="login"
              size="large"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名!' },
                  { min: 2, message: '用户名至少2个字符!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入用户名"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码!' },
                  { min: 6, message: '密码至少6位!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item
                name="validCode"
                rules={[
                  { required: true, message: '请输入验证码!' },
                  { len: 4, message: '验证码为4位!' }
                ]}
              >
                <Row gutter={8}>
                  <Col span={14}>
                    <Input
                      prefix={<SafetyOutlined />}
                      placeholder="请输入验证码"
                      maxLength={4}
                    />
                  </Col>
                  <Col span={10}>
                    <div className="captcha-container" onClick={refreshCaptcha}>
                      <Image
                        src={captchaUrl}
                        alt="验证码"
                        preview={false}
                        className="captcha-image"
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN..."
                      />
                    </div>
                  </Col>
                </Row>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="login-button"
                >
                  {loading ? '登录中...' : '登录'}
                </Button>
              </Form.Item>
            </Form>

            <Divider plain>
              <span className="divider-text">系统信息</span>
            </Divider>

            <div className="login-footer">
              <div className="system-info">
                <div className="info-item">
                  <span className="info-label">版本:</span>
                  <span className="info-value">v3.0.0</span>
                </div>
                <div className="info-item">
                  <span className="info-label">架构:</span>
                  <span className="info-value">微服务</span>
                </div>
              </div>
              <div className="copyright">
                © 2024 多维表格系统. All rights reserved.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LoginPage 