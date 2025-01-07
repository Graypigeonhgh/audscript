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

        <!-- 音频可视化区域 -->
        <canvas v-if="isRecording" ref="visualizer" class="audio-visualizer"></canvas>
        
        <!-- 录音设置 -->
        <div class="settings" v-if="!isRecording">
          <div class="setting-item">
            <label>
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
              </svg>
              输入设备
            </label>
            <select v-model="selectedDevice" class="device-select">
              <option v-for="device in audioDevices" :key="device.deviceId" :value="device.deviceId">
                {{ device.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- 预览区域 -->
        <audio v-if="audioUrl" ref="audioPreview" :src="audioUrl" controls class="audio-preview"></audio>
      </div>

      <!-- 控制按钮区域 -->
      <div class="controls">
        <button 
          v-if="isRecording"
          class="control-btn"
          @click="togglePause"
          :title="isPaused ? '继续' : '暂停'"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path v-if="isPaused" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10 9v6m4-6v6" />
          </svg>
        </button>

        <button 
          class="primary-btn"
          :class="{ 'recording': isRecording }"
          @click="toggleRecording"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle v-if="!isRecording" cx="12" cy="12" r="6" stroke-width="2" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
          {{ isRecording ? '停止' : '开始录音' }}
        </button>

        <button 
          v-if="isRecording"
          class="control-btn danger"
          @click="cancelRecording"
          title="取消录音"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <button
          v-if="audioUrl && !isRecording"
          class="primary-btn"
          @click="handleSave"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          保存录音
        </button>
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

const togglePause = () => {
  isPaused.value = !isPaused.value
  if (isPaused.value) {
    mediaRecorder.pause()
    stopTimer()
  } else {
    mediaRecorder.resume()
    startTimer()
  }
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
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
    emit('save', audioBlob)
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
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--primary-bg);
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--modal-shadow);
  border: 1px solid var(--border-color);
  padding: 1rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.modal-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

.close-btn:hover {
  background: var(--secondary-bg);
  color: var(--accent-color);
}

.record-status {
  text-align: center;
  margin-bottom: 2rem;
}

.controls {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 0.75rem;
  padding: 0;
}

.record-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background: var(--accent-color);
  color: white;
  cursor: pointer;
}

.record-btn.recording {
  background: #dc2626;
}

.timer {
  display: block;
  font-size: 2rem;
  margin-top: 1rem;
}

.control-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--secondary-bg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: var(--border-color);
}

.status-indicator {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: var(--secondary-bg);
  display: inline-block;
  transition: all 0.3s;
}

.status-indicator.recording {
  background: #dc262620;
  color: #dc2626;
}

.audio-visualizer {
  height: 80px;
  width: 100%;
  background: var(--primary-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.audio-preview {
  width: 100%;
}

.save-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background: var(--accent-color);
  color: white;
  cursor: pointer;
}

.save-btn:hover {
  opacity: 0.9;
}

.settings {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--secondary-bg);
  border-radius: 8px;
}

.setting-item {
  margin-bottom: 0.5rem;
}

.device-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--primary-bg);
  color: var(--primary-text);
}

.icon {
  width: 20px;
  height: 20px;
  stroke: currentColor;
}

.status-indicator {
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
  background: var(--secondary-bg);
  transition: all 0.3s;
}

.status-indicator.recording {
  background: var(--accent-color-light);
  color: var(--accent-color);
}

.timer {
  display: block;
  font-size: 2rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

.controls {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
}

.control-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--primary-bg);
  color: var(--secondary-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.control-btn:hover {
  background: var(--hover-bg);
  color: var(--primary-text);
  transform: translateY(-1px);
}

.control-btn.danger {
  color: #dc2626;
  border-color: #dc2626;
}

.control-btn.danger:hover {
  background: #dc262610;
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  background: var(--accent-color);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--hover-shadow);
}

.primary-btn.recording {
  background: #dc2626;
}

.settings {
  padding: 1rem;
  background: var(--secondary-bg);
  border-radius: 8px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.setting-item label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--secondary-text);
}

.device-select {
  flex: 1;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--primary-bg);
  color: var(--primary-text);
}

.audio-visualizer {
  height: 80px;
  border-radius: 8px;
  background: var(--secondary-bg);
}

.audio-preview {
  width: 100%;
  border-radius: 8px;
}
</style> 