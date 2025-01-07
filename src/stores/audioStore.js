import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAudioStore = defineStore('audio', () => {
  // 状态
  const recordingStatus = ref(null) // null: 未录音, 'recording': 录音中, 'paused': 暂停
  const recordingTime = ref(0)
  const activeRecordings = ref([])
  const processingTasks = ref([])

  // 计算属性
  const isRecording = computed(() => recordingStatus.value === 'recording')
  const isPaused = computed(() => recordingStatus.value === 'paused')

  // 方法
  const startRecording = () => {
    recordingStatus.value = 'recording'
    // TODO: 实现录音逻辑
  }

  const pauseRecording = () => {
    recordingStatus.value = 'paused'
    // TODO: 实现暂停逻辑
  }

  const resumeRecording = () => {
    recordingStatus.value = 'recording'
    // TODO: 实现继续录音逻辑
  }

  const stopRecording = () => {
    recordingStatus.value = null
    // TODO: 实现停止录音逻辑
  }

  const addProcessingTask = (task) => {
    processingTasks.value.push({
      id: Date.now(),
      ...task,
      status: 'processing'
    })
  }

  return {
    recordingStatus,
    recordingTime,
    activeRecordings,
    processingTasks,
    isRecording,
    isPaused,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    addProcessingTask
  }
}) 