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
  [types.SET_WEBSOCKET]: (state, data) => {
    state.ws = data
  },
  [types.UPDATE_CHATLIST]: (state, data) => {
    state.chatList = data || []
  },
  [types.GET_CHATMESSAGES]: (state, data) => {
    state.privateChat.current.messages = [...data]
  },
  [types.UPDATE_CHATREAD]: (state, data) => {
    let chat = state.chatList.find(chat => chat.username === data.username)
    chat.read = data.read
  },
  [types.START_PRIVATECHAT]: (state, data) => {
    let roles = state.user.roles.map(role => role.name)
    state.privateChat.current.roomId = data.id
    state.privateChat.current.chatWith = data.chatWith
    if (!roles.includes('customer service')) {
      state.privateChat.dialogVisible = true
    }
  },
  [types.END_PRIVATECHAT]: (state, data) => {
    state.privateChat.dialogVisible = false
    state.privateChat.current = {
      roomId: 1,
      messages: []
    }
  },
  [types.SET_ROOMMSGS]: (state, data) => {
    state.roomMsgs = data
  }
}
