<template>
  <div class="workspace">
    <div class="workspace-content">
      <div class="audio-section">
        <AudioPlayer
          :audio-url="audioUrl"
          :title="audioName"
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
import { ref, computed, watch, onMounted } from 'vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import TranscriptionEditor from '@/components/TranscriptionEditor.vue'
import { audioApi } from '@/api'

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
  },
  initialTranscription: { // 添加初始转写文本属性
    type: String,
    default: ''
  }
})

const emit = defineEmits(['back', 'save', 'export'])
const audioPlayer = ref(null)
const transcription = ref(props.initialTranscription || '')
const isLoading = ref(false)
const error = ref(null)

// 格式化转写文本为编辑器需要的格式
const formatTranscription = (text) => {
  if (!text) return []
  
  // 将文本按段落分割，并为每段添加时间戳
  return text.split('\n').filter(line => line.trim()).map((content, index) => ({
    timestamp: index * 5, // 每段假设5秒
    content: content.trim()
  }))
}

// 监听音频URL变化
watch(() => props.audioUrl, () => {
  if (props.audioUrl && !props.initialTranscription) {
    fetchTranscription()
  }
})

// 获取音频转写结果
const fetchTranscription = async () => {
  if (!props.audioUrl) return
  
  try {
    isLoading.value = true
    error.value = null
    
    // 上传并转写音频
    const response = await audioApi.uploadAndTranscribe(props.audioUrl)
    transcription.value = response.text
    
  } catch (err) {
    console.error('转写失败:', err)
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

const handleAudioError = (errorMessage) => {
  error.value = errorMessage
}

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

onMounted(() => {
  if (props.initialTranscription) {
    transcription.value = props.initialTranscription
  }
})
</script> 