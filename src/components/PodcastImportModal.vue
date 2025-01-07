<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>导入播客</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="input-group">
          <label>播客链接</label>
          <input 
            type="url" 
            v-model="podcastUrl"
            placeholder="请输入播客链接"
            class="form-input"
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
          class="primary-btn" 
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

<style lang="scss">
@import '@/assets/styles/modal.scss';

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
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: var(--primary-text);
  }
  
  p {
    margin: 0;
    color: var(--secondary-text);
    font-size: 0.9rem;
  }
}

.duration {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--secondary-text);
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--primary-text);
  font-weight: 500;
}
</style> 