<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>导入音频</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body">
        <div 
          class="upload-area"
          @dragover.prevent
          @drop.prevent="handleDrop"
          :class="{ 'dragging': isDragging }"
          @dragenter="isDragging = true"
          @dragleave="isDragging = false"
        >
          <input
            type="file"
            ref="fileInput"
            @change="handleFileSelect"
            accept="audio/*"
            class="file-input"
          >
          <div class="upload-content">
            <div class="upload-icon">📁</div>
            <p>拖拽音频文件到此处或点击上传</p>
            <p class="supported-formats">支持格式: MP3, WAV, M4A</p>
          </div>
        </div>

        <div v-if="selectedFile" class="selected-file">
          <div class="file-info">
            <span>{{ selectedFile.name }}</span>
            <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
          </div>
          <button class="import-btn" @click="handleImport">导入</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close', 'import'])
const isDragging = ref(false)
const selectedFile = ref(null)
const fileInput = ref(null)

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

const handleImport = () => {
  if (selectedFile.value) {
    emit('import', selectedFile.value)
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: var(--primary-bg);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  padding: 1.5rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  position: relative;
  cursor: pointer;
}

.upload-area.dragging {
  border-color: var(--accent-color);
  background: var(--secondary-bg);
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.supported-formats {
  color: var(--secondary-text);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.selected-file {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--secondary-bg);
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-size {
  color: var(--secondary-text);
  font-size: 0.9rem;
}

.import-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
</style> 