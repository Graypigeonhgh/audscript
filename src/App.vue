<template>
  <div class="app" :data-theme="theme">
    <div class="animated-bg"></div>
    
    <nav class="navbar">
      <div class="nav-left">
        <div class="logo">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
          </svg>
          <div class="logo-text">
            <h1>听悦</h1>
            <span class="logo-subtitle">AI音频助手</span>
          </div>
        </div>
        
        <div class="main-menu">
          <router-link to="/" class="menu-item" active-class="active">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span>首页</span>
          </router-link>
          
          <router-link to="/history" class="menu-item" active-class="active">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>历史记录</span>
          </router-link>
          
          <router-link to="/workspace" class="menu-item" active-class="active">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <span>工作台</span>
          </router-link>
        </div>
      </div>
      
      <div class="nav-right">
        <div class="user-section" v-click-outside="closeUserMenu">
          <template v-if="currentUser">
            <div class="user-menu-trigger" @click="toggleUserMenu">
              <span class="username">{{ currentUser.username }}</span>
              <div class="avatar">{{ currentUser.username[0].toUpperCase() }}</div>
            </div>
            
            <div class="user-dropdown" v-if="showUserMenu">
              <div class="dropdown-header">
                <strong>{{ currentUser.username }}</strong>
              </div>
              <div class="dropdown-items">
                <a href="#" class="dropdown-item" @click.prevent="navigateToProfile">
                  <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  个人资料
                </a>
                <a href="#" class="dropdown-item" @click.prevent="navigateToSettings">
                  <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  设置
                </a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item logout" @click.prevent="handleLogout">
                  <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  退出登录
                </a>
              </div>
            </div>
          </template>
          <button v-else class="login-btn" @click="showLoginModal = true">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            <span>登录/注册</span>
          </button>
        </div>
        
        <button class="theme-toggle" @click="toggleTheme" :title="theme === 'dark' ? '切换到明亮模式' : '切换到暗黑模式'">
          <svg v-if="theme === 'dark'" class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <svg v-else class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
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
            <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
            </svg>
            <h3>开始录音</h3>
            <p>点击开始录制新的音频</p>
          </div>
          
          <div class="card" @click="showImportModal = true">
            <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            <h3>导入音频</h3>
            <p>上传已有的音频文件</p>
          </div>
          
          <div class="card" @click="showPodcastModal = true">
            <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828"/>
            </svg>
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
import { useRouter } from 'vue-router'
import RecordModal from './components/RecordModal.vue'
import ImportModal from './components/ImportModal.vue'
import WorkspaceView from './components/WorkspaceView.vue'
import PodcastImportModal from './components/PodcastImportModal.vue'
import LoginModal from './components/LoginModal.vue'

const router = useRouter()
const currentUser = ref(null)
const showLoginModal = ref(false)
const showUserMenu = ref(false)
const showRecordModal = ref(false)
const showImportModal = ref(false)
const showPodcastModal = ref(false)
const theme = ref('light')

// 处理用户菜单
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

// 处理登录
const handleLogin = (userData) => {
  currentUser.value = userData
  showLoginModal.value = false
  closeUserMenu()
}

// 处理退出登录
const handleLogout = () => {
  currentUser.value = null
  closeUserMenu()
  router.push('/')
}

// 导航到个人资料页面
const navigateToProfile = () => {
  closeUserMenu()
  router.push('/profile')
}

// 导航到设置页面
const navigateToSettings = () => {
  closeUserMenu()
  router.push('/settings')
}

// 切换主题
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
  padding: 0.75rem 2rem;
  background: var(--primary-bg);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: var(--accent-color);
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo h1 {
  font-size: 1.25rem;
  margin: 0;
  font-weight: 600;
}

.logo-subtitle {
  font-size: 0.75rem;
  color: var(--secondary-text);
}

.main-menu {
  display: flex;
  gap: 1rem;
  margin-left: 2rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: var(--secondary-text);
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s;
}

.menu-icon {
  width: 20px;
  height: 20px;
}

.menu-item:hover {
  color: var(--primary-text);
  background: var(--secondary-bg);
}

.menu-item.active {
  color: var(--accent-color);
  background: var(--secondary-bg);
}

.theme-toggle {
  background: none;
  border: none;
  padding: 0.5rem;
  color: var(--secondary-text);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;
}

.theme-icon {
  width: 24px;
  height: 24px;
}

.theme-toggle:hover {
  color: var(--primary-text);
  background: var(--secondary-bg);
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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.3s;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-color);
  box-shadow: var(--hover-shadow);
}

.card-icon {
  width: 48px;
  height: 48px;
  color: var(--accent-color);
  margin-bottom: 1rem;
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