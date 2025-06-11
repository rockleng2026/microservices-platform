# Portal OAuth测试脚本 - 带验证码模式
# 测试地址: http://localhost:9900

$baseUrl = "http://localhost:9900"

Write-Host "=== Portal OAuth 带验证码测试 ===" -ForegroundColor Green

# 生成设备ID
$deviceId = "device_" + (Get-Random -Maximum 999999)
Write-Host "生成设备ID: $deviceId" -ForegroundColor Yellow

# 1. 获取验证码
Write-Host "`n1. 获取验证码..." -ForegroundColor Cyan
try {
    $captchaResponse = Invoke-RestMethod -Uri "$baseUrl/validata/code/$deviceId" -Method Get
    Write-Host "验证码响应: $($captchaResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Green
    
    # 保存验证码图片(base64)
    if ($captchaResponse.data) {
        Write-Host "验证码图片已获取(Base64格式)" -ForegroundColor Green
        Write-Host "请手动查看验证码并输入..." -ForegroundColor Yellow
        
        # 提示用户输入验证码
        $validCode = Read-Host "请输入验证码"
        Write-Host "用户输入的验证码: $validCode" -ForegroundColor Yellow
    } else {
        Write-Host "未获取到验证码数据" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "获取验证码失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "响应内容: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# 2. 使用验证码登录
Write-Host "`n2. 使用验证码进行OAuth登录..." -ForegroundColor Cyan

# 客户端凭据
$clientId = "webApp"
$clientSecret = "webApp"

# 用户凭据
$username = "admin"
$password = "admin123"

# 创建Basic认证头
$credentials = [System.Text.Encoding]::UTF8.GetBytes("${clientId}:${clientSecret}")
$encodedCredentials = [System.Convert]::ToBase64String($credentials)
$authHeader = "Basic $encodedCredentials"

# 构建请求体
$body = @{
    grant_type = "password_code"
    username = $username
    password = $password
    validCode = $validCode
    deviceId = $deviceId
    account_type = "portal"
}

# 构建URL查询参数
$queryParams = @()
foreach ($key in $body.Keys) {
    $queryParams += "$key=$($body[$key])"
}
$queryString = $queryParams -join "&"
$tokenUrl = "$baseUrl/oauth/token?$queryString"

Write-Host "请求URL: $tokenUrl" -ForegroundColor Yellow
Write-Host "Authorization Header: $authHeader" -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = $authHeader
        "Content-Type" = "application/x-www-form-urlencoded"
    }
    
    $response = Invoke-RestMethod -Uri $tokenUrl -Method Post -Headers $headers
    Write-Host "登录成功!" -ForegroundColor Green
    Write-Host "响应: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Green
    
    # 保存access_token供后续使用
    $global:accessToken = $response.access_token
    Write-Host "`n访问令牌: $($response.access_token.Substring(0,20))..." -ForegroundColor Cyan
    
} catch {
    Write-Host "登录失败: $($_.Exception.Message)" -ForegroundColor Red
    
    # 尝试获取详细错误信息
    try {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "错误详情: $errorContent" -ForegroundColor Red
    } catch {
        Write-Host "无法获取详细错误信息" -ForegroundColor Red
    }
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Green 