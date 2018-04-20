import * as types from './mutation-types'
import Vue from 'vue'
import { buildRoom } from '../../api'

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
  [types.UPDATE_ROOMREAD]: (state, data) => {
    let role = state.user.roles.map(role => role.name)
    let current = role.length === 1 && role[0] === 'member' ? state.rooms.find(room => room.room.id === data.roomId) : state.rooms.find(room => room.id === data.roomId)

    if (current) {
      if (current.hasOwnProperty('is_read_latest_message')) {
        current.is_read_latest_message = data.read
      } else {
        if (current.type !== 1) {
          current.room.read = data.read
        }
      }
    }
  },
  [types.UPDATE_UNLOGINEDDIALOG]: (state, data) => {
    state.unloginedDialog = data || {}
  },
  [types.GET_CHATMESSAGES]: (state, data) => {
    state.chat.current.messages = [...data]
  },
  [types.START_CHAT]: (state, data) => {
    let role = state.user.roles.map(role => role.name)
    state.chat.current.roomId = data.id
    state.chat.current.chatWith = data.chatWith
    state.chat.current.otherUser = data.otherUser
    state.chat.current.type = data.type

    if (role.length === 1 && role[0] === 'member' && state.chat.current.type === 2) {
      state.chat.dialogVisible = true
    }
  },
  [types.END_CHAT]: (state, data) => {
    state.chat.dialogVisible = false
    state.chat.current = {
      roomId: state.user.default_room_id,
      type: 1
    }
  },
  [types.SET_ROOMS]: (state, data) => {
    if (data.roomId) {
      state.rooms[data.roomId] = data
    } else {
      if (data.length && data[0].room) {
        data.forEach((chat) => {
          if (!chat.room.id) {
            let roomObj = {
              type: 2,
              status: 1,
              last_message: '',
              users: [chat.id, state.user.id]
            }
            buildRoom(roomObj).then((res) => {
              chat.room.id = res.room.id
              chat.read = true
            })
          }
        })
      }

      state.rooms = data
    }
  },
  [types.SET_ROOMMSGS]: (state, data) => {
    if (data.roomId) {
      state.roomMsgs[data.roomId] = data
    } else {
      state.roomMsgs = data
    }
  },
  [types.SET_RESTRAINTMEMBERS]: (state, data) => {
    if (data.roomId) {
      state.restraintMembers[data.roomId] = data
    } else {
      state.restraintMembers = data
    }
  },
  [types.SET_STICKERGROUPS]: (state, data) => {
    state.stickerGroups = data
  },
  [types.COLLECT_ENVELOPE]: (state, data) => {
    Vue.set(state.envelopes, data.envelope_status.id, data)
  }
}
