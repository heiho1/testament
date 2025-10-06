import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import CreateTestament from './pages/CreateTestament.vue'
import ViewTestament from './pages/ViewTestament.vue'
import LoginPage from './pages/LoginPage.vue'
import SettingsPage from './pages/SettingsPage.vue'
import { canEditTestament, getCurrentUser } from './utils/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/create',
    name: 'CreateTestament',
    component: CreateTestament,
    meta: { requiresAuth: true }
  },
  {
    path: '/edit/:id',
    name: 'EditTestament',
    component: CreateTestament,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/testament/:id',
    name: 'ViewTestament',
    component: ViewTestament,
    props: true
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== 'admin') {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  if (to.meta.requiresAuth && !canEditTestament()) {
    // Redirect to login with return URL
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

export default router