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
    state.chat.current.messages = [...data]
  },
  [types.UPDATE_CHATREAD]: (state, data) => {
    let chat = state.chatList.find(chat => chat.username === data.username)
    if (chat) {
      chat.read = data.read
    }
  },
  [types.START_CHAT]: (state, data) => {
    let roles = state.user.roles.map(role => role.name)
    state.chat.current.roomId = data.id
    state.chat.current.chatWith = data.chatWith
    state.chat.current.otherUser = data.otherUser
    if (!roles.includes('customer service')) {
      state.chat.dialogVisible = true
    }
  },
  [types.END_CHAT]: (state, data) => {
    state.chat.dialogVisible = false
    state.chat.current = {
      roomId: 1
    }
  },
  [types.SET_ROOMMSGS]: (state, data) => {
    if (data.roomId) {
      state.roomMsgs[data.roomId] = data[data.message]
    } else {
      state.roomMsgs = data
    }
  },
  [types.SET_ROOMS]: (state, data) => {
    if (data.roomId) {
      state.rooms[data.roomId] = data
    } else {
      state.rooms = data
    }
  },
  [types.COLLECT_ENVELOPE]: (state, data) => {
    state.envelopes[data.envelope_status.id] = data
  }
}
