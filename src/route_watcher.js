import router from './router'
import Loader from './components/Loader/Loader'

var loader
router.beforeEach((to, from, next) => {
  console.log('from:', from, ', to:', to)
  
  if (from.path === '/') {
    loader = Loader()
  }
  next()
  
})

router.afterEach(() => {
  loader.close()
  console.log('done')
})
