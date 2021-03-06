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
import Perfume from 'perfume.js'

const options = {
  firstPaint: true,
  firstContentfulPaint: true,
  timeToInteractive: true,
  analyticsLogger: undefined,
  googleAnalytics: {
    enable: false,
    timingVar: 'name'
  },
  logging: true,
  logPrefix: 'Perfume.js:',
  warning: false
}
const perfume = new Perfume({...options})
console.log(perfume) // avoid eslint

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
    return
  }

  if (error && error.response && error.response.status !== 587) { // 表示為意料之外的錯誤
    if (error.response.status === 503) {
      router.replace({name: 'Maintenance'})
    }

    let msg = error.response.data.error

    if (error.response.status === 401 || error.response.status === 403) {
      return Promise.reject(error)
    }

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

let firstEnter = true
router.beforeEach((to, from, next) => {
  if (firstEnter && to.meta.requiresAuth === true) {
    let token = VueCookie.get('access_token')

    if (token) {
      store.dispatch('fetchUser').then(res => {
        firstEnter = false
        next()
      })
      .catch(() => {
        store.dispatch('startLoading')
        store.dispatch('trial').then(() => {
          store.dispatch('endLoading')
          next()
        }, () => {
          store.dispatch('endLoading')
          store.dispatch('updateUnloginedDialog', {visible: true, status: 'Login'})
        })
      })
    } else {
      store.dispatch('startLoading')
      store.dispatch('trial').then(() => {
        store.dispatch('endLoading')
        next()
      }, () => {
        store.dispatch('endLoading')
        store.dispatch('updateUnloginedDialog', {visible: true, status: 'Login'})
      })
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
    envelope_settings: globalData.envelope_settings,
    checkin_settings: globalData.checkin_settings
  })
  if (stickerGroups.length) {
    store.dispatch('setStickerGroups', stickerGroups)
  }
  document.title = store.state.globalPreference.title
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
