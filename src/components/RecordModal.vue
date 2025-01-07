<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>录音</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body">
        <div class="record-status">
          <div class="status-indicator" :class="{ 'recording': isRecording }">
            {{ isRecording ? (isPaused ? '已暂停' : '录音中...') : '准备就绪' }}
            <span class="timer" v-if="isRecording">{{ formatTime(recordingTime) }}</span>
          </div>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close', 'save'])
const isRecording = ref(false)
const isPaused = ref(false)
const recordingTime = ref(0)
let timer = null
let mediaRecorder = null
let audioChunks = []

const toggleRecording = async () => {
  if (!isRecording.value) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream)
      audioChunks = []
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        emit('save', audioBlob)
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
  stopTimer()
  emit('close')
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
  stopTimer()
  emit('close')
}

const startTimer = () => {
  timer = setInterval(() => {
    recordingTime.value++
  }, 1000)
}

const stopTimer = () => {
  clearInterval(timer)
  recordingTime.value = 0
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const initAudioVisualizer = (stream) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const analyser = audioContext.createAnalyser()
  const source = audioContext.createMediaStreamSource(stream)
  source.connect(analyser)
  
  // 这里可以添加可视化的具体实现
  console.log('音频可视化初始化完成')
}
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
}

.modal-content {
  background: var(--primary-bg);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  padding: 1.5rem;
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
</style> 