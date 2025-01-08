import request from './request'

export const audioApi = {
  /**
   * 上传并转写音频文件
   * @param {File} file - 音频文件
   * @returns {Promise<Object>} 转写响应
   */
  uploadAndTranscribe(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    return request({
      url: '/api/audio/upload-and-transcribe',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 开始实时语音识别
   * @param {Object} params - 识别参数
   * @param {number} [params.duration=30000] - 识别持续时间（毫秒）
   * @returns {Promise<EventSource>} SSE连接
   */
  startStreamRecognition(params = { duration: 30000 }) {
    return new Promise((resolve, reject) => {
      try {
        const sse = new EventSource(
          `/api/audio/recognize/stream?duration=${params.duration}`
        )
        
        sse.onmessage = (event) => {
          const data = JSON.parse(event.data)
          console.log('实时识别结果:', data)
        }
        
        sse.onerror = (error) => {
          console.error('SSE连接错误:', error)
          sse.close()
          reject(error)
        }
        
        resolve(sse)
      } catch (error) {
        reject(error)
      }
    })
  }
} 