<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>导入音频</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="upload-area" 
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
          :class="{ 'dragging': isDragging }"
        >
          <input 
            type="file" 
            ref="fileInput"
            @change="handleFileSelect"
            accept="audio/*"
            class="file-input"
          />
          
          <div class="upload-content">
            <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            <p class="upload-text">
              拖放音频文件到此处，或
              <button class="text-btn" @click="triggerFileInput">点击选择文件</button>
            </p>
            <p class="upload-hint">支持的格式：MP3, WAV, M4A</p>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="selectedFile" class="file-info">
          <div class="file-details">
            <span class="file-name">{{ selectedFile.name }}</span>
            <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
          </div>
          <button 
            class="primary-btn" 
            @click="handleUpload"
            :disabled="isLoading"
          >
            {{ isLoading ? '导入中...' : '开始导入' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { audioApi } from '@/api'

const emit = defineEmits(['close', 'import'])
const fileInput = ref(null)
const selectedFile = ref(null)
const isDragging = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const triggerFileInput = () => {
  fileInput.value.click()
}

// eslint-disable-next-line no-unused-vars
const handleDragOver = (_) => {
  isDragging.value = true
}

// eslint-disable-next-line no-unused-vars
const handleDragLeave = (_) => {
  isDragging.value = false
}

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('audio/')) {
    selectedFile.value = file
  }
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

const handleUpload = async () => {
  // 检查是否已登录
  const token = localStorage.getItem('token')
  if (!token) {
    errorMessage.value = '请先登录后再导入音频'
    return
  }

  if (!selectedFile.value) {
    errorMessage.value = '请先选择音频文件'
    return
  }

  // 检查文件格式
  const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/webm']
  if (!allowedTypes.includes(selectedFile.value.type)) {
    errorMessage.value = '不支持的音频格式，请选择 MP3、WAV、OGG 或 WebM 格式的文件'
    return
  }

  // 检查文件大小
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (selectedFile.value.size > maxSize) {
    errorMessage.value = '文件大小不能超过100MB'
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''
    
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    
    const response = await audioApi.uploadAndTranscribe(selectedFile.value)
    
    emit('import', {
      file: selectedFile.value,
      url: URL.createObjectURL(selectedFile.value),
      transcription: response.text
    })
    
    emit('close')
  } catch (error) {
    console.error('导入音频失败:', error)
    errorMessage.value = error.message || '导入音频失败，请重试'
  } finally {
    isLoading.value = false
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style lang="scss">
@import '@/assets/styles/modal.scss';

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  background: var(--secondary-bg);
  
  &.dragging {
    border-color: var(--accent-color);
    background: var(--primary-bg);
  }
}

.file-input {
  display: none;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: var(--accent-color);
  margin-bottom: 1rem;
}

.upload-text {
  margin: 1rem 0;
  color: var(--primary-text);
}

.upload-hint {
  color: var(--secondary-text);
  font-size: 0.9rem;
  margin: 0;
}

.file-info {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--secondary-bg);
  border-radius: 8px;
}

.file-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.file-name {
  color: var(--primary-text);
  font-weight: 500;
}

.file-size {
  color: var(--secondary-text);
  font-size: 0.9rem;
}

.text-btn {
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  padding: 0;
  font-size: inherit;
  
  &:hover {
    text-decoration: underline;
  }
}

.error-message {
  color: #ef4444;
  margin: 8px 0;
  padding: 8px;
  background: #fee2e2;
  border-radius: 6px;
  text-align: center;
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 