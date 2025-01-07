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
import { userApi } from '@/api'

const emit = defineEmits(['close', 'login'])
const isLogin = ref(true)
const formData = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const handleSubmit = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    if (isLogin.value) {
      // 调用登录API
      const response = await userApi.login({
        username: formData.username,
        password: formData.password
      })
      
      // 保存token到localStorage
      localStorage.setItem('token', response.token)
      
      // 触发登录成功事件
      emit('login', { username: formData.username })
      emit('close')
    } else {
      // 调用注册API
      await userApi.register({
        username: formData.username,
        password: formData.password,
        email: formData.email
      })
      
      // 注册成功后切换到登录界面
      alert('注册成功，请登录')
      isLogin.value = true
    }
  } catch (error) {
    console.error('操作失败:', error)
    errorMessage.value = error.response?.data?.message || '操作失败，请重试'
  } finally {
    loading.value = false
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