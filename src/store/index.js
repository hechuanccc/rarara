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
        mobile_url: '',
        checkin_settings: {}
      },
      stickerGroups: [],
      chatList: [],
      chat: {
        dialogVisible: false,
        current: {
          roomId: 1,
          messages: []
        }
      },
      roomMsgs: {},
      rooms: [],
      envelopes: {},
      ws: null
    },
    actions,
    mutations,
    getters
  })
}
