<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>导入播客</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body">
        <div class="input-group">
          <label>播客链接</label>
          <input 
            type="url" 
            v-model="podcastUrl"
            placeholder="请输入播客链接"
            class="url-input"
          />
        </div>
        
        <div class="podcast-preview" v-if="previewData">
          <img :src="previewData.cover" alt="播客封面" class="podcast-cover">
          <div class="podcast-info">
            <h3>{{ previewData.title }}</h3>
            <p>{{ previewData.description }}</p>
            <span class="duration">时长: {{ previewData.duration }}</span>
          </div>
        </div>

        <button 
          class="import-btn" 
          :disabled="!podcastUrl"
          @click="handleImport"
        >
          导入播客
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close', 'import'])
const podcastUrl = ref('')
const previewData = ref(null)

// Mock Data
const mockPreviewData = {
  cover: 'https://example.com/podcast-cover.jpg',
  title: '示例播客标题',
  description: '这是一个示例播客描述...',
  duration: '45:30'
}

const handleImport = () => {
  // TODO: 调用API处理播客导入
  emit('import', { url: podcastUrl.value })
}

// 模拟获取播客预览信息
setTimeout(() => {
  previewData.value = mockPreviewData
}, 1000)
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
  color: var(--primary-text);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.input-group {
  margin-bottom: 1rem;
}

.url-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--secondary-bg);
  color: var(--primary-text);
}

.podcast-preview {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--secondary-bg);
  border-radius: 8px;
  display: flex;
  gap: 1rem;
}

.podcast-cover {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
}

.podcast-info {
  flex: 1;
}

.podcast-info h3 {
  margin: 0 0 0.5rem 0;
}

.podcast-info p {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.9rem;
}

.duration {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--secondary-text);
}

.import-btn {
  width: 100%;
  padding: 0.75rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.import-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 