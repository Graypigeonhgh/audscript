import request from './request'

export const translationApi = {
  /**
   * 文本翻译
   * @param {Object} params - 翻译参数
   * @param {string} params.text - 待翻译文本
   * @param {string} params.sourceLanguage - 源语言代码
   * @param {string} params.targetLanguage - 目标语言代码
   * @returns {Promise<Object>} 翻译结果
   */
  translate(params) {
    return request({
      url: '/api/translation/translate',
      method: 'post',
      params
    })
  },

  /**
   * 获取支持的语言列表
   * @returns {Promise<Object>} 支持的语言列表
   */
  getSupportedLanguages() {
    return request({
      url: '/api/translation/languages',
      method: 'get'
    })
  }
} 