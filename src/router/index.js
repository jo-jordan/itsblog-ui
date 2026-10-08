import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// The desktop itself renders everything; routes only say which post is open.
export default new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    { path: '/', name: 'desktop' },
    { path: '/posts/:slug', name: 'post' },
    { path: '/places/:id', name: 'place' },
    { path: '*', redirect: '/' }
  ]
})
