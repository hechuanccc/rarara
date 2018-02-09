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
      logined: false,
      roles: []
    }
    Vue.cookie.delete('access_token')
    Vue.cookie.delete('refresh_token')
  },
  [types.START_LOADING]: (state, loading) => {
    state.loading = true
  },
  [types.END_LOADING]: (state) => {
    state.loading = false
  },
  [types.SET_GLOBAL]: (state, data) => {
    state.globalPreference = data
  },
  [types.UPDATE_ROOMLIST]: (state, data) => {
    state.roomList = data || []
  },
  [types.UPDATE_NOW_ROOM_ID]: (state, data) => {
    state.activeRoomId = data || 1
  },
  [types.NEW_MESSAGE]: (state, data) => {
    state.newMsg = data || {}
  }
}
