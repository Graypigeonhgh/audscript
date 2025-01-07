<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>录音</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body">
        <div class="record-status">
          {{ isRecording ? '录音中...' : '准备就绪' }}
          <span class="timer" v-if="isRecording">{{ formatTime(recordingTime) }}</span>
        </div>
        
        <div class="controls">
          <button 
            class="record-btn"
            :class="{ 'recording': isRecording }"
            @click="toggleRecording"
          >
            {{ isRecording ? '停止' : '开始录音' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isRecording = ref(false)
const recordingTime = ref(0)
let timer = null

const toggleRecording = () => {
  isRecording.value = !isRecording.value
  
  if (isRecording.value) {
    // TODO: 开始录音
    startTimer()
  } else {
    // TODO: 停止录音
    stopTimer()
  }
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
}

.record-status {
  text-align: center;
  margin-bottom: 2rem;
}

.controls {
  display: flex;
  justify-content: center;
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
</style> 