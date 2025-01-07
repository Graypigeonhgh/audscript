<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isLogin ? '登录' : '注册' }}</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="input-group">
            <label>用户名</label>
            <input 
              type="text" 
              v-model="formData.username"
              placeholder="请输入用户名"
              required
              class="form-input"
            />
          </div>
          
          <div class="input-group">
            <label>密码</label>
            <input 
              type="password" 
              v-model="formData.password"
              placeholder="请输入密码"
              required
              class="form-input"
            />
          </div>
          
          <div v-if="!isLogin" class="input-group">
            <label>确认密码</label>
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
          <button 
            class="switch-btn" 
            @click="isLogin = !isLogin"
          >
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
  animation: slideUp 0.3s ease-out;
  background: var(--primary-bg);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  padding: 1.5rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--primary-text);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--secondary-bg);
  color: var(--primary-text);
  transition: all 0.3s ease;
}

.form-input:focus {
  box-shadow: 0 0 0 2px var(--accent-color);
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--hover-shadow);
}

.form-footer {
  margin-top: 1rem;
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