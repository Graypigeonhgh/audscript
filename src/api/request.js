import axios from 'axios'

// 创建axios实例
const request = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8899',
  timeout: 60000,
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
      config.headers.Authorization = `Bearer ${token}` // 确保token格式正确
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
    return response.data
  },
  error => {
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      return Promise.reject(new Error('请求超时，请检查网络连接'))
    }

    if (error.response) {
      const { status } = error.response
      
      if (status === 401) {
        // 未登录或token过期
        localStorage.removeItem('token')
        // 可以在这里触发显示登录框
        return Promise.reject(new Error('请先登录'))
      }
      
      if (status === 413) {
        return Promise.reject(new Error('文件太大，请选择小于100MB的文件'))
      }

      return Promise.reject(new Error(error.response.data?.message || '请求失败'))
    }
    
    return Promise.reject(error)
  }
)

export default request 