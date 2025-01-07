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
        <!-- 设备选择 -->
        <div class="input-group">
          <label for="device">选择录音设备</label>
          <select 
            id="device" 
            v-model="selectedDevice"
            class="form-input"
          >
            <option value="">默认设备</option>
            <option v-for="device in audioDevices" 
              :key="device.deviceId" 
              :value="device.deviceId"
            >
              {{ device.label }}
            </option>
          </select>
        </div>

        <!-- 录音格式选择 -->
        <div class="input-group">
          <label for="format">录音格式</label>
          <select 
            id="format" 
            v-model="audioFormat"
            class="form-input"
          >
            <option value="audio/webm">WebM</option>
            <option value="audio/mp4">MP4</option>
            <option value="audio/wav">WAV</option>
          </select>
        </div>

        <!-- 音频可视化 -->
        <div class="visualizer-container">
          <canvas ref="visualizer" class="visualizer"></canvas>
          <div class="recording-info">
            <span class="status" :class="{ 'recording': isRecording }">
              {{ getStatusText() }}
            </span>
            <span class="time">{{ formatTime(recordingTime) }}</span>
          </div>
          <div class="volume-meter" v-if="isRecording">
            <div class="volume-bar" :style="{ width: volumeLevel + '%' }"></div>
          </div>
        </div>

        <!-- 录音控制 -->
        <div class="record-controls">
          <button 
            class="control-btn"
            @click="toggleRecording"
            :class="{ 'recording': isRecording }"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <path v-if="!isRecording" d="M9 9v6l6-3-6-3z" fill="currentColor" />
              <rect v-else x="9" y="9" width="6" height="6" />
            </svg>
            {{ isRecording ? '停止' : '开始录音' }}
          </button>
          
          <button 
            v-if="isRecording"
            class="control-btn"
            @click="togglePause"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <path v-if="isPaused" d="M10 9v6l4-3-4-3z" fill="currentColor" />
              <path v-else d="M9 9h2v6H9zM13 9h2v6h-2z" fill="currentColor" />
            </svg>
            {{ isPaused ? '继续' : '暂停' }}
          </button>
        </div>

        <!-- 录音预览 -->
        <div v-if="audioUrl" class="audio-preview">
          <audio :src="audioUrl" controls class="audio-player"></audio>
          <div class="preview-controls">
            <button class="primary-btn" @click="handleSave">保存录音</button>
            <button class="secondary-btn" @click="handleRetry">重新录制</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '@/assets/styles/modal.scss';

.visualizer-container {
  width: 100%;
  background: var(--secondary-bg);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  
  .visualizer {
    width: 100%;
    height: 120px;
    background: var(--primary-bg);
    border-radius: 8px;
  }
}

.recording-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  
  .status {
    font-size: 0.9rem;
    color: var(--secondary-text);
    
    &.recording {
      color: var(--accent-color);
      animation: blink 1s infinite;
    }
  }
  
  .time {
    font-family: monospace;
    font-size: 1.1rem;
    color: var(--primary-text);
  }
}

.volume-meter {
  width: 100%;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
  
  .volume-bar {
    height: 100%;
    background: var(--accent-color);
    transition: width 0.1s ease;
  }
}

.record-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--secondary-bg);
  color: var(--primary-text);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--border-color);
  }
  
  &.recording {
    background: var(--accent-color);
    color: white;
    
    &:hover {
      background: var(--accent-color-dark, var(--accent-color));
    }
  }
  
  .icon {
    width: 24px;
    height: 24px;
  }
}

.audio-preview {
  width: 100%;
  
  .audio-player {
    width: 100%;
    margin-bottom: 1rem;
  }
  
  .preview-controls {
    display: flex;
    gap: 1rem;
    
    button {
      flex: 1;
    }
  }
}

@keyframes blink {
  50% { opacity: 0.6; }
}

.secondary-btn {
  @extend .primary-btn;
  background: var(--secondary-bg);
  color: var(--primary-text);
  
  &:hover {
    background: var(--border-color);
    transform: translateY(-2px);
  }
}
</style>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['close', 'save'])
const visualizer = ref(null)
const isRecording = ref(false)
const isPaused = ref(false)
const recordingTime = ref(0)
const audioUrl = ref(null)
const audioDevices = ref([])
const selectedDevice = ref('')
const audioFormat = ref('audio/webm')
const volumeLevel = ref(0)

let mediaRecorder = null
let audioContext = null
let analyser = null
let timer = null
let audioChunks = []
let animationFrame = null

// 获取音频设备列表
const getAudioDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    audioDevices.value = devices.filter(device => device.kind === 'audioinput')
  } catch (error) {
    console.error('获取音频设备失败:', error)
  }
}

// 开始计时器
const startTimer = () => {
  timer = setInterval(() => {
    recordingTime.value++
  }, 1000)
}

// 停止计时器
const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 开始可视化
const startVisualization = () => {
  if (!analyser || !visualizer.value) return
  
  const canvas = visualizer.value
  const ctx = canvas.getContext('2d')
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  
  const draw = () => {
    animationFrame = requestAnimationFrame(draw)
    analyser.getByteFrequencyData(dataArray)
    
    ctx.fillStyle = 'var(--primary-bg)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    const barWidth = (canvas.width / bufferLength) * 2.5
    let barHeight
    let x = 0
    
    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * canvas.height
      
      ctx.fillStyle = `hsl(${(i / bufferLength) * 360}, 70%, 60%)`
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
      
      x += barWidth + 1
    }
    
    // 更新音量级别
    const sum = dataArray.reduce((a, b) => a + b, 0)
    const average = sum / bufferLength
    volumeLevel.value = Math.min(100, (average / 255) * 150)
  }
  
  draw()
}

// 停止可视化
const stopVisualization = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
  
  if (visualizer.value) {
    const ctx = visualizer.value.getContext('2d')
    ctx.clearRect(0, 0, visualizer.value.width, visualizer.value.height)
  }
  
  volumeLevel.value = 0
}

// 获取状态文本
const getStatusText = () => {
  if (!isRecording.value) return '准备就绪'
  if (isPaused.value) return '已暂停'
  return '录音中...'
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 开始录音
const startRecording = async () => {
  try {
    const constraints = {
      audio: selectedDevice.value ? { deviceId: selectedDevice.value } : true
    }
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    setupAudioContext(stream)
    
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: audioFormat.value
    })
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.push(e.data)
      }
    }
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: audioFormat.value })
      audioUrl.value = URL.createObjectURL(blob)
    }
    
    mediaRecorder.start(1000)
    isRecording.value = true
    startTimer()
    startVisualization()
  } catch (error) {
    console.error('开始录音失败:', error)
  }
}

// 设置音频上下文和分析器
const setupAudioContext = (stream) => {
  audioContext = new AudioContext()
  analyser = audioContext.createAnalyser()
  const source = audioContext.createMediaStreamSource(stream)
  source.connect(analyser)
  analyser.fftSize = 2048
}

// 暂停/继续录音
const togglePause = () => {
  if (isPaused.value) {
    mediaRecorder.resume()
    startTimer()
  } else {
    mediaRecorder.pause()
    stopTimer()
  }
  isPaused.value = !isPaused.value
}

// 停止录音
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

// 重新录制
const handleRetry = () => {
  audioChunks = []
  audioUrl.value = null
  recordingTime.value = 0
  startRecording()
}

// 保存录音
const handleSave = () => {
  emit('save', {
    url: audioUrl.value,
    duration: recordingTime.value,
    format: audioFormat.value
  })
}

// 关闭模态框
const handleClose = () => {
  if (isRecording.value) {
    stopRecording()
  }
  emit('close')
}

// 开始/停止录音
const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    audioChunks = []
    startRecording()
  }
}

onMounted(() => {
  getAudioDevices()
  if (visualizer.value) {
    visualizer.value.width = visualizer.value.offsetWidth
    visualizer.value.height = visualizer.value.offsetHeight
  }
})

onBeforeUnmount(() => {
  stopTimer()
  stopVisualization()
  if (isRecording.value) {
    stopRecording()
  }
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
})
</script> 