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

        <button 
          class="primary-btn" 
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

.podcast-input {
  width: 85%;
  margin: 0 auto 1.5rem;
  text-align: center;
  
  &::placeholder {
    text-align: center;
  }
}

.podcast-preview {
  margin: 1rem 0;
  padding: 1.5rem;
  background: var(--secondary-bg);
  border-radius: 12px;
  display: flex;
  gap: 1.5rem;
}

.podcast-cover {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.podcast-info {
  flex: 1;
  
  h3 {
    margin: 0 0 0.75rem 0;
    color: var(--primary-text);
    font-size: 1.2rem;
  }
  
  p {
    margin: 0;
    color: var(--secondary-text);
    font-size: 0.95rem;
    line-height: 1.5;
  }
}

.duration {
  display: block;
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: var(--secondary-text);
}
</style> 