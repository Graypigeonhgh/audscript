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
      <button class="control-btn" @click="skipBackward" :disabled="isLoadingAudio">
        ⏪
      </button>
      <button class="control-btn play-btn" @click="togglePlay" :disabled="isLoadingAudio">
        {{ isPlaying ? '⏸️' : '▶️' }}
      </button>
      <button class="control-btn" @click="skipForward" :disabled="isLoadingAudio">
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
          :disabled="isLoadingAudio"
        >
      </div>
    </div>

    <div v-if="isLoadingAudio" class="loading-indicator">
      加载中...
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

const emit = defineEmits(['error'])

const audio = new Audio()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const progress = ref(0)

const handleError = (error) => {
  console.error('音频播放错误:', error)
  emit('error', '音频加载失败，请检查文件格式是否正确')
}

const isLoading = ref(false)
const isLoadingAudio = ref(false)

const togglePlay = async () => {
  try {
    if (isPlaying.value) {
      await audio.pause()
      isPlaying.value = false
    } else {
      if (!isLoadingAudio.value) {
        isLoading.value = true
        try {
          await audio.play()
          isPlaying.value = true
        } catch (err) {
          console.error('播放失败:', err)
          emit('error', '音频播放失败，请重试')
        }
      }
    }
  } catch (err) {
    console.error('音频控制失败:', err)
    emit('error', '音频控制失败，请重试')
  } finally {
    isLoading.value = false
  }
}

const handleLoadedData = () => {
  console.log('音频加载完成')
  isLoadingAudio.value = false
  duration.value = audio.duration
}

watch(() => props.audioUrl, (newUrl) => {
  if (newUrl) {
    console.log('音频URL更新:', newUrl)
    isLoadingAudio.value = true
    isPlaying.value = false
    audio.src = newUrl
    
    const preloadAudio = async () => {
      try {
        await audio.load()
        console.log('音频预加载完成')
      } catch (err) {
        console.error('音频预加载失败:', err)
        emit('error', '音频加载失败，请检查网络连接')
      }
    }
    preloadAudio()
  }
})

onMounted(() => {
  if (props.audioUrl) {
    console.log('组件挂载，加载音频:', props.audioUrl)
    isLoadingAudio.value = true
    audio.src = props.audioUrl
    audio.load()
  }

  const savedVolume = localStorage.getItem('audioVolume')
  if (savedVolume !== null) {
    volume.value = parseFloat(savedVolume)
    audio.volume = volume.value
  }

  audio.addEventListener('timeupdate', updateProgress)
  audio.addEventListener('loadeddata', handleLoadedData)
  audio.addEventListener('ended', () => {
    isPlaying.value = false
  })
  audio.addEventListener('error', handleError)
  
  audio.addEventListener('waiting', () => {
    isLoadingAudio.value = true
  })
  audio.addEventListener('canplay', () => {
    isLoadingAudio.value = false
  })
})

onUnmounted(() => {
  audio.removeEventListener('timeupdate', updateProgress)
  audio.removeEventListener('loadeddata', handleLoadedData)
  audio.removeEventListener('error', handleError)
  audio.pause()
})

watch(volume, (newVolume) => {
  audio.volume = newVolume
  localStorage.setItem('audioVolume', newVolume)
})

const updateProgress = () => {
  if (!audio.duration) return
  currentTime.value = audio.currentTime
  progress.value = (audio.currentTime / audio.duration) * 100
}

const seek = (event) => {
  if (!audio.duration) return
  const rect = event.target.getBoundingClientRect()
  const pos = (event.clientX - rect.left) / rect.width
  audio.currentTime = pos * audio.duration
}

const skipForward = () => {
  if (!audio.duration) return
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

defineExpose({
  seek: (time) => {
    if (audio && !isNaN(time)) {
      audio.currentTime = time
    }
  }
})
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

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.volume-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 