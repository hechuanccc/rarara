<template>
  <ul class="rooms">
    <li v-for="(room, index) in roomList" :class="{
      active: activeRoomIndex === index,
      public: room.type === 1
    }" @click="switchRoom(room, index)">
      <div class="meta">
        <icon class="volume-up" name="comments" scale="1.5" v-if="room.type === 1"></icon>
        <span class="title">{{ room.target ? `与 ${room.target.nickname || '会员'} 的私聊` : room.title}}</span>
      </div>
      <div v-if="room.last_message">{{room.last_message.content | truncate(25)}}</div>
    </li>
  </ul>
</template>

<script>
import _ from 'lodash'
import Icon from 'vue-awesome/components/Icon'
import { fetchMemberRoom } from '../api'
export default {
  props: {
    user: {
      type: Object
    },
    activeRoom: {
      type: Object
    }
  },
  name: 'roomlist',
  components: {
    Icon
  },
  data () {
    return {
      roomLimit: 40,
      roomPage: 0,
      roomLoading: false,
      roomEnded: false,
      activeRoomIndex: 0,
      roomList: []
    }
  },
  watch: {
    activeRoom (val, oldVal) {
      this.roomEnded = false
      this.roomPage = 0
      this.fillMemberRooms()
        .then(() => {
          this.activeRoomIndex = _.findIndex(this.roomList, room => room.id === this.activeRoom.id)
          this.$store.commit('UPDATE_NOW_ROOM_ID', this.roomList[this.activeRoomIndex].id)
        })
    },
    '$store.state.newMsg': {
      handler: function (val, oldVal) {
        this.roomList.forEach((item, index) => {
          if (item.id === val.id) {
            item.last_message.content = val.content
          }
        })
      },
      deep: true
    }
  },
  created () {
  },
  methods: {
    fillMemberRooms () {
      if (this.roomEnded || this.roomLoading) {
        return
      }
      this.roomLoading = true
      return fetchMemberRoom(this.roomLimit, this.roomPage)
        .then(res => {
          this.roomList = this.roomPage === 0 ? res.results : this.roomList.concat(res.results)
          this.roomEnded = this.roomLimit * (this.roomPage + 1) > this.roomList.length
          this.roomPage += 1
          this.roomLoading = false
          this.roomList = this.roomList.map(room => {
            room.users.filter(user => user.id !== this.user.id)
            return {
              ...room,
              target: room.type !== 1 ? room.users[0] : undefined
            }
          })
          this.$store.commit('UPDATE_ROOMLIST', this.roomList)
        })
    },
    switchRoom (room, index) {
      this.$store.commit('UPDATE_NOW_ROOM_ID', room.id)
      this.activeRoomIndex = index
    }
  }
}
</script>
<style lang="scss" scoped>
.rooms {
  margin-top: 10px;
  height: calc(100vh - 110px);
  overflow-y: scroll;
  border-top: 1px solid rgba(255, 255, 255, .2);
  .fa-icon {
    vertical-align: middle;
    fill: #fff;
  }
  .title {
    color: #fff;
    font-size: 13px;
    vertical-align: middle;
  }
  .public .title {
    font-size: 14px;
  }
  li {
    color: #ccc;
    cursor: pointer;
    padding: 5px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, .2);
    &:hover {
      background: rgba(255, 255, 255, .2);
    }
  }
  .active {
    background: #FFB74D;
    color: #fff;
    &:hover {
      background: #FFB74D;
    }
  }
}
.load-more {
  text-align: center;
}
.default-room {
  .fa-icon {
    vertical-align: middle;
  }
}
</style>
