import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import WorkspaceView from '@/views/WorkspaceView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue')
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('../views/HistoryView.vue')
  },
  {
    path: '/workspace',
    name: 'workspace',
    component: WorkspaceView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 添加需要登录才能访问的路由列表
const authRoutes = ['workspace', 'profile', 'settings']

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (authRoutes.includes(to.name) && !token) {
    // 如果是需要登录的路由，但用户未登录，则跳转到首页
    next('/')
  } else {
    next()
  }
})

export default router 