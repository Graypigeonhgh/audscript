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
          <input 
            type="url" 
            v-model="podcastUrl"
            placeholder="请输入播客链接"
            class="form-input podcast-input"
          />
        </div>

        <div class="podcast-preview">
          <img :src="previewData.cover" alt="播客封面" class="podcast-cover">
          <div class="podcast-info">
            <h3>{{ previewData.title }}</h3>
            <p>{{ previewData.description }}</p>
            <span class="duration">时长: {{ previewData.duration }}</span>
          </div>
        </div>

        <button class="primary-btn" @click="handleImport">
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
const previewData = ref({
  cover: 'https://cdn.prod.website-files.com/657c03781f95ed6de7372282/662238209bf661a9c38bdefb_%E7%A7%91%E6%97%A9.png',
  title: '科技早知道',
  description: '这是一个示例播客描述...',
  duration: '45:30'
})

const handleImport = () => {
  emit('import', { url: podcastUrl.value || 'mock-podcast-url' })
}
</script>

<style lang="scss">
@import '@/assets/styles/modal.scss';

.modal-header {
  margin-bottom: 1.5rem !important;
}

.podcast-input {
  width: 85%;
  margin: 0 auto 0.5rem;
  text-align: center;
  height: 42px;
  
  &::placeholder {
    text-align: center;
  }
}

.podcast-preview {
  margin: 0.25rem 0;
  padding: 0.75rem;
  background: var(--secondary-bg);
  border-radius: 12px;
  display: flex;
  gap: 0.75rem;
}

.podcast-cover {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
}

.podcast-info {
  flex: 1;
  
  h3 {
    margin: 0 0 0.25rem 0;
    color: var(--primary-text);
    font-size: 1rem;
  }
  
  p {
    margin: 0;
    color: var(--secondary-text);
    font-size: 0.85rem;
    line-height: 1.3;
  }
}

.duration {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: var(--secondary-text);
}

.modal-body {
  gap: 1rem !important;
}

.primary-btn {
  height: 42px !important;
  margin-top: 0.25rem !important;
}
</style> 