import request from './request'

export const projectApi = {
  /**
   * 获取项目列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页数量
   * @param {string} params.status - 项目状态
   * @returns {Promise<Object>} 项目列表数据
   */
  getProjects(params) {
    return request({
      url: '/api/audio-files',
      method: 'get',
      params: {
        page: params.page,
        size: params.size
      }
    }).then(response => {
      // 确保每个文件对象都有完整的URL
      if (response.records) {
        response.records = response.records.map(file => ({
          ...file,
          fileUrl: file.fileUrl || `${process.env.VUE_APP_API_BASE_URL}/api/audio-files/${file.id}/download`
        }))
      }
      return response
    })
  },

  /**
   * 创建新项目
   * @param {Object} data - 项目数据
   * @param {string} data.name - 项目名称
   * @param {string} data.description - 项目描述
   * @param {File} data.audioFile - 音频文件
   * @returns {Promise<Object>} 创建的项目信息
   */
  createProject(data) {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('audioFile', data.audioFile)

    return request({
      url: '/api/projects',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 更新项目
   * @param {string} projectId - 项目ID
   * @param {Object} data - 更新数据
   * @returns {Promise<Object>} 更新后的项目信息
   */
  updateProject(projectId, data) {
    return request({
      url: `/api/projects/${projectId}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除项目
   * @param {string} projectId - 项目ID
   * @returns {Promise<void>}
   */
  deleteProject(projectId) {
    return request({
      url: `/api/audio-files/${projectId}`,
      method: 'delete'
    })
  },

  /**
   * 获取音频文件详情
   * @param {string} fileId - 音频文件ID
   * @returns {Promise<Object>} 音频文件详情
   */
  getAudioFileDetail(fileId) {
    return request({
      url: `/api/audio-files/${fileId}`,
      method: 'get'
    }).then(response => {
      // 确保音频文件URL是完整的
      if (response.audioFile) {
        response.audioFile.fileUrl = response.audioFile.fileUrl || 
          `${process.env.VUE_APP_API_BASE_URL}/api/audio-files/${response.audioFile.id}/download`
      }
      return response
    })
  }
} 