<template>
  <div class="app" :data-theme="theme">
    <div class="animated-bg"></div>
    
    <nav class="navbar">
      <div class="nav-left">
        <div class="logo">
          <h1>听悦</h1>
          <span class="logo-subtitle">AI音频助手</span>
        </div>
        
        <!-- 添加主菜单 -->
        <div class="main-menu">
          <router-link to="/" class="menu-item" active-class="active">
            <span class="menu-icon">🏠</span>
            首页
          </router-link>
          <router-link to="/history" class="menu-item" active-class="active">
            <span class="menu-icon">📜</span>
            历史记录
          </router-link>
          <router-link to="/workspace" class="menu-item" active-class="active">
            <span class="menu-icon">💼</span>
            工作台
          </router-link>
        </div>
      </div>
      
      <div class="nav-right">
        <!-- 用户菜单 -->
        <div class="user-section" v-click-outside="closeUserMenu">
          <template v-if="currentUser">
            <div class="user-menu-trigger" @click="toggleUserMenu">
              <span class="username">{{ currentUser.username }}</span>
              <span class="avatar">{{ currentUser.username[0].toUpperCase() }}</span>
            </div>
            
            <!-- 用户下拉菜单 -->
            <div class="user-dropdown" v-if="showUserMenu">
              <div class="dropdown-header">
                <strong>{{ currentUser.username }}</strong>
              </div>
              <div class="dropdown-items">
                <a href="#" class="dropdown-item" @click="navigateToProfile">
                  <span class="item-icon">👤</span>
                  个人资料
                </a>
                <a href="#" class="dropdown-item" @click="navigateToSettings">
                  <span class="item-icon">⚙️</span>
                  设置
                </a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item logout" @click="handleLogout">
                  <span class="item-icon">🚪</span>
                  退出登录
                </a>
              </div>
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
const showUserMenu = ref(false)

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

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const navigateToProfile = () => {
  // TODO: 实现导航到个人资料页面
  closeUserMenu()
}

const navigateToSettings = () => {
  // TODO: 实现导航到设置页面
  closeUserMenu()
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--primary-bg);
  color: var(--primary-text);
  transition: all 0.3s ease;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  height: 64px;
}

[data-theme='dark'] .navbar {
  background: rgba(15, 23, 42, 0.8);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo h1 {
  font-size: 1.5rem;
  margin: 0;
  background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
  -webkit-background-clip: text;
  color: transparent;
}

.main-menu {
  display: flex;
  gap: 1rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: var(--secondary-text);
  text-decoration: none;
  transition: all 0.3s;
}

.menu-item:hover {
  background: var(--secondary-bg);
  color: var(--primary-text);
}

.menu-item.active {
  background: var(--secondary-bg);
  color: var(--accent-color);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s;
}

.user-menu-trigger:hover {
  background: var(--secondary-bg);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 1rem;
  width: 200px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  margin-top: 0.5rem;
  overflow: hidden;
}

.dropdown-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.dropdown-items {
  padding: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: var(--primary-text);
  text-decoration: none;
  transition: all 0.3s;
}

.dropdown-item:hover {
  background: var(--secondary-bg);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 0;
}

.logout {
  color: #ef4444;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 2rem;
  animation: fadeIn 0.5s ease-out;
}

.card {
  background: var(--primary-bg);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
  cursor: pointer;
  animation: slideUp 0.5s ease-out;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: var(--hover-shadow);
  border-color: var(--accent-color);
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
  -webkit-background-clip: text;
  color: transparent;
}

.welcome-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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