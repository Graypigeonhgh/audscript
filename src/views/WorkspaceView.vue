<template>
  <div class="workspace-page">
    <header class="workspace-header">
      <h2>工作台</h2>
      <div class="workspace-actions">
        <button class="action-btn" @click="showRecordModal = true">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
          </svg>
          新建录音
        </button>
        <button class="action-btn" @click="showImportModal = true">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          导入音频
        </button>
      </div>
    </header>

    <div class="workspace-content">
      <div class="projects-section">
        <h3>进行中的项目</h3>
        <div v-if="activeProjects.length" class="projects-grid">
          <div v-for="project in activeProjects" :key="project.id" class="project-card">
            <div class="project-header">
              <div class="project-icon">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                </svg>
              </div>
              <div class="project-info">
                <h4>{{ project.name }}</h4>
                <span class="project-date">{{ formatDate(project.createdAt) }}</span>
              </div>
            </div>
            <div class="project-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: `${project.progress}%` }"
                  :class="project.status"
                ></div>
              </div>
              <span class="progress-text">{{ project.progress }}%</span>
            </div>
            <div class="project-status">
              <span :class="['status-badge', project.status]">{{ getStatusText(project.status) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>暂无进行中的项目</p>
          <button class="create-btn" @click="showRecordModal = true">创建新项目</button>
        </div>
      </div>
    </div>

    <!-- 录音模态框 -->
    <RecordModal 
      v-if="showRecordModal" 
      @close="showRecordModal = false"
      @save="handleSaveRecording"
    />

    <!-- 导入模态框 -->
    <ImportModal
      v-if="showImportModal"
      @close="showImportModal = false"
      @import="handleImportAudio"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import RecordModal from '@/components/RecordModal.vue'
import ImportModal from '@/components/ImportModal.vue'

const showRecordModal = ref(false)
const showImportModal = ref(false)

// 模拟的项目数据
const activeProjects = ref([
  {
    id: 1,
    name: '每周会议记录',
    createdAt: new Date('2024-03-10'),
    progress: 75,
    status: 'processing' // processing, completed, error
  },
  {
    id: 2,
    name: '课程笔记转录',
    createdAt: new Date('2024-03-12'),
    progress: 100,
    status: 'completed'
  },
  {
    id: 3,
    name: '播客内容转写',
    createdAt: new Date('2024-03-13'),
    progress: 30,
    status: 'error'
  }
])

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    processing: '处理中',
    completed: '已完成',
    error: '出错了'
  }
  return statusMap[status] || '未知状态'
}

// 处理录音保存
const handleSaveRecording = (audioData) => {
  console.log('保存录音:', audioData)
  showRecordModal.value = false
  // TODO: 调用API保存录音
}

// 处理音频导入
const handleImportAudio = (file) => {
  console.log('导入音频:', file)
  showImportModal.value = false
  // TODO: 调用API上传音频
}
</script>

<style scoped>
.workspace-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.workspace-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--primary-text);
}

.workspace-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--primary-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  background: var(--hover-bg);
  border-color: var(--accent-color);
  transform: translateY(-1px);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.projects-section {
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.projects-section h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  color: var(--primary-text);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--hover-shadow);
}

.project-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.project-icon {
  width: 40px;
  height: 40px;
  background: var(--hover-bg);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-icon .icon {
  width: 24px;
  height: 24px;
  color: var(--accent-color);
}

.project-info h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--primary-text);
}

.project-date {
  font-size: 0.75rem;
  color: var(--secondary-text);
}

.project-progress {
  margin: 1rem 0;
}

.progress-bar {
  height: 6px;
  background: var(--hover-bg);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.processing {
  background: var(--accent-color);
}

.progress-fill.completed {
  background: var(--success-color, #10B981);
}

.progress-fill.error {
  background: var(--error-color, #EF4444);
}

.progress-text {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--secondary-text);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.processing {
  background: var(--accent-color-light, rgba(59, 130, 246, 0.1));
  color: var(--accent-color);
}

.status-badge.completed {
  background: var(--success-color-light, rgba(16, 185, 129, 0.1));
  color: var(--success-color, #10B981);
}

.status-badge.error {
  background: var(--error-color-light, rgba(239, 68, 68, 0.1));
  color: var(--error-color, #EF4444);
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: var(--secondary-text);
}

.create-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.create-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .workspace-page {
    padding: 1rem;
  }
  
  .workspace-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style> 