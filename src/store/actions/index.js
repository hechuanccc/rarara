import axios from 'axios'
import Vue from 'vue'

import * as types from '../mutations/mutation-types'
import config from '../../../config'

import {
  login,
  logout,
  fetchUser,
  updateUser,
  register,
  getChatList
} from '../../api'

export default {
  login: ({ commit, state, dispatch }, { user }) => {
    let token = Vue.cookie.get('access_token')
    if (state.user.logined && token) {
      dispatch('logout')
    }

    return login(user).then(res => {
      dispatch('resetUser')

      let expires = new Date(res.expires_in)

      if (res.access_token && res.refresh_token) {
        Vue.cookie.set('access_token', res.access_token, {
          expires: expires
        })
        Vue.cookie.set('refresh_token', res.refresh_token, {
          expires: expires
        })
        axios.defaults.withCredentials = true
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.access_token
      }

      dispatch('fetchUser').then(() => {
        return Promise.resolve(res)
      })
    }, error => {
      if (error.code === 9011) {
        Vue.cookie.set('sessionid', error.data.sessionid)
      }
      return Promise.reject(error)
    })
  },
  connectSocket: ({commit, state, dispatch}, fn) => {
    const WSHOST = config.chatHost
    let token = Vue.cookie.get('access_token')
    let socket = new WebSocket(`${WSHOST}/chat/stream?token=${token}`)

    dispatch('setWebsocket', socket)

    state.ws.onopen = () => {
      if (fn) {
        fn()
      }

      state.ws.send(JSON.stringify({
        'command': 'join',
        'receivers': [state.chat.current.roomId]
      }))
    }

    state.ws.onclose = () => {
      dispatch('setWebsocket', null)
    }

    state.ws.onerror = () => {
      dispatch('updateUnloginedDialog', {visible: true, status: 'Login'})
    }
  },
  logout: ({ commit, state, dispatch }) => {
    return logout().then(
      res => {
        Vue.cookie.delete('access_token')
        Vue.cookie.delete('refresh_token')
        dispatch('leaveSocket', state.chat.current.roomId)
      },
      errRes => Promise.reject(errRes)
    )
  },
  leaveSocket: ({commit, state, diapatch}, room) => {
    if (state.ws) {
      if (room) {
        state.ws && state.ws.send(JSON.stringify({
          'command': 'leave',
          'receivers': [room]
        }))
      }

      state.ws.close()
    }
  },
  fetchUser: ({ commit, state, dispatch, getters }) => {
    return fetchUser().then(res => {
      const noServiceRoles = (role) => {
        return (role === 'manager' || role === 'visitor')
      }
      if (res) {
        commit(types.SET_USER, {
          user: {
            ...res,
            logined: true
          }
        })
        // TODO: apply multiple chatroom chatList & roomList
        if (getters.myRoles.length && !getters.myRoles.some(noServiceRoles)) {
          if (state.chatList.length === 0) {
            getChatList({offset: 0, limit: 20}).then(data => {
              dispatch('updateChatList', data.results)
            })
          }
        }
        return Promise.resolve(res)
      } else {
        return Promise.reject(res)
      }
    }, error => {
      commit(types.SET_USER, {
        user: {
          logined: false
        }
      })
      return Promise.reject(error)
    })
  },
  updateUser: ({ commit, state }, updateData) => {
    return updateUser(updateData).then(data => {
      commit(types.SET_USER, {
        user: data
      })
    })
  },
  trial: ({commit, state, dispatch}) => {
    return register({visitor: 'True'}).then(visitor => {
      return dispatch('login', {
        user: {
          username: visitor.username,
          password: visitor.password
        }
      })
    }, error => {
      Vue.cookie.delete('csrftoken')
      Vue.cookie.delete('access_token')
      Vue.cookie.delete('refresh_token')

      return Promise.reject(error)
    })
  },
  setUser: ({commit, state}, data) => {
    commit(types.SET_USER, data)
  },
  resetUser: ({commit, state, dispatch}, data) => {
    dispatch('updateChatList', [])
    commit(types.RESET_USER)
  },
  startLoading: ({ commit }) => {
    commit(types.START_LOADING)
  },
  endLoading: ({ commit }) => {
    commit(types.END_LOADING)
  },
  setGlobalConfig: ({ commit }, data) => {
    commit(types.SET_GLOBAL, data)
  },
  updateChatList: ({ commit, state }, data) => {
    commit(types.UPDATE_CHATLIST, data)
  },
  startChat: ({ commit, state }, data) => {
    commit(types.START_CHAT, data)
  },
  getChatMessages: ({ commit, state }, data) => {
    commit(types.GET_CHATMESSAGES, data)
  },
  endChat: ({ commit, state }) => {
    commit(types.END_CHAT)
  },
  setWebsocket: ({ commit, state }, data) => {
    commit(types.SET_WEBSOCKET, data)
  },
  updateChatRead: ({ commit, state }, data) => {
    commit(types.UPDATE_CHATREAD, data)
  },
  setRoomMsgs: ({ commit, state }, data) => {
    commit(types.SET_ROOMMSGS, data)
  },
  setRooms: ({ commit, state }, data) => {
    commit(types.SET_ROOMS, data)
  },
  setStickerGroups: ({ commit, state }, data) => {
    commit(types.SET_STICKERGROUPS, data)
  },
  collectEnvelope: ({ commit, state }, data) => {
    commit(types.COLLECT_ENVELOPE, data)
  },
  updateUnloginedDialog: ({ commit, state }, data) => {
    commit(types.UPDATE_UNLOGINEDDIALOG, data)
  }
}
