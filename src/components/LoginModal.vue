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
              placeholder="用户名"
              required
              class="form-input"
              :minlength="4"
              :maxlength="20"
            />
          </div>
          
          <div class="input-group" v-if="!isLogin">
            <input 
              type="email" 
              v-model="formData.email"
              placeholder="邮箱"
              required
              class="form-input"
            />
          </div>
          
          <div class="input-group">
            <input 
              type="password" 
              v-model="formData.password"
              placeholder="密码"
              required
              class="form-input"
              :minlength="6"
              :maxlength="20"
            />
          </div>
          
          <div v-if="!isLogin" class="input-group">
            <input 
              type="password" 
              v-model="formData.confirmPassword"
              placeholder="确认密码"
              required
              class="form-input"
              :minlength="6"
              :maxlength="20"
            />
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <button type="submit" class="primary-btn" :disabled="loading">
            {{ loading ? '处理中...' : (isLogin ? '登录' : '注册') }}
          </button>
        </form>
        
        <div class="form-footer">
          <button class="text-btn" @click="switchMode">
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
const loading = ref(false)
const errorMessage = ref('')

const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

const switchMode = () => {
  isLogin.value = !isLogin.value
  errorMessage.value = ''
  formData.username = ''
  formData.password = ''
  formData.confirmPassword = ''
  formData.email = ''
}

const validateForm = () => {
  if (!isLogin.value && formData.password !== formData.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致'
    return false
  }
  
  if (formData.username.length < 4 || formData.username.length > 20) {
    errorMessage.value = '用户名长度必须在4-20个字符之间'
    return false
  }
  
  if (formData.password.length < 6 || formData.password.length > 20) {
    errorMessage.value = '密码长度必须在6-20个字符之间'
    return false
  }

  return true
}

const handleSubmit = async () => {
  try {
    if (!validateForm()) return
    
    loading.value = true
    errorMessage.value = ''

    if (isLogin.value) {
      // 登录
      const response = await userApi.login({
        username: formData.username,
        password: formData.password
      })
      
      // 保存token到localStorage
      localStorage.setItem('token', response.token)
      
      // 触发登录成功事件，传递完整的用户信息
      emit('login', response.user)
      emit('close')
    } else {
      // 注册
      await userApi.register({
        username: formData.username,
        password: formData.password,
        email: formData.email
      })
      
      // 注册成功后切换到登录界面
      alert('注册成功，请登录')
      isLogin.value = true
      formData.password = ''
    }
  } catch (error) {
    console.error('操作失败:', error)
    errorMessage.value = error.response?.data?.message || '操作失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/modal.scss';

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #fee2e2;
  border-radius: 4px;
  text-align: center;
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;
}
</style> 