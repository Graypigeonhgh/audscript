import request from './request'

export const userApi = {
  /**
   * 用户注册
   * @param {Object} data - 注册信息
   * @param {string} data.username - 用户名
   * @param {string} data.password - 密码
   * @param {string} data.email - 邮箱
   * @returns {Promise<Object>} 用户信息
   */
  register(data) {
    return request({
      url: '/api/user/register',
      method: 'post',
      data
    })
  },

  /**
   * 用户登录
   * @param {Object} data - 登录信息
   * @param {string} data.username - 用户名
   * @param {string} data.password - 密码
   * @returns {Promise<Object>} 登录响应，包含token
   */
  login(data) {
    return request({
      url: '/api/user/login',
      method: 'post',
      data
    })
  }
} 