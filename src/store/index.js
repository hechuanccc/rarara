import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'

Vue.use(Vuex)

export function createStore () {
  return new Vuex.Store({
    state: {
      user: {
        logined: '',
        roles: []
      },
      loading: false,
      globalPreference: {
        mobile_url: ''
      },
      chatList: [],
      privateChat: {
        dialogVisible: false,
        current: {
          roomId: 1,
          messages: []
        }
      },
      roomMsgs: {},
      ws: null
    },
    actions,
    mutations,
    getters
  })
}
