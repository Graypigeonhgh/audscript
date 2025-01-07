<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>录音</h2>
        <button class="close-btn" @click="handleClose">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- 录音状态显示 -->
        <div class="record-status">
          <div class="status-indicator" :class="{ 'recording': isRecording }">
            <span class="status-text">{{ getStatusText() }}</span>
            <span v-if="isRecording" class="timer">{{ formatTime(recordingTime) }}</span>
          </div>
        </div>

        <!-- 录音控制按钮 -->
        <div class="record-controls">
          <button 
            class="primary-btn"
            @click="toggleRecording"
          >
            {{ isRecording ? '停止录音' : '开始录音' }}
          </button>
          
          <!-- 添加保存按钮 -->
          <button 
            v-if="audioUrl"
            class="primary-btn"
            @click="handleSave"
          >
            保存录音
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['close', 'save'])
const isRecording = ref(false)
const isPaused = ref(false)
const recordingTime = ref(0)
const audioUrl = ref(null)
const visualizer = ref(null)
const audioDevices = ref([])
const selectedDevice = ref('')
let timer = null
let mediaRecorder = null
let audioChunks = []
let audioContext = null
let analyser = null
let animationFrame = null

// 获取音频设备列表
const getAudioDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    audioDevices.value = devices.filter(device => device.kind === 'audioinput')
    if (audioDevices.value.length > 0) {
      selectedDevice.value = audioDevices.value[0].deviceId
    }
  } catch (err) {
    console.error('获取音频设备失败:', err)
  }
}

// 初始化音频可视化
const initAudioVisualizer = (stream) => {
  if (!visualizer.value) return
  
  audioContext = new (window.AudioContext || window.webkitAudioContext)()
  analyser = audioContext.createAnalyser()
  const source = audioContext.createMediaStreamSource(stream)
  source.connect(analyser)
  
  analyser.fftSize = 256
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  const canvas = visualizer.value
  const ctx = canvas.getContext('2d')
  
  canvas.width = canvas.offsetWidth * window.devicePixelRatio
  canvas.height = canvas.offsetHeight * window.devicePixelRatio
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  
  const draw = () => {
    if (!isRecording.value) return
    
    animationFrame = requestAnimationFrame(draw)
    analyser.getByteFrequencyData(dataArray)
    
    const width = canvas.width / window.devicePixelRatio
    const height = canvas.height / window.devicePixelRatio
    const barWidth = width / bufferLength * 2.5
    let barHeight
    let x = 0
    
    ctx.fillStyle = 'var(--primary-bg)'
    ctx.fillRect(0, 0, width, height)
    
    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * height * 0.7
      
      const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight)
      gradient.addColorStop(0, 'var(--accent-color)')
      gradient.addColorStop(1, 'var(--accent-color-light, var(--accent-color))')
      
      ctx.fillStyle = gradient
      ctx.fillRect(x, height - barHeight, barWidth, barHeight)
      
      x += barWidth + 1
    }
  }
  
  draw()
}

const toggleRecording = async () => {
  if (!isRecording.value) {
    try {
      if (audioContext && audioContext.state !== 'closed') {
        await audioContext.close()
      }
      audioContext = null
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDevice.value ? { exact: selectedDevice.value } : undefined
        }
      })
      
      mediaRecorder = new MediaRecorder(stream)
      audioChunks = []
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        if (audioUrl.value) {
          URL.revokeObjectURL(audioUrl.value)
        }
        audioUrl.value = URL.createObjectURL(audioBlob)
      }
      
      mediaRecorder.start()
      isRecording.value = true
      startTimer()
      initAudioVisualizer(stream)
    } catch (err) {
      console.error('录音权限被拒绝:', err)
    }
  } else {
    stopRecording()
  }
}

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
    mediaRecorder.stream.getTracks().forEach(track => track.stop())
  }
  isRecording.value = false
  isPaused.value = false
  stopTimer()
  stopVisualization()
}

const cancelRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stream.getTracks().forEach(track => track.stop())
  }
  isRecording.value = false
  isPaused.value = false
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = null
  }
  stopTimer()
  stopVisualization()
  audioChunks = []
}

const handleSave = () => {
  if (audioUrl.value) {
    emit('save', {
      url: audioUrl.value,
      duration: recordingTime.value
    })
  }
}

const handleClose = () => {
  if (isRecording.value) {
    cancelRecording()
  }
  emit('close')
}

const startTimer = () => {
  timer = setInterval(() => {
    recordingTime.value++
  }, 1000)
}

const stopTimer = () => {
  clearInterval(timer)
}

const stopVisualization = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
  
  if (visualizer.value) {
    const ctx = visualizer.value.getContext('2d')
    ctx.clearRect(0, 0, visualizer.value.width, visualizer.value.height)
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 获取状态文本
const getStatusText = () => {
  if (!isRecording.value) return '准备就绪'
  return isPaused.value ? '已暂停' : '录音中...'
}

onMounted(() => {
  getAudioDevices()
})

onBeforeUnmount(() => {
  if (isRecording.value) {
    cancelRecording()
  } else {
    stopVisualization()
  }
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
})
</script>

<style lang="scss">
@import '@/assets/styles/modal.scss';

/* 只保留录音特有的样式 */
.record-status {
  text-align: center;
  padding: 2rem 0;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  border-radius: 8px;
  background: var(--secondary-bg);
  color: var(--primary-text);
  
  &.recording {
    background: var(--accent-color);
    color: white;
    animation: pulse 1.5s ease-in-out infinite;
  }
}

.status-text {
  font-weight: 500;
}

.timer {
  font-family: monospace;
  font-size: 1.1rem;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

.record-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style> 