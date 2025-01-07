<template>
  <div class="audio-player">
    <div class="player-info">
      <div class="audio-title">{{ title || '未命名音频' }}</div>
      <div class="time-info">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </div>
    </div>

    <div class="progress-bar" @click="seek">
      <div class="progress" :style="{ width: progress + '%' }"></div>
    </div>

    <div class="controls">
      <button class="control-btn" @click="skipBackward">
        ⏪
      </button>
      <button class="control-btn play-btn" @click="togglePlay">
        {{ isPlaying ? '⏸️' : '▶️' }}
      </button>
      <button class="control-btn" @click="skipForward">
        ⏩
      </button>
      <div class="volume-control">
        🔊
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.1" 
          v-model="volume"
          class="volume-slider"
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  audioUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  }
})

const audio = new Audio()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const progress = ref(0)

onMounted(() => {
  audio.src = props.audioUrl
  audio.addEventListener('timeupdate', updateProgress)
  audio.addEventListener('loadedmetadata', () => {
    duration.value = audio.duration
  })
  audio.addEventListener('ended', () => {
    isPlaying.value = false
  })
})

onUnmounted(() => {
  audio.removeEventListener('timeupdate', updateProgress)
  audio.pause()
})

watch(volume, (newVolume) => {
  audio.volume = newVolume
})

const togglePlay = () => {
  if (isPlaying.value) {
    audio.pause()
  } else {
    audio.play()
  }
  isPlaying.value = !isPlaying.value
}

const updateProgress = () => {
  currentTime.value = audio.currentTime
  progress.value = (audio.currentTime / audio.duration) * 100
}

const seek = (event) => {
  const rect = event.target.getBoundingClientRect()
  const pos = (event.clientX - rect.left) / rect.width
  audio.currentTime = pos * audio.duration
}

const skipForward = () => {
  audio.currentTime = Math.min(audio.currentTime + 10, audio.duration)
}

const skipBackward = () => {
  audio.currentTime = Math.max(audio.currentTime - 10, 0)
}

const formatTime = (time) => {
  if (!time) return '00:00'
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.audio-player {
  background: var(--secondary-bg);
  border-radius: 12px;
  padding: 1rem;
  width: 100%;
}

.player-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.audio-title {
  font-weight: 500;
}

.time-info {
  color: var(--secondary-text);
  font-size: 0.9rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  cursor: pointer;
  margin: 1rem 0;
}

.progress {
  height: 100%;
  background: var(--accent-color);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.control-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
}

.play-btn {
  font-size: 1.5rem;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.volume-slider {
  width: 100px;
}
</style> 