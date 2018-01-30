import * as types from './mutation-types'
import Vue from 'vue'

export default {
  [types.SET_USER]: (state, { user }) => {
    Vue.set(state, 'user', {
      ...state.user,
      ...user
    })
  },
  [types.RESET_USER]: (state) => {
    state.user = {
      logined: false
    }
    Vue.cookie.delete('access_token')
    Vue.cookie.delete('refresh_token')
  },
  [types.START_LOADING]: (state, loading) => {
    state.loading = true
  },
  [types.END_LOADING]: (state) => {
    state.loading = false
  }
}
