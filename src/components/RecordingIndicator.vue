<template>
  <div v-if="isRecording || isPaused" class="recording-indicator" :class="{ paused: isPaused }">
    <div class="indicator-content">
      <div class="recording-icon">
        <span class="dot" v-if="isRecording"></span>
        <svg v-else class="pause-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6"/>
        </svg>
      </div>
      <span class="recording-time">{{ formatTime(recordingTime) }}</span>
      <div class="recording-controls">
        <button v-if="isRecording" @click="pauseRecording" class="control-btn">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6"/>
          </svg>
        </button>
        <button v-else @click="resumeRecording" class="control-btn">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
          </svg>
        </button>
        <button @click="stopRecording" class="control-btn stop">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="6" y="6" width="12" height="12" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAudioStore } from '@/stores/audioStore'
import { storeToRefs } from 'pinia'

const audioStore = useAudioStore()
const { isRecording, isPaused, recordingTime } = storeToRefs(audioStore)
const { pauseRecording, resumeRecording, stopRecording } = audioStore

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.recording-indicator {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: var(--accent-color);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.recording-indicator.paused {
  background: var(--secondary-bg);
  color: var(--primary-text);
  border: 1px solid var(--border-color);
}

.indicator-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.recording-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.dot {
  width: 12px;
  height: 12px;
  background: #ff4444;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.pause-icon {
  width: 20px;
  height: 20px;
}

.recording-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  background: none;
  border: none;
  color: inherit;
  padding: 0.25rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.control-btn.stop {
  color: #ff4444;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style> 