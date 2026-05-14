// 图片服务器地址配置
let FILE_SERVER_BASE = 'http://localhost:9900/api-file/files/local'

// 动态设置文件服务器地址
export const setFileServerBase = (base) => {
  FILE_SERVER_BASE = base
}

// 获取文件服务器基础地址
export const getFileServerBase = () => FILE_SERVER_BASE

// 图片URL处理 - 相对路径转换为完整URL
export const getFullImageUrl = (relativePath) => {
  if (!relativePath) return ''

  // 如果已经是完整URL或data URI，直接返回
  if (relativePath.startsWith('data:') || relativePath.startsWith('http') || relativePath.startsWith('//')) {
    return relativePath
  }

  // 如果是本地静态资源路径(/static/开头)，不拼接文件服务器地址
  if (relativePath.startsWith('/static/')) {
    return relativePath
  }

  // 如果是相对路径(以/开头)，拼接文件服务器地址
  if (relativePath.startsWith('/')) {
    return FILE_SERVER_BASE + relativePath
  }

  // 否则直接返回
  return relativePath
}

// 默认头像 - base64 SVG
export const DEFAULT_AVATAR_DATAURI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTIwIDEyMCI+PHJlY3QgZmlsbD0iI2Y1ZjVmNSIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjQwIiByPSIyMCIgZmlsbD0iI2M4YzhjOCIvPjx0ZXh0IHg9IjYwIiB5PSI0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1kb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5Vc2VyPC90ZXh0Pjwvc3ZnPg=='

// 默认头像路径（本地静态资源）
export const DEFAULT_AVATAR = '/static/default-avatar.png'