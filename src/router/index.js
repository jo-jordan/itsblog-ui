import Vue from 'vue'
import VueRouter from 'vue-router'
import Dashboard from '../views/Dashboard.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    children: [
      {
        path: 'all',
        name: 'all',
        component: () => import('../views/All.vue')
      },
      {
        path: 'archive',
        name: 'archive',
        component: () => import('../views/Archive.vue')
      },
      {
        path: 'resume',
        name: 'resume',
        component: () => import('../views/Resume.vue')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
