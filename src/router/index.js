import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/screens/Home'
import Result from '@/components/Result'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      meta: { requiresAuth: true },
      component: Home
    },
    {
      path: '/results',
      name: 'Results',
      component: Result
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
