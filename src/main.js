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
import { fetchGlobalData, setCookie } from './api'
import qs from 'qs'
import VueQRCodeComponent from 'vue-qrcode-component'

Vue.use(require('vue-moment'))
Vue.use(Vue2Filters)
Vue.use(ElementUI, { size: 'small' })
Vue.use(VueCookie)
Vue.use(Vuex)
Vue.component('qr-code', VueQRCodeComponent)

let url = window.location.href
let params = qs.parse(url.slice(url.indexOf('?') + 1, url.length))

if (params.r) {
  setCookie('r=' + params.r).catch(() => {})
}

if (params.desktop === '0' && Vue.cookie.get('desktop') !== '0') {
  VueCookie.set('desktop', params.desktop)
  window.location.reload()
}

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
    Vue.prototype.$message({
      showClose: true,
      message: responseData.error,
      type: 'warning'
    })
    return Promise.reject(responseData)
  }
}, (error) => {
  if (!error.response) {
    Vue.prototype.$message({
      showClose: true,
      message: '系统发生了错误, 请联系客服',
      type: 'error'
    })
  }
  if (error.response.status === 401 || error.response.status === 403) {
    toHomeAndLogin(router)
  } else if (error.response.status !== 587) { // 表示為意料之外的錯誤
    let msg = error.response.data.error
    if (!msg) {
      msg = '系统发生了错误, 请联系客服'
    }
    Vue.prototype.$message({
      showClose: true,
      message: msg,
      type: 'error'
    })
  }
  return Promise.reject(error)
})

const toHomeAndLogin = function (router) {
  // store.commit('RESET_USER')
  router.push({
    path: '/login'
  })
}

let firstEnter = true
router.beforeEach((to, from, next) => {
  if (firstEnter && to.meta.requiresAuth === true) {
    let token = VueCookie.get('access_token')
    if (token) {
      store.dispatch('fetchUser')
      .then(res => {
        firstEnter = false
        next()
      })
      .catch(() => {
        toHomeAndLogin(router)
      })
    } else {
      toHomeAndLogin(router)
    }
  } else {
    next()
  }
})

sync(store, router)

fetchGlobalData().then(res => {
  const globalData = res.global_preferences
  const stickerGroups = res.sticker_groups
  store.dispatch('setGlobalConfig', {
    mobile_lottery_url: globalData.mobile_lottery_url,
    customer_service_url: globalData.customer_service_url,
    web_lottery_register_url: globalData.web_lottery_register_url,
    logo: globalData.logo,
    private_chat_blocked_users: globalData.private_chat_blocked_users,
    title: globalData.title,
    web_background: globalData.web_background,
    mobile_url: globalData.mobile_url,
    envelope_settings: globalData.envelope_settings
  })
  if (stickerGroups.length) {
    store.dispatch('setStickerGroups', stickerGroups)
  }
  document.title = store.state.globalPreference.title
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
