import request from './request'

export const podcastApi = {
  /**
   * 通过链接导入播客
   * @param {Object} data - 播客数据
   * @param {string} data.url - 播客链接
   * @param {string} data.name - 播客名称
   * @returns {Promise<Object>} 导入的播客信息
   */
  importPodcast(data) {
    return request({
      url: '/api/podcasts/import',
      method: 'post',
      data
    })
  },

  /**
   * 获取播客转写状态
   * @param {string} podcastId - 播客ID
   * @returns {Promise<Object>} 转写状态信息
   */
  getTranscriptionStatus(podcastId) {
    return request({
      url: `/api/podcasts/${podcastId}/status`,
      method: 'get'
    })
  },

  /**
   * 获取播客转写结果
   * @param {string} podcastId - 播客ID
   * @returns {Promise<Object>} 转写结果
   */
  getTranscription(podcastId) {
    return request({
      url: `/api/podcasts/${podcastId}/transcription`,
      method: 'get'
    })
  }
} 