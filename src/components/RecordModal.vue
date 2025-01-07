<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isPreviewMode ? '录音预览' : '录音' }}</h2>
        <button class="close-btn" @click="handleClose">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- 录音模式 -->
        <div v-if="!isPreviewMode">
          <!-- 设备选择 -->
          <div class="input-group">
            <label for="device">选择录音设备</label>
            <select 
              id="device" 
              v-model="selectedDevice"
              class="form-input"
              :disabled="isRecording"
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
              :disabled="isRecording"
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
              <span class="time">
                {{ formatTime(recordingTime) }}
                <span class="time-limit" v-if="isRecording">
                  / {{ formatTime(maxDuration) }}
                </span>
              </span>
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
              :class="{ 
                'recording': isRecording,
                'processing': isProcessing 
              }"
              :disabled="!isDeviceReady || isProcessing || isInitializing"
            >
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <path v-if="!isRecording" d="M9 9v6l6-3-6-3z" fill="currentColor" />
                <rect v-else x="9" y="9" width="6" height="6" />
              </svg>
              {{ getButtonText() }}
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
        </div>

        <!-- 预览模式 -->
        <div v-else class="preview-mode">
          <div class="audio-player-container">
            <div class="audio-controls">
              <input 
                type="range" 
                class="progress-bar"
                :value="currentTime"
                :max="duration"
                @input="handleSeek"
              >
              <div class="time-display">
                <span>{{ formatTime(currentTime) }}</span>
                <span>{{ formatTime(duration) }}</span>
              </div>
            </div>
            
            <div class="playback-controls">
              <button class="control-btn" @click="skipBackward">
                <svg class="icon" viewBox="0 0 24 24">
                  <path d="M12 5v14l-10-7 10-7z" />
                </svg>
                -10s
              </button>
              
              <button class="control-btn primary" @click="togglePlay">
                <svg class="icon" viewBox="0 0 24 24">
                  <path v-if="isPlaying" d="M6 4h4v16H6zm8 0h4v16h-4z" />
                  <path v-else d="M8 5v14l11-7z" />
                </svg>
              </button>
              
              <button class="control-btn" @click="skipForward">
                <svg class="icon" viewBox="0 0 24 24">
                  <path d="M12 5v14l10-7-10-7z" />
                </svg>
                +10s
              </button>
            </div>
            
            <div class="speed-control">
              <label>播放速度:</label>
              <select v-model="playbackRate" @change="changePlaybackRate">
                <option v-for="rate in playbackRates" :key="rate" :value="rate">
                  {{ rate }}x
                </option>
              </select>
            </div>
          </div>

          <div class="preview-actions">
            <button class="secondary-btn" @click="handleDownload">
              <svg class="icon" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              下载录音
            </button>
            <button class="danger-btn" @click="handleDelete">
              <svg class="icon" viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
              删除录音
            </button>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- 快捷键提示 -->
        <div class="shortcut-tips" v-if="isDeviceReady && !isRecording && !isPreviewMode">
          <span>空格键: 开始/暂停录音</span>
          <span>ESC: 关闭窗口</span>
        </div>
      </div>
    </div>

    <!-- 添加确认对话框 -->
    <div v-if="showConfirmDialog" class="confirm-dialog-overlay">
      <div class="confirm-dialog">
        <div class="confirm-dialog-content">
          <svg class="warning-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
          <h3>确认删除</h3>
          <p>确定要删除这段录音吗？此操作无法撤销。</p>
        </div>
        <div class="confirm-dialog-actions">
          <button class="cancel-btn" @click="showConfirmDialog = false">
            取消
          </button>
          <button class="confirm-btn" @click="confirmDelete">
            删除
          </button>
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

.error-message {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.time-limit {
  color: var(--secondary-text);
  font-size: 0.9rem;
}

.control-btn {
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      background: var(--secondary-bg);
      transform: none;
    }
  }
}

.recording-info {
  .time {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }
}

.control-btn {
  &.processing {
    opacity: 0.7;
    cursor: wait;
    animation: pulse 1.5s infinite;
  }
}

.shortcut-tips {
  text-align: center;
  color: var(--secondary-text);
  font-size: 0.8rem;
  margin-top: 0.5rem;
  
  span {
    margin: 0 0.5rem;
    padding: 0.2rem 0.5rem;
    background: var(--secondary-bg);
    border-radius: 4px;
  }
}

@keyframes pulse {
  0% { opacity: 0.7; }
  50% { opacity: 0.4; }
  100% { opacity: 0.7; }
}

.preview-mode {
  .audio-player-container {
    background: linear-gradient(180deg, var(--secondary-bg) 0%, var(--primary-bg) 100%);
    border-radius: 24px;
    padding: 2.5rem;
    margin: 1.5rem auto;
    max-width: 600px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    
    .audio-controls {
      margin-bottom: 2rem;
      
      .progress-bar {
        width: 100%;
        height: 8px;
        appearance: none;
        -webkit-appearance: none;
        background: rgba(var(--accent-color-rgb), 0.1);
        border-radius: 4px;
        outline: none;
        margin-bottom: 1rem;
        cursor: pointer;
        position: relative;
        transition: all 0.2s ease;
        
        &:hover {
          height: 10px;
        }
        
        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: var(--accent-color);
          border: 4px solid #fff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
          
          &:hover {
            transform: scale(1.2);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
          }
        }
      }
      
      .time-display {
        display: flex;
        justify-content: space-between;
        font-family: 'SF Mono', monospace;
        color: var(--secondary-text);
        font-size: 0.9rem;
        padding: 0 0.5rem;
      }
    }
    
    .playback-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 2rem;
      margin: 2rem 0;
      
      .control-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem;
        min-width: 48px;
        height: 48px;
        border: none;
        border-radius: 50%;
        background: rgba(var(--secondary-bg-rgb), 0.5);
        color: var(--primary-text);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        
        .icon {
          width: 24px;
          height: 24px;
        }
        
        &:hover {
          background: var(--border-color);
          transform: translateY(-2px);
        }
        
        &.primary {
          background: var(--accent-color);
          color: white;
          padding: 1.25rem;
          min-width: 64px;
          height: 64px;
          
          .icon {
            width: 32px;
            height: 32px;
          }
          
          &:hover {
            background: var(--accent-color-dark, var(--accent-color));
            transform: translateY(-3px);
            box-shadow: 0 8px 16px rgba(var(--accent-color-rgb), 0.3);
          }
        }
      }
    }
    
    .speed-control {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.5rem;
      
      label {
        color: var(--secondary-text);
        font-size: 0.9rem;
        font-weight: 500;
      }
      
      select {
        padding: 0.5rem 2rem 0.5rem 1rem;
        border-radius: 20px;
        border: 1px solid var(--border-color);
        background: var(--primary-bg);
        color: var(--primary-text);
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.5rem center;
        
        &:hover {
          border-color: var(--accent-color);
          transform: translateY(-1px);
        }
        
        &:focus {
          outline: none;
          border-color: var(--accent-color);
          box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb), 0.1);
        }
      }
    }
  }
  
  .preview-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 2rem;
    
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      width: 100%;
      height: 44px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      
      .icon {
        width: 20px;
        height: 20px;
      }
      
      &.secondary-btn {
        background: var(--secondary-bg);
        color: var(--primary-text);
        
        &:hover {
          background: var(--border-color);
          transform: translateY(-2px);
        }
      }
      
      &.danger-btn {
        background: rgba(220, 38, 38, 0.1);
        color: #dc2626;
        
        &:hover {
          background: rgba(220, 38, 38, 0.15);
          transform: translateY(-2px);
        }
      }
    }
  }
}

// 添加确认对话框样式
.confirm-dialog-overlay {
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
}

.confirm-dialog {
  background: var(--primary-bg);
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: dialogSlideIn 0.2s ease-out;

  .confirm-dialog-content {
    text-align: center;
    margin-bottom: 1.5rem;

    .warning-icon {
      width: 48px;
      height: 48px;
      fill: #f59e0b;
      margin-bottom: 1rem;
    }

    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--primary-text);
    }

    p {
      color: var(--secondary-text);
      font-size: 0.95rem;
      line-height: 1.5;
    }
  }

  .confirm-dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;

    button {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &.cancel-btn {
        background: var(--secondary-bg);
        color: var(--primary-text);
        border: none;

        &:hover {
          background: var(--border-color);
        }
      }

      &.confirm-btn {
        background: #dc2626;
        color: white;
        border: none;

        &:hover {
          background: #b91c1c;
        }
      }
    }
  }
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

// 只定义 emits
const emit = defineEmits(['close'])

// 响应式变量定义
const visualizer = ref(null)
const isRecording = ref(false)
const isPaused = ref(false)
const recordingTime = ref(0)
const audioUrl = ref(null)
const audioDevices = ref([])
const selectedDevice = ref('')
const audioFormat = ref('audio/webm')
const volumeLevel = ref(0)
const maxDuration = ref(300) // 最大录音时长（秒）
const errorMessage = ref('')
const isDeviceReady = ref(false)
const isInitializing = ref(false)
const isProcessing = ref(false)
const shortcutEnabled = ref(true)
const isPreviewMode = ref(false)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const playbackRate = ref(1)
const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2]
const audioElement = ref(null)
const showConfirmDialog = ref(false)

// 非响应式变量
let mediaRecorder = null
let audioContext = null
let analyser = null
let timer = null
let audioChunks = []

// 获取按钮文本
const getButtonText = () => {
  if (isProcessing.value) return '处理中...'
  if (isRecording.value) return '停止录音'
  return '开始录音'
}

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 添加录音格式检测函数
const getSupportedMimeTypes = () => {
  const types = [
    'audio/webm',
    'audio/mp4',
    'audio/wav',
    'audio/ogg'
  ]
  return types.filter(type => MediaRecorder.isTypeSupported(type))
}

// 修改获取音频设备列表函数
const getAudioDevices = async () => {
  try {
    // 先请求权限
    await navigator.mediaDevices.getUserMedia({ audio: true })
    const devices = await navigator.mediaDevices.enumerateDevices()
    audioDevices.value = devices.filter(device => device.kind === 'audioinput')
    isDeviceReady.value = true
    errorMessage.value = ''
  } catch (error) {
    console.error('获取音频设备失败:', error)
    errorMessage.value = '无法访问麦克风，请检查设备权限'
    isDeviceReady.value = false
  }
}

// 开始录音
const startRecording = async () => {
  try {
    isProcessing.value = true
    
    // 获取音频流
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: selectedDevice.value ? { exact: selectedDevice.value } : undefined,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    })
    
    // 创建音频上下文
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)
    
    // 配置分析器节点
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8
    
    // 连接节点
    source.connect(analyser)
    
    // 创建 MediaRecorder
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: audioFormat.value
    })
    
    // 设置数据处理
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.push(e.data)
      }
    }
    
    // 开始录音
    mediaRecorder.start()
    isRecording.value = true
    startTimer()
    
    // 开始可视化（只在非暂停状态下）
    if (!isPaused.value) {
      requestAnimationFrame(draw)
    }
    
  } catch (error) {
    console.error('开始录音失败:', error)
    errorMessage.value = '无法访问麦克风，请检查设备权限'
  } finally {
    isProcessing.value = false
  }
}

// 音频可视化
const draw = () => {
  if (!visualizer.value || !analyser || !isRecording.value) return
  
  const ctx = visualizer.value.getContext('2d')
  const width = visualizer.value.width
  const height = visualizer.value.height
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  
  analyser.getByteFrequencyData(dataArray)
  
  // 清除画布
  ctx.clearRect(0, 0, width, height)
  
  // 创建渐变
  const gradient = ctx.createLinearGradient(0, 0, width, 0)
  gradient.addColorStop(0, 'rgb(99, 102, 241)') // 主题色
  gradient.addColorStop(1, isPaused.value ? 'rgb(148, 163, 184)' : 'rgb(168, 85, 247)') // 暂停时使用灰色
  
  ctx.fillStyle = gradient
  
  // 计算条形宽度和间距
  const barWidth = (width / bufferLength) * 2.5
  const barSpacing = 2
  let x = 0
  
  // 绘制频谱
  for (let i = 0; i < bufferLength; i++) {
    let barHeight = (dataArray[i] / 255) * height
    
    // 如果暂停，显示静止的频谱
    if (isPaused.value) {
      barHeight = Math.min(barHeight, height * 0.1) // 限制暂停时的频谱高度
    }
    
    ctx.fillRect(x, height - barHeight, barWidth, barHeight)
    x += barWidth + barSpacing
  }
  
  // 更新音量电平
  const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength
  volumeLevel.value = isPaused.value ? 0 : Math.min(100, (average / 255) * 100)
  
  // 只在非暂停状态下继续动画
  if (isRecording.value && !isPaused.value) {
    requestAnimationFrame(draw)
  }
}

// 计时器
const startTimer = () => {
  stopTimer()
  timer = setInterval(() => {
    if (!isPaused.value) {
      recordingTime.value++
      if (recordingTime.value >= maxDuration.value) {
        stopRecording()
      }
    }
  }, 1000)
}

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 添加设备检测和初始化函数
const initializeRecording = async () => {
  try {
    isInitializing.value = true
    errorMessage.value = ''
    
    // 获取可用的音频设备
    await getAudioDevices()
    
    // 检查音频格式支持
    const supportedTypes = getSupportedMimeTypes()
    if (supportedTypes.length === 0) {
      throw new Error('浏览器不支持录音功能')
    }
    
    audioFormat.value = supportedTypes[0]
    isDeviceReady.value = true
    
  } catch (error) {
    console.error('初始化录音失败:', error)
    errorMessage.value = error.message || '初始化录音设备失败'
    isDeviceReady.value = false
  } finally {
    isInitializing.value = false
  }
}

// 暂停/继续录音
const togglePause = () => {
  if (!mediaRecorder) return
  
  try {
    if (isPaused.value) {
      mediaRecorder.resume()
      isPaused.value = false
      // 恢复录音时重新开始动画
      requestAnimationFrame(draw)
    } else {
      mediaRecorder.pause()
      isPaused.value = true
      // 暂停时不需要额外处理，动画会自动停止
    }
  } catch (error) {
    console.error('暂停/继续录音失败:', error)
    errorMessage.value = '操作失败，请重试'
  }
}

// 添加快捷键支持
const handleKeyPress = (event) => {
  if (!shortcutEnabled.value) return
  
  if (event.code === 'Space') {
    event.preventDefault()
    if (isRecording.value) {
      togglePause()
    } else {
      toggleRecording()
    }
  } else if (event.code === 'Escape') {
    event.preventDefault()
    handleClose()
  }
}

// 更新状态显示
const updateStatus = (status) => {
  const statusMap = {
    'ready': '准备就绪',
    'recording': '录音中...',
    'paused': '已暂停',
    'completed': '录音完成',
    'error': '录音出错'
  }
  return statusMap[status] || status
}

// 停止录音
const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    // 先停止录音
    mediaRecorder.stop()
    mediaRecorder.stream.getTracks().forEach(track => track.stop())
  }
  
  isRecording.value = false
  isPaused.value = false
  stopTimer()
  stopVisualization()
  
  // 创建 Blob 并设置 URL
  const blob = new Blob(audioChunks, { type: audioFormat.value })
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
  audioUrl.value = URL.createObjectURL(blob)
  
  // 切换到预览模式
  isPreviewMode.value = true
  
  // 初始化音频播放器
  nextTick(() => {
    if (audioElement.value) {
      // 先清理现有的音频元素
      audioElement.value.pause()
      audioElement.value.src = ''
      audioElement.value.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audioElement.value.removeEventListener('timeupdate', handleTimeUpdate)
      audioElement.value.removeEventListener('ended', handleEnded)
    }
    
    // 创建新的音频元素
    audioElement.value = new Audio()
    
    // 先绑定事件监听器
    audioElement.value.addEventListener('loadedmetadata', handleLoadedMetadata)
    audioElement.value.addEventListener('timeupdate', handleTimeUpdate)
    audioElement.value.addEventListener('ended', handleEnded)
    
    // 最后设置音频源并加载
    audioElement.value.src = audioUrl.value
    audioElement.value.load()
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

// 音频播放控制方法
const togglePlay = () => {
  if (!audioElement.value || !audioUrl.value) return
  
  try {
    if (isPlaying.value) {
      audioElement.value.pause()
    } else {
      audioElement.value.play().catch(error => {
        console.error('播放失败:', error)
        errorMessage.value = '播放失败，请重试'
      })
    }
    isPlaying.value = !isPlaying.value
  } catch (error) {
    console.error('播放控制失败:', error)
    errorMessage.value = '播放控制失败，请重试'
  }
}

const handleSeek = (event) => {
  if (!audioElement.value || !audioUrl.value) return
  
  try {
    const time = Number(event.target.value)
    audioElement.value.currentTime = time
    currentTime.value = time
  } catch (error) {
    console.error('进度调节失败:', error)
  }
}

const skipBackward = () => {
  if (!audioElement.value) return
  
  try {
    const newTime = Math.max(0, audioElement.value.currentTime - 10)
    audioElement.value.currentTime = newTime
  } catch (error) {
    console.error('快退失败:', error)
  }
}

const skipForward = () => {
  if (!audioElement.value) return
  
  try {
    const newTime = Math.min(audioElement.value.duration, audioElement.value.currentTime + 10)
    audioElement.value.currentTime = newTime
  } catch (error) {
    console.error('快进失败:', error)
  }
}

const changePlaybackRate = () => {
  if (!audioElement.value) return
  
  try {
    audioElement.value.playbackRate = playbackRate.value
  } catch (error) {
    console.error('播放速度调节失败:', error)
  }
}

// 下载录音
const handleDownload = () => {
  if (!audioUrl.value) return
  
  const a = document.createElement('a')
  a.href = audioUrl.value
  a.download = `recording_${new Date().getTime()}.${audioFormat.value.split('/')[1]}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// 删除录音
const handleDelete = () => {
  showConfirmDialog.value = true
}

// 添加确认删除的处理函数
const confirmDelete = () => {
  showConfirmDialog.value = false
  
  // 先暂停播放
  if (audioElement.value) {
    audioElement.value.pause()
    isPlaying.value = false
  }
  
  // 执行清理
  cleanup()
  
  // 重置界面状态
  isPreviewMode.value = false
  currentTime.value = 0
  duration.value = 0
}

// 组件挂载和卸载
onMounted(() => {
  initializeRecording()
  document.addEventListener('keydown', handleKeyPress)
  if (visualizer.value) {
    visualizer.value.width = visualizer.value.offsetWidth
    visualizer.value.height = visualizer.value.offsetHeight
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyPress)
  cleanup()
})

// 清理函数
const cleanup = () => {
  stopTimer()
  stopVisualization()
  
  // 先停止录音
  if (isRecording.value) {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
    }
    isRecording.value = false
    isPaused.value = false
  }

  // 清理音频元素
  if (audioElement.value) {
    const audio = audioElement.value
    
    // 先移除事件监听器，避免触发不必要的事件
    audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
    audio.removeEventListener('timeupdate', handleTimeUpdate)
    audio.removeEventListener('ended', handleEnded)
    
    // 暂停播放并重置状态
    audio.pause()
    isPlaying.value = false
    
    // 清理音频源和引用
    audio.src = ''
    audioElement.value = null
  }

  // 重置状态变量
  currentTime.value = 0
  duration.value = 0

  // 清理音频URL
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = null
  }

  // 清理音频上下文
  if (audioContext) {
    audioContext.close().catch(console.error)
    audioContext = null
  }

  // 重置其他状态
  recordingTime.value = 0
  audioChunks = []
  analyser = null
  volumeLevel.value = 0
  isPreviewMode.value = false
}

// 停止可视化
const stopVisualization = () => {
  if (visualizer.value) {
    const ctx = visualizer.value.getContext('2d')
    ctx.clearRect(0, 0, visualizer.value.width, visualizer.value.height)
  }
  
  if (audioContext) {
    audioContext.close().catch(console.error)
    audioContext = null
  }
  
  if (analyser) {
    analyser = null
  }
  
  volumeLevel.value = 0
}

// 获取状态文本
const getStatusText = () => {
  return updateStatus(
    !isRecording.value ? 'ready' : 
    isPaused.value ? 'paused' : 
    'recording'
  )
}

// 添加音频事件处理函数
const handleLoadedMetadata = () => {
  if (audioElement.value) {
    duration.value = Math.floor(audioElement.value.duration)
  }
}

const handleTimeUpdate = () => {
  if (audioElement.value) {
    currentTime.value = Math.floor(audioElement.value.currentTime)
  }
}

const handleEnded = () => {
  isPlaying.value = false
}

// 修改音频初始化部分
const initAudioElement = () => {
  audioElement.value = new Audio()
  audioElement.value.src = audioUrl.value
  
  // 添加事件监听器
  audioElement.value.addEventListener('loadedmetadata', handleLoadedMetadata)
  audioElement.value.addEventListener('timeupdate', handleTimeUpdate)
  audioElement.value.addEventListener('ended', handleEnded)
  
  // 预加载音频
  audioElement.value.load()
}
</script> 