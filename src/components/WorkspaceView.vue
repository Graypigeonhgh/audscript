<template>
  <div class="workspace">
    <div class="workspace-header">
      <button class="back-btn" @click="$emit('back')">
        ← 返回
      </button>
      <div class="audio-info">
        <span class="audio-name">{{ currentAudioName }}</span>
        <span class="audio-status" :class="transcriptionStatus.toLowerCase()">
          {{ transcriptionStatusText }}
        </span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      加载中...
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="error-state">
      {{ error }}
      <button class="retry-btn" @click="fetchAudioDetail">重试</button>
    </div>

    <!-- 主要内容 -->
    <div v-else class="workspace-content">
      <div class="audio-section">
        <AudioPlayer
          :audio-url="currentAudioUrl"
          :title="currentAudioName"
          ref="audioPlayer"
          @error="handleAudioError"
        />
      </div>

      <div class="editor-section">
        <TranscriptionEditor
          :initial-transcription="formatTranscription(transcription)"
          @save="handleSave"
          @export="handleExport"
          @seek="handleSeek"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AudioPlayer from '@/components/AudioPlayer.vue'
import TranscriptionEditor from '@/components/TranscriptionEditor.vue'
import { audioApi, projectApi } from '@/api'

const route = useRoute()
const audioPlayer = ref(null)
const transcription = ref([])
const isLoading = ref(false)
const error = ref(null)
const audioDetail = ref(null)

// 获取音频文件详情
const fetchAudioDetail = async () => {
  const fileId = route.params.id
  if (!fileId) {
    console.error('未找到音频ID')
    error.value = '无效的音频ID'
    return
  }

  try {
    isLoading.value = true
    error.value = null
    
    console.log('获取音频详情:', fileId)
    const response = await projectApi.getAudioFileDetail(fileId)
    console.log('音频详情:', response)
    
    audioDetail.value = response
    
    // 更新转写内容
    if (response.transcription?.content) {
      transcription.value = formatTranscriptionContent(response.transcription.content)
    }
  } catch (err) {
    console.error('获取音频详情失败:', err)
    error.value = err.message || '获取音频详情失败，请重试'
  } finally {
    isLoading.value = false
  }
}

// 格式化转写内容
const formatTranscriptionContent = (content) => {
  if (!content) return []
  
  try {
    // 尝试解析JSON字符串
    if (typeof content === 'string' && content.trim().startsWith('{')) {
      const parsed = JSON.parse(content)
      return Array.isArray(parsed) ? parsed : [{ timestamp: 0, content: content }]
    }
    
    // 如果是普通文本，按行分割
    return content.split('\n').map((line, index) => ({
      timestamp: index * 30,
      content: line.trim()
    })).filter(item => item.content) // 过滤掉空行
  } catch (err) {
    console.error('转写内容格式化失败:', err)
    return [{ timestamp: 0, content: content }]
  }
}

// 计算音频URL
const currentAudioUrl = computed(() => {
  if (audioDetail.value?.audioFile?.fileUrl) {
    return audioDetail.value.audioFile.fileUrl
  }
  return ''
})

// 计算音频名称
const currentAudioName = computed(() => {
  if (audioDetail.value?.audioFile?.fileName) {
    return audioDetail.value.audioFile.fileName
  }
  return '未命名音频'
})

// 计算转写状态
const transcriptionStatus = computed(() => {
  return audioDetail.value?.transcription?.status || 'COMPLETED'
})

// 监听路由参数变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    console.log('音频ID变化:', newId)
    fetchAudioDetail()
  }
}, { immediate: true })

const emit = defineEmits(['back', 'save', 'export'])

// 转写状态映射
const STATUS_MAP = {
  PROCESSING: '转写中...',
  COMPLETED: '转写完成',
  FAILED: '转写失败',
  PENDING: '等待转写'
}

const transcriptionStatusText = computed(() => {
  const status = transcriptionStatus.value?.toUpperCase()
  return STATUS_MAP[status] || '未知状态'
})

const handleSave = (data) => {
  emit('save', data)
}

const handleExport = (data) => {
  emit('export', data)
}

const handleSeek = (timestamp) => {
  if (audioPlayer.value) {
    audioPlayer.value.seek(timestamp)
  }
}

const handleAudioError = (error) => {
  console.error('音频播放错误:', error)
  error.value = error
}

const formatTranscription = (text) => {
  if (!text || !Array.isArray(text)) return []
  
  return text.map(item => ({
    timestamp: item.timestamp || 0,
    content: item.content || ''
  }))
}

const handleRetry = async () => {
  if (isLoading.value) return
  
  const fileId = route.params.id
  if (!fileId) {
    error.value = '无效的音频ID'
    return
  }
  
  await fetchAudioDetail()
}

// 添加自动重试逻辑（当状态为 PROCESSING 时）
watch(() => audioDetail.value?.transcription?.status, (newStatus) => {
  if (newStatus === 'PROCESSING') {
    const retryInterval = setInterval(async () => {
      if (audioDetail.value?.transcription?.status !== 'PROCESSING') {
        clearInterval(retryInterval)
        return
      }
      await fetchAudioDetail()
    }, 5000) // 每5秒检查一次

    // 清理定时器
    onUnmounted(() => {
      clearInterval(retryInterval)
    })
  }
})

onUnmounted(() => {
  // 清理可能的定时器和事件监听器
  if (audioPlayer.value) {
    audioPlayer.value.pause()
  }
})
</script>

<style scoped>
.workspace {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--primary-bg);
}

.workspace-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: var(--secondary-bg);
  color: var(--primary-text);
  border-radius: 6px;
  cursor: pointer;
}

.audio-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.audio-name {
  font-weight: 500;
}

.audio-status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.audio-status.processing {
  background: #fef3c7;
  color: #92400e;
}

.audio-status.completed {
  background: #dcfce7;
  color: #166534;
}

.audio-status.error {
  background: #fee2e2;
  color: #991b1b;
}

.workspace-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  padding: 1rem;
  overflow: hidden;
}

.audio-section {
  min-width: 0;
}

.editor-section {
  min-width: 0;
  overflow: hidden;
}

@media (max-width: 768px) {
  .workspace-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
}

/* 添加加载和错误状态样式 */
.loading-state,
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--secondary-text);
}

.error-state {
  color: #ef4444;
  flex-direction: column;
  gap: 1rem;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.retry-btn:active {
  transform: translateY(0);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--secondary-text);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style> 