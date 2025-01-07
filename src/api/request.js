import axios from 'axios'

// 创建axios实例
const request = axios.create({
  baseURL: 'http://localhost:8899', // 从OpenAPI文档中获取的baseURL
  timeout: 15000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从localStorage获取token
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
    return response.data
  },
  error => {
    // 统一错误处理
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权处理
          break
        case 403:
          // 禁止访问处理
          break
        case 404:
          // 资源不存在处理
          break
        default:
          // 其他错误处理
      }
    }
    return Promise.reject(error)
  }
)

export default request 