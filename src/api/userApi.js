import request from './request'

export const userApi = {
  /**
   * 用户注册
   */
  register(data) {
    return request({
      url: '/api/user/register',
      method: 'post',
      data: {
        username: data.username,
        password: data.password,
        email: data.email
      }
    })
  },

  /**
   * 用户登录
   */
  login(data) {
    return request({
      url: '/api/user/login',
      method: 'post',
      data: {
        username: data.username,
        password: data.password
      }
    }).then(response => {
      const token = response.data?.token || response.token
      if (!token) {
        throw new Error('登录失败：未收到有效的token')
      }
      return {
        token,
        username: data.username
      }
    })
  }
} 