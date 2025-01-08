<template>
  <div class="history">
    <h2>历史记录</h2>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      加载中...
    </div>
    
    <!-- 错误提示 -->
    <div v-else-if="error" class="error-state">
      {{ error }}
      <button class="retry-btn" @click="fetchHistory">重试</button>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="!audioFiles.length" class="empty-state">
      暂无历史记录
    </div>
    
    <!-- 历史记录列表 -->
    <div v-else class="history-list">
      <div v-for="file in audioFiles" 
           :key="file.id" 
           class="history-item"
           @click="handleItemClick(file)">
        <div class="item-info">
          <div class="file-name">{{ file.fileName }}</div>
          <div class="file-meta">
            <span class="file-size">{{ formatFileSize(file.fileSize) }}</span>
            <span class="file-date">{{ formatDate(file.createdAt) }}</span>
          </div>
        </div>
        
        <div class="item-actions">
          <button class="action-btn" @click.stop="handlePlay(file)">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </button>
          <button class="action-btn delete" @click.stop="handleDelete(file)">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 分页控件 -->
    <div v-if="audioFiles.length" class="pagination">
      <button 
        :disabled="currentPage === 1"
        @click="handlePageChange(currentPage - 1)"
        class="page-btn"
      >
        上一页
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button 
        :disabled="currentPage === totalPages"
        @click="handlePageChange(currentPage + 1)"
        class="page-btn"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { projectApi } from '@/api'

const router = useRouter()
const audioFiles = ref([])
const isLoading = ref(false)
const error = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)

// 获取历史记录
const fetchHistory = async (page = 1) => {
  try {
    isLoading.value = true
    error.value = null
    
    const response = await projectApi.getProjects({
      page: Number(page),
      size: pageSize.value
    })
    
    audioFiles.value = response.records
    totalPages.value = response.pages
    currentPage.value = page
    
  } catch (err) {
    console.error('获取历史记录失败:', err)
    error.value = err.message || '获取历史记录失败，请重试'
  } finally {
    isLoading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page) => {
  if (typeof page === 'number' && page > 0) {
    fetchHistory(page)
  }
}

// 处理播放
const handlePlay = (file) => {
  router.push({
    name: 'workspace',
    params: { id: file.id },
    query: { mode: 'play' }
  })
}

// 处理删除
const handleDelete = async (file) => {
  if (!confirm('确定要删除这条记录吗？')) return
  
  try {
    await projectApi.deleteProject(file.id)
    // 重新获取当前页数据
    fetchHistory(currentPage.value)
  } catch (err) {
    console.error('删除失败:', err)
    alert('删除失败，请重试')
  }
}

// 处理点击条目
const handleItemClick = (file) => {
  router.push({
    name: 'workspace',
    params: { id: file.id }
  })
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 检查登录状态
const checkLogin = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/')
    return false
  }
  return true
}

onMounted(() => {
  if (checkLogin()) {
    fetchHistory()
  }
})
</script>

<style scoped>
.history {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.history h2 {
  margin-bottom: 2rem;
  color: var(--primary-text);
}

.loading-state,
.empty-state,
.error-state {
  text-align: center;
  color: var(--secondary-text);
  padding: 2rem;
}

.error-state {
  color: #ef4444;
}

.retry-btn {
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  background: var(--accent-color);
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--secondary-bg);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  transform: translateX(4px);
  background: var(--hover-bg);
}

.item-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: var(--primary-text);
  margin-bottom: 0.25rem;
}

.file-meta {
  font-size: 0.875rem;
  color: var(--secondary-text);
}

.file-size {
  margin-right: 1rem;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  background: none;
  color: var(--secondary-text);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--border-color);
  color: var(--primary-text);
}

.action-btn.delete:hover {
  background: #fee2e2;
  color: #dc2626;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

.pagination {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--secondary-bg);
  color: var(--primary-text);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: var(--secondary-text);
}
</style> 