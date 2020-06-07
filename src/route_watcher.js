import router from './router'
import Loader from './components/Loader/Loader'

var loader
router.beforeEach((to, from, next) => {
  
  if (from.path === '/') {
    loader = Loader()
  }
  next()
  
})

router.afterEach(() => {
  loader.close()
})
