# 测试密码模式OAuth Token接口

Write-Host "正在测试密码模式OAuth Token接口..." -ForegroundColor Green

$uri = "http://127.0.0.1:9900/api-uaa/oauth/token"
$clientId = "webApp"
$clientSecret = "webApp"

# 构建查询参数（密码模式）
$params = @{
    grant_type = "password"
    username = "admin"
    password = "admin123"
    account_type = "portal"
}

$queryString = ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"
$fullUrl = "$uri" + "?" + $queryString

# 使用HTTP Basic认证
$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${clientId}:${clientSecret}"))

try {
    Write-Host "请求地址: $fullUrl" -ForegroundColor Yellow
    Write-Host "客户端认证: Basic $credentials" -ForegroundColor Yellow
    
    $headers = @{
        'Authorization' = "Basic $credentials"
    }
    
    $response = Invoke-RestMethod -Uri $fullUrl -Method POST -Headers $headers
    
    Write-Host "请求成功!" -ForegroundColor Green
    Write-Host "响应内容:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Cyan
    
} catch {
    Write-Host "请求失败!" -ForegroundColor Red
    Write-Host "错误信息: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "响应内容: $responseBody" -ForegroundColor Red
    }
} 