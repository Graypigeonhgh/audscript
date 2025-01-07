<template>
  <div class="workspace">
    <div class="workspace-header">
      <button class="back-btn" @click="$emit('back')">
        ← 返回
      </button>
      <div class="audio-info">
        <span class="audio-name">{{ audioName }}</span>
        <span class="audio-status" :class="status">{{ statusText }}</span>
      </div>
    </div>

    <div class="workspace-content">
      <div class="audio-section">
        <AudioPlayer
          :audio-url="audioUrl"
          :title="audioName"
          ref="audioPlayer"
        />
      </div>

      <div class="editor-section">
        <TranscriptionEditor
          :initial-transcription="transcription"
          @save="handleSave"
          @export="handleExport"
          @seek="handleSeek"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AudioPlayer from './AudioPlayer.vue'
import TranscriptionEditor from './TranscriptionEditor.vue'

const props = defineProps({
  audioUrl: {
    type: String,
    required: true
  },
  audioName: {
    type: String,
    default: '未命名音频'
  },
  status: {
    type: String,
    default: 'processing' // 'processing', 'completed', 'error'
  }
})

const emit = defineEmits(['back', 'save', 'export'])
const audioPlayer = ref(null)

// 模拟的转写数据
const transcription = ref([
  { timestamp: 0, content: '这是第一段转写的内容...' },
  { timestamp: 30, content: '这是第二段转写的内容...' },
  { timestamp: 60, content: '这是第三段转写的内容...' },
])

const statusText = computed(() => {
  const statusMap = {
    processing: '转写中...',
    completed: '转写完成',
    error: '转写失败'
  }
  return statusMap[props.status] || '未知状态'
})

const handleSave = (data) => {
  emit('save', data)
}

const handleExport = (data) => {
  emit('export', data)
}

const handleSeek = (timestamp) => {
  if (audioPlayer.value) {
    // 调用 AudioPlayer 组件的方法
    audioPlayer.value.seek(timestamp)
  }
}
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
</style> 