import axios from 'axios'

// 创建axios实例
const request = axios.create({
  // baseURL: 'http://localhost:8899',  // 直接请求后端地址
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加调试日志
    console.log('Request Config:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    })
    
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 添加调试日志
    console.log('Response Data:', response.data)
    return response.data
  },
  error => {
    // 增强错误日志
    console.error('Request Error:', {
      config: error.config,
      response: error.response,
      message: error.message
    })
    
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 401:
          localStorage.removeItem('token')
          console.error('未授权或登录已过期')
          break
        case 403:
          console.error('没有权限访问该资源')
          break
        case 404:
          console.error('请求的资源不存在，URL:', error.config.url)
          break
        case 400:
          console.error('请求参数错误:', data.message)
          break
        case 500:
          console.error('服务器内部错误:', data.message)
          break
        default:
          console.error(`未知错误 ${status}:`, data.message)
      }
    } else if (error.request) {
      console.error('网络错误，请检查您的网络连接')
    } else {
      console.error('请求配置错误:', error.message)
    }
    return Promise.reject(error)
  }
)

export default request 