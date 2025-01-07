<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isLogin ? '登录' : '注册' }}</h2>
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
          
          <button type="submit" class="primary-btn">
            {{ isLogin ? '登录' : '注册' }}
          </button>
        </form>
        
        <div class="form-footer">
          <button class="text-btn" @click="isLogin = !isLogin">
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

<style lang="scss">
@import '@/assets/styles/modal.scss';

/* 只保留特定于登录模态框的样式 */
form {
  width: 85%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.text-btn {
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  padding: 0.5rem;
  font-size: 0.95rem;
  
  &:hover {
    text-decoration: underline;
  }
}
</style> 