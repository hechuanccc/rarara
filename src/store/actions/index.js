import axios from 'axios'
import Vue from 'vue'

import * as types from '../mutations/mutation-types'

import {
  login,
  logout,
  fetchUser,
  updateUser
} from '../../api'

export default {
  login: ({ commit, state, dispatch }, { user }) => {
    return login(user).then(res => {
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

      dispatch('fetchUser')
      return Promise.resolve(res)
    }, error => {
      if (error.code === 9011) {
        Vue.cookie.set('sessionid', error.data.sessionid)
      }
      return Promise.reject(error)
    })
  },
  logout: ({ commit, state }) => {
    return logout().then(
      res => {
        Vue.cookie.delete('access_token')
        Vue.cookie.delete('refresh_token')
        commit(types.RESET_USER)
      },
      errRes => Promise.reject(errRes)
    )
  },
  fetchUser: ({ commit, state }) => {
    return fetchUser().then(res => {
      if (res) {
        commit(types.SET_USER, {
          user: {
            ...res,
            logined: true
          }
        })
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
  setUser: ({commit, state}, data) => {
    commit(types.SET_USER, data)
  },
  resetUser: ({commit, state}, data) => {
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
  collectEnvelope: ({ commit, state }, data) => {
    commit(types.COLLECT_ENVELOPE, data)
  }
}
