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
        logined: false,
        roles: [],
        default_room_id: 1
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
          messages: [],
          type: 1
        }
      },
      restraintMembers: {},
      roomMsgs: {},
      rooms: [],
      envelopes: {},
      ws: null,
      unloginedDialog: {
        visible: false,
        status: 'Login'
      }
    },
    actions,
    mutations,
    getters
  })
}
