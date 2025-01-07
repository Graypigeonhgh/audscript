<template>
  <div class="home">
    <div class="action-cards">
      <div class="card" @click="showRecordModal = true">
        <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
        </svg>
        <h3>开始录音</h3>
        <p>点击开始录制新的音频</p>
      </div>
      
      <div class="card" @click="showImportModal = true">
        <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
        </svg>
        <h3>导入音频</h3>
        <p>上传已有的音频文件</p>
      </div>
      
      <div class="card" @click="showPodcastModal = true">
        <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828"/>
        </svg>
        <h3>导入播客</h3>
        <p>输入播客链接转换为文本</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showRecordModal = ref(false)
const showImportModal = ref(false)
const showPodcastModal = ref(false)
</script>

<style scoped>
.home {
  padding: 1.5rem;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 2rem;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.3s;
  cursor: pointer;
  height: 100%;
  min-height: 200px;
}

.card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-color);
  box-shadow: var(--hover-shadow);
}

.card-icon {
  width: 48px;
  height: 48px;
  color: var(--accent-color);
  margin-bottom: 1rem;
}

.card h3 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-text);
}

.card p {
  margin: 0;
  color: var(--secondary-text);
  text-align: center;
}
</style> 