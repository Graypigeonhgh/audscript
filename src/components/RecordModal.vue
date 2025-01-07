<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>录音</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>
      
      <div class="modal-body">
        <!-- 音频可视化区域 -->
        <canvas ref="visualizer" class="audio-visualizer"></canvas>
        
        <div class="record-status">
          <div class="status-indicator" :class="{ 'recording': isRecording }">
            {{ isRecording ? (isPaused ? '已暂停' : '录音中...') : '准备就绪' }}
            <span class="timer" v-if="isRecording">{{ formatTime(recordingTime) }}</span>
          </div>
        </div>
        
        <!-- 录音设置 -->
        <div class="settings" v-if="!isRecording">
          <div class="setting-item">
            <label>输入设备</label>
            <select v-model="selectedDevice" class="device-select">
              <option v-for="device in audioDevices" :key="device.deviceId" :value="device.deviceId">
                {{ device.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- 预览区域 -->
        <div v-if="audioUrl" class="preview-section">
          <audio ref="audioPreview" :src="audioUrl" controls class="audio-preview"></audio>
        </div>
        
        <div class="controls">
          <!-- 暂停/继续按钮 -->
          <button 
            v-if="isRecording"
            class="control-btn"
            @click="togglePause"
            :title="isPaused ? '继续' : '暂停'"
          >
            {{ isPaused ? '▶️' : '⏸️' }}
          </button>

          <!-- 录音按钮 -->
          <button 
            class="record-btn"
            :class="{ 'recording': isRecording }"
            @click="toggleRecording"
          >
            {{ isRecording ? '停止' : '开始录音' }}
          </button>

          <!-- 取消按钮 -->
          <button 
            v-if="isRecording"
            class="control-btn"
            @click="cancelRecording"
            title="取消录音"
          >
            🗑️
          </button>

          <!-- 保存按钮 -->
          <button
            v-if="audioUrl && !isRecording"
            class="save-btn"
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
  
  analyser.fftSize = 2048
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  const canvas = visualizer.value
  const ctx = canvas.getContext('2d')
  
  const draw = () => {
    const width = canvas.width
    const height = canvas.height
    
    animationFrame = requestAnimationFrame(draw)
    analyser.getByteTimeDomainData(dataArray)
    
    ctx.fillStyle = 'var(--primary-bg)'
    ctx.fillRect(0, 0, width, height)
    ctx.lineWidth = 2
    ctx.strokeStyle = isRecording.value ? 'var(--accent-color)' : 'var(--secondary-text)'
    ctx.beginPath()
    
    const sliceWidth = width / bufferLength
    let x = 0
    
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0
      const y = v * height / 2
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
      x += sliceWidth
    }
    
    ctx.lineTo(width, height / 2)
    ctx.stroke()
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
  
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close()
    audioContext = null
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
  padding-top: 80px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--primary-bg);
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: var(--modal-shadow);
  border: 1px solid var(--border-color);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
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
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.record-btn {
  padding: 1rem 2rem;
  border-radius: 50px;
  border: none;
  background: var(--accent-color);
  color: white;
  cursor: pointer;
  transition: background 0.2s;
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
  background: var(--secondary-bg);
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s;
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
  width: 100%;
  height: 120px;
  margin-bottom: 1rem;
  background: var(--primary-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.preview-section {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--secondary-bg);
  border-radius: 8px;
}

.audio-preview {
  width: 100%;
}

.save-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
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
</style> 