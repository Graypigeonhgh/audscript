<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-title">
          <h2>{{ isLogin ? '登录' : '注册' }}</h2>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="input-group">
            <input 
              type="text" 
              v-model="formData.username"
              placeholder="请输入用户名或邮箱"
              required
              class="form-input"
            />
          </div>
          
          <div class="input-group">
            <input 
              type="password" 
              v-model="formData.password"
              placeholder="请输入密码"
              required
              class="form-input"
            />
          </div>
          
          <div v-if="!isLogin" class="input-group">
            <input 
              type="password" 
              v-model="formData.confirmPassword"
              placeholder="请再次输入密码"
              required
              class="form-input"
            />
          </div>
          
          <button type="submit" class="submit-btn">
            {{ isLogin ? '登录' : '注册' }}
          </button>
        </form>
        
        <div class="form-footer">
          <button class="switch-btn" @click="isLogin = !isLogin">
            {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const emit = defineEmits(['close', 'login'])
const isLogin = ref(true)
const formData = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// Mock用户数据
const mockUsers = [
  { username: 'test', password: '123456' }
]

const handleSubmit = async () => {
  try {
    if (!isLogin.value && formData.password !== formData.confirmPassword) {
      alert('两次输入的密码不一致')
      return
    }

    // TODO: 替换为实际的API调用
    if (isLogin.value) {
      // 模拟登录请求
      const user = mockUsers.find(u => 
        u.username === formData.username && 
        u.password === formData.password
      )
      
      if (user) {
        emit('login', { username: user.username })
        emit('close')
      } else {
        alert('用户名或密码错误')
      }
    } else {
      // 模拟注册请求
      if (mockUsers.some(u => u.username === formData.username)) {
        alert('用户名已存在')
        return
      }
      
      mockUsers.push({
        username: formData.username,
        password: formData.password
      })
      
      alert('注册成功')
      isLogin.value = true
    }
  } catch (error) {
    console.error('登录/注册失败:', error)
    alert('操作失败，请重试')
  }
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
  z-index: 1000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  width: 90%;
  max-width: 400px;
  padding: 2rem;
  background: var(--primary-bg);
  border-radius: 12px;
  box-shadow: var(--modal-shadow);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-header {
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}

.header-title {
  text-align: center;
}

.header-title h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--primary-text);
}

.close-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--secondary-text);
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: var(--hover-bg);
  color: var(--primary-text);
}

.icon {
  width: 20px;
  height: 20px;
}

.modal-body {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

form {
  width: 85%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.input-group {
  width: 100%;
  display: flex;
  justify-content: center;
}

.form-input {
  width: 100%;
  height: 46px;
  padding: 0 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--secondary-bg);
  color: var(--primary-text);
  font-size: 0.95rem;
  text-align: left;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb), 0.1);
}

.submit-btn {
  width: 100%;
  height: 48px;
  margin-top: 0.5rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--hover-shadow);
}

.form-footer {
  width: 100%;
  margin-top: 1.5rem;
  text-align: center;
}

.switch-btn {
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  padding: 0.5rem;
}

.switch-btn:hover {
  text-decoration: underline;
}
</style> 