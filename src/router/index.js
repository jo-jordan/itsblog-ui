import { createRouter, createWebHistory } from 'vue-router'

// The desktop itself renders everything; routes only say which post is open.
const Desktop = { render: () => null }

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'desktop', component: Desktop },
    { path: '/posts/:slug', name: 'post', component: Desktop },
    { path: '/places/:id', name: 'place', component: Desktop },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})
