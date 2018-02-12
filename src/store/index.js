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
      roomList: [],
      activeRoomId: 1,
      newMsg: {}
    },
    actions,
    mutations,
    getters
  })
}
