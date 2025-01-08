import request from './request'

export const userApi = {
  /**
   * 用户注册
   */
  register(data) {
    return request({
      url: 'http://localhost:8899/api/user/register',
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
    })
  }
} 