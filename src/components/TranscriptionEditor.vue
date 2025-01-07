<template>
  <div class="editor-container">
    <div class="editor-header">
      <div class="editor-title">
        <input 
          type="text" 
          v-model="title" 
          placeholder="未命名文档"
          class="title-input"
        >
      </div>
      <div class="editor-controls">
        <button class="control-btn" @click="handleSave">
          保存
        </button>
        <button class="control-btn" @click="handleExport">
          导出
        </button>
      </div>
    </div>

    <div class="editor-content">
      <div class="timestamp-section">
        <div 
          v-for="(block, index) in transcriptionBlocks" 
          :key="index"
          class="timestamp-block"
          @click="seekAudio(block.timestamp)"
        >
          <span class="timestamp">{{ formatTime(block.timestamp) }}</span>
          <textarea
            v-model="block.content"
            class="content-textarea"
            rows="2"
            @input="autoResize($event.target)"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  initialTranscription: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'export', 'seek'])

const title = ref('未命名文档')
const transcriptionBlocks = ref(props.initialTranscription.length > 0 
  ? props.initialTranscription 
  : [{ timestamp: 0, content: '' }]
)

const handleSave = () => {
  emit('save', {
    title: title.value,
    blocks: transcriptionBlocks.value
  })
}

const handleExport = () => {
  emit('export', {
    title: title.value,
    blocks: transcriptionBlocks.value
  })
}

const seekAudio = (timestamp) => {
  emit('seek', timestamp)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const autoResize = (textarea) => {
  textarea.style.height = 'auto'
  textarea.style.height = textarea.scrollHeight + 'px'
}

onMounted(() => {
  // 初始化时自动调整所有文本框高度
  document.querySelectorAll('.content-textarea').forEach(autoResize)
})
</script>

<style scoped>
.editor-container {
  background: var(--primary-bg);
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-input {
  font-size: 1.2rem;
  font-weight: 600;
  border: none;
  background: transparent;
  color: var(--primary-text);
  width: 100%;
  padding: 0.5rem;
}

.title-input:focus {
  outline: none;
  background: var(--secondary-bg);
  border-radius: 4px;
}

.editor-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--secondary-bg);
  color: var(--primary-text);
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.timestamp-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timestamp-block {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.timestamp {
  color: var(--secondary-text);
  font-family: monospace;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  min-width: 60px;
}

.timestamp:hover {
  background: var(--secondary-bg);
  color: var(--accent-color);
}

.content-textarea {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--primary-text);
  resize: none;
  padding: 0.5rem;
  font-size: 1rem;
  line-height: 1.5;
  min-height: 2.5rem;
}

.content-textarea:focus {
  outline: none;
  background: var(--secondary-bg);
  border-radius: 4px;
}
</style> 