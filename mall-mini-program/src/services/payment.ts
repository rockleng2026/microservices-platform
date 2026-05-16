import { API_BASE, PAY_CREATE, ORDER_DETAIL, TENANT_ID } from '@/config/api'

// WeChat payment parameter types
export interface WeChatPayParams {
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

// POST /pay/create response (backend field names may vary)
export interface PayCreateResponse {
  prepay_id: string
  timestamp: string
  nonceStr: string
  signType: string
  paySign: string
  packageValue?: string
}

/**
 * Create WeChat payment for an order.
 * Step 1: POST to backend to get prepay_id and sign params
 * Step 2: Map backend response to wx.requestPayment params
 * Step 3: Call wx.requestPayment
 * Step 4: Return result to caller for redirect handling
 */
export async function createPayment(orderId: number): Promise<'success' | 'fail' | 'cancel'> {
  // Step 1: Get payment params from backend
  const res = await new Promise<any>((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${PAY_CREATE}`,
      method: 'POST',
      data: { orderId },
      header: { 'x-tenant-header': TENANT_ID, 'x-user-id': uni.getStorageSync('userId') || '1' },
      success: (r: any) => {
        if (r.statusCode === 200) resolve(r.data)
        else reject(r)
      },
      fail: reject
    })
  })

  const payData: PayCreateResponse = res.data || res

  // Step 2: Map backend response to wx.requestPayment params
  // CRITICAL: Backend returns 'timestamp' (lowercase), 'nonceStr' (camelCase)
  // WeChat JSAPI expects 'timeStamp' (camelCase with capital S), 'nonceStr' (camelCase)
  // WeChat JSAPI package value format: "prepay_id=xxx" (underscore, lowercase)
  const wxPayParams: WeChatPayParams = {
    timeStamp: String(payData.timestamp || payData.timeStamp || ''),
    nonceStr: payData.nonceStr || payData.nonce_string || '',
    package: payData.packageValue || `prepay_id=${payData.prepay_id}`,
    signType: payData.signType || 'HMAC-SHA256',
    paySign: payData.paySign || payData.pay_sign || ''
  }

  // Step 3: Call wx.requestPayment
  return new Promise((resolve) => {
    wx.requestPayment({
      ...wxPayParams,
      success: () => {
        resolve('success')
      },
      fail: (err) => {
        // User cancel returns 'cancel' errMsg, treat as cancel not fail
        if (err.errMsg && err.errMsg.includes('cancel')) {
          resolve('cancel')
        } else {
          resolve('fail')
        }
      }
    })
  })
}

/**
 * Get order payment status (used for retry payment scenarios)
 */
export async function getOrderStatus(orderId: number): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${ORDER_DETAIL}/${orderId}`,
      method: 'GET',
      header: { 'x-tenant-header': TENANT_ID, 'x-user-id': uni.getStorageSync('userId') || '1' },
      success: (res: any) => {
        if (res.statusCode === 200) {
          resolve(res.data?.status || 'unknown')
        } else {
          reject(res)
        }
      },
      fail: reject
    })
  })
}
