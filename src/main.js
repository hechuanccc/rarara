// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import router from './router'
import { createStore } from './store'
import { sync } from 'vuex-router-sync'
import VueCookie from 'vue-cookie'
import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Vue2Filters from 'vue2-filters'
import { fetchGlobalData } from './api'
import qs from 'qs'

let url = window.location.href
let params = qs.parse(url.slice(url.indexOf('?') + 1, url.indexOf('#')))
if (params.r) {
  VueCookie.set('r', params.r, {expires: '1M'})
}

Vue.use(require('vue-moment'))
Vue.use(Vue2Filters)
Vue.use(ElementUI, { size: 'small' })
Vue.use(VueCookie)
Vue.use(Vuex)
const store = createStore()
const token = Vue.cookie.get('access_token')

Vue.config.productionTip = false

if (token) {
  axios.defaults.withCredentials = true
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
}
axios.interceptors.response.use(res => {
  let responseData = res.data
  if (!responseData.error) {
    return responseData
  } else {
    toHomeAndLogin(router)
    return Promise.reject(responseData)
  }
}, (error) => {
  toHomeAndLogin(router)
  return Promise.reject(error)
})

const toHomeAndLogin = function (router) {
  // store.commit('RESET_USER')
  router.push({
    path: '/login'
  })
}

router.beforeEach((to, from, next) => {
  // fisrMacthed might be the top-level parent route of others
  const firstMatched = to.matched.length ? to.matched[0] : null
  if ((firstMatched || to).meta.requiresAuth) {
    if (from && from.matched[0] && from.matched[0].path === to.matched[0].path) {
      next()
    } else {
      store.dispatch('fetchUser')
        .then(res => {
          // got user info
          if (res.account_type === 0 && to.matched[0].path === '/account') {
            toHomeAndLogin(router)
          } else {
            next()
          }
        })
        .catch(error => {
          // can't get user info
          console.log(error)
          toHomeAndLogin(router)
          return Promise.resolve(error)
        })
    }
  } else {
    next()
  }
})

sync(store, router)

fetchGlobalData().then(res => {
  const globalData = res.global_preferences
  store.dispatch('setGlobalConfig', {
    mobile_lottery_url: globalData.mobile_lottery_url,
    customer_service_url: globalData.customer_service_url,
    web_lottery_register_url: globalData.web_lottery_register_url
  })
})

Vue.mixin({
  methods: {
    performLogin () {
      toHomeAndLogin(this.$router)
    }
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
