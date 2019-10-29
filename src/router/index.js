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
        path: 'category',
        name: 'category',
        component: () => import('../views/Category.vue')
      },
      {
        path: 'keywords',
        name: 'keywords',
        component: () => import('../views/Keywords.vue')
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
