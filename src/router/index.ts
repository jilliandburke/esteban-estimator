import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path: '/estimation/:id',
      name: 'epicOverview',
      component: () => import('../views/estimation-flow/EpicOverview.vue'),
    },
    {
      path: '/estimation/:epicId/story/:storyId',
      name: 'storyView',
      component: () => import('../views/estimation-flow/StoryView.vue'),
    },
    {
      path: '/estimation/:epicId/review',
      name: 'reviewView',
      component: () => import('../views/estimation-flow/ReviewView.vue'),
    },
    {
      path: '/estimation/:id/admin-review',
      name: 'adminReview',
      component: () => import('../views/estimation-flow/AdminReview.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/logout',
      name: 'logout',
      component: () => import('../views/LogoutView.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const userStore = useUserStore()

  if (
    // make sure the user is authenticated
    !userStore.isLoggedIn &&
    // ❗️ Avoid an infinite redirect
    to.name !== 'login'
  ) {
    // redirect the user to the login page
    return { name: 'login' }
  }
})

export default router
