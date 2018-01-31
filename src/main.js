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
// import { gethomePage } from './api'
import qs from 'qs'

let url = window.location.href
let params = qs.parse(url.slice(url.indexOf('?') + 1, url.length))
if (params.r) {
  let expires = new Date()
  expires.setMonth(expires.getMonth() + 1)
  VueCookie.set('r', params.r, {expires: expires})
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
  Vue.prototype.$message({
    showClose: true,
    message: '系统发生了错误, 请联系客服',
    type: 'error'
  })
  toHomeAndLogin(router)
  return Promise.reject(error)
})

const toHomeAndLogin = function (router) {
  store.commit('RESET_USER')
  router.push({
    path: '/login'
  })
}

// router.beforeEach((to, from, next) => {
//   // fisrMacthed might be the top-level parent route of others
//   const firstMatched = to.matched.length ? to.matched[0] : null
//   if ((firstMatched || to).meta.requiresAuth) {
//     if (from && from.matched[0] && from.matched[0].path === to.matched[0].path) {
//       next()
//     } else {
//       store.dispatch('fetchUser')
//         .then(res => {
//           // got user info
//           if (res.account_type === 0 && to.matched[0].path === '/account') {
//             toHomeAndLogin(router)
//           } else {
//             next()
//           }
//         })
//         .catch(error => {
//           // can't get user info
//           console.log(error)
//           toHomeAndLogin(router)
//           return Promise.resolve(error)
//         })
//     }
//   } else {
//     next()
//   }
// })

sync(store, router)

Vue.mixin({
  methods: {
    performLogin () {
      toHomeAndLogin(this.$router)
    }
  }
})

// gethomePage().then(
//   response => {
//     store.dispatch('setSystemConfig',
//       {
//         homePageLogo: response.icon,
//         customerServiceUrl: response.global_preferences.customer_service_url,
//         agentDashboardUrl: response.global_preferences.agent_dashboard_url,
//         global_preferences: response.global_preferences,
//         agentBusinessConsultingQQ: response.global_preferences.agent_business_consulting_qq,
//         contactEmail: response.global_preferences.contact_email,
//         contactPhoneNumber: response.global_preferences.contact_phone_number,
//         openAccountConsultingQQ: response.global_preferences.open_account_consulting_qq,
//         siteName: response.name
//       })
//     document.title = store.state.systemConfig.siteName
//   }
// )

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
