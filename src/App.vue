<template>
  <div class="app" :data-theme="theme">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="logo">
        <h1>听悦</h1>
      </div>
      <div class="nav-controls">
        <!-- 添加用户信息/登录按钮 -->
        <div class="user-section">
          <template v-if="currentUser">
            <div class="user-info">
              <span>{{ currentUser.username }}</span>
              <button class="logout-btn" @click="handleLogout">退出</button>
            </div>
          </template>
          <button v-else class="login-btn" @click="showLoginModal = true">
            登录/注册
          </button>
        </div>
        
        <button class="theme-toggle" @click="toggleTheme">
          {{ theme === 'dark' ? '🌙' : '☀️' }}
        </button>
      </div>
    </nav>

    <!-- 登录模态框 -->
    <LoginModal
      v-if="showLoginModal"
      @close="showLoginModal = false"
      @login="handleLogin"
    />

    <!-- 主要内容区 -->
    <main class="main-content">
      <!-- 欢迎区域 -->
      <section v-if="!currentAudio" class="welcome-section">
        <div class="action-cards">
          <div class="card" @click="showRecordModal = true">
            <div class="card-icon">🎙️</div>
            <h3>开始录音</h3>
            <p>点击开始录制新的音频</p>
          </div>
          
          <div class="card" @click="showImportModal = true">
            <div class="card-icon">📁</div>
            <h3>导入音频</h3>
            <p>上传已有的音频文件</p>
          </div>
          
          <div class="card" @click="showPodcastModal = true">
            <div class="card-icon">🎙️</div>
            <h3>导入播客</h3>
            <p>输入播客链接转换为文本</p>
          </div>
        </div>
      </section>

      <!-- 录音模态框 -->
      <RecordModal 
        v-if="showRecordModal" 
        @close="showRecordModal = false"
        @save="handleSaveRecording"
      />

      <!-- 导入模态框 -->
      <ImportModal
        v-if="showImportModal"
        @close="showImportModal = false"
        @import="handleImportAudio"
      />

      <!-- 添加播客导入模态框 -->
      <PodcastImportModal
        v-if="showPodcastModal"
        @close="showPodcastModal = false"
        @import="handlePodcastImport"
      />

      <!-- 工作区 -->
      <section v-if="currentAudio" class="workspace-section">
        <WorkspaceView
          :audio-url="currentAudio.url"
          :audio-name="currentAudio.name"
          :status="currentAudio.status"
          @back="currentAudio = null"
          @save="handleSaveTranscription"
          @export="handleExportTranscription"
        />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import RecordModal from './components/RecordModal.vue'
import ImportModal from './components/ImportModal.vue'
import WorkspaceView from './components/WorkspaceView.vue'
import PodcastImportModal from './components/PodcastImportModal.vue'
import LoginModal from './components/LoginModal.vue'

// 状态管理
const theme = ref('light')
const showRecordModal = ref(false)
const showImportModal = ref(false)
const showPodcastModal = ref(false)
const currentAudio = ref(null)
const currentUser = ref(null)
const showLoginModal = ref(false)

// 主题切换
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

// 处理录音保存
const handleSaveRecording = (audioData) => {
  console.log('保存录音:', audioData)
  showRecordModal.value = false
  // TODO: 调用API保存录音
}

// 处理音频导入
const handleImportAudio = (file) => {
  console.log('导入音频:', file)
  showImportModal.value = false
  // TODO: 调用API上传音频
}

// 处理转写保存
const handleSaveTranscription = (data) => {
  console.log('保存转写:', data)
  // TODO: 调用API保存转写
}

// 处理转写导出
const handleExportTranscription = (data) => {
  console.log('导出转写:', data)
  // TODO: 调用API导出转写
}

// 处理播客导入
const handlePodcastImport = (podcastData) => {
  console.log('导入播客:', podcastData)
  showPodcastModal.value = false
  // TODO: 调用API处理播客导入
}

// 处理登录
const handleLogin = (userData) => {
  currentUser.value = userData
  showLoginModal.value = false
}

// 处理退出
const handleLogout = () => {
  currentUser.value = null
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--primary-bg);
  color: var(--primary-text);
  transition: background-color 0.3s, color 0.3s;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--secondary-bg);
  backdrop-filter: blur(10px);
  transition: background-color 0.3s;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.theme-toggle {
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s;
}

.theme-toggle:hover {
  transform: scale(1.1);
  background: var(--accent-color);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.welcome-section {
  text-align: center;
  padding: 2rem 0;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.card {
  background: var(--secondary-bg);
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid var(--border-color);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-color: var(--accent-color);
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.card h3 {
  margin: 0.5rem 0;
  font-weight: 600;
}

.card p {
  color: var(--secondary-text);
  margin: 0;
}

.workspace-section {
  flex: 1;
  overflow: hidden;
}

:deep(*) {
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) var(--secondary-bg);
}

@media (max-width: 768px) {
  .navbar {
    padding: 0.75rem 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .action-cards {
    gap: 1rem;
  }
  
  .card {
    padding: 1.5rem;
  }
}

.user-section {
  margin-right: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.login-btn, .logout-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.login-btn {
  background: var(--accent-color);
  color: white;
  border: none;
}

.logout-btn {
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  color: var(--primary-text);
}

.login-btn:hover {
  opacity: 0.9;
}

.logout-btn:hover {
  background: var(--border-color);
}
</style> 