<template>
  <div class="rooms-container">
    <ul class="rooms m-t m-b">
      <li v-for="(room, index) in roomList"
        :key="index"
        :class="{
          active: activeRoomIndex === index,
          public: room.type === 1
        }"
        @click="switchRoom(room, index)">
        <div class="meta">
          <div class="illustration">
            <icon class="volume-up" name="comments" scale="1.5" v-if="room.type === 1"></icon>
            <img class="avatar" v-else-if="room.type === 2" :src="require('../assets/stick_admin.png')" alt="avatar">
            <img class="avatar" v-else-if="room.users.length === 2" :src="room.users[1].avatar ? room.users[1].avatar : require('../assets/avatar.png')" alt="avatar">
            <img class="avatar" v-else :src="require('../assets/avatar.png')" alt="avatar">
          </div>
          <span class="title" v-if="room.type === 2">
            {{ `客服人员 ${room.users[1].nickname || room.users[1].username}`}}
          </span>
          <span class="title" v-else>
            <span v-if="room.type === 3 && room.users.length === 2">{{ `与 ${room.users[1].nickname || room.users[1].username} 的私聊`}}</span>
            <span v-else>{{room.title}}</span>
          </span>
        </div>
        <div v-if="room.last_message">{{room.last_message.content | truncate(25)}}</div>
      </li>
    </ul>
  </div>
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
    activeRoom: {
      handler: function (val, oldVal) {
        this.roomEnded = false
        this.roomPage = 0
        this.fillMemberRooms().then(() => {
          this.activeRoomIndex = _.findIndex(this.roomList, room => room.id === this.activeRoom.id)
          this.$store.commit('UPDATE_NOW_ROOM_ID', this.roomList[this.activeRoomIndex].id)
        })
      },
      deep: true
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
  methods: {
    fillMemberRooms () {
      this.roomLoading = true
      return fetchMemberRoom(this.roomLimit, this.roomPage).then(res => {
        this.roomList = this.roomPage === 0 ? res.results : this.roomList.concat(res.results)
        this.roomEnded = this.roomLimit * (this.roomPage + 1) > this.roomList.length
        this.roomPage += 1
        this.roomLoading = false

        console.log(this.roomList, 'this.roomList1')
        console.log(this.roomEnded, 'this.roomEnded')
        console.log(this.roomPage, 'this.roomPage')

        let temp = []
        this.roomList.forEach((room) => {
          if (room.users && room.users.length < 2 && (room.type === 2 || room.type === 3)) {
            return
          }
          temp.push({...room})
        })

        this.roomList = temp
        console.log(this.roomList, 'this.roomList2')
        this.$store.dispatch('updateRoomList', this.roomList)

        return res
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
.rooms-container {
   height: calc(100vh - 110px);
   overflow-y: auto;
}
.rooms {
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
  .avatar {
    width: 28px;
    height: 28px;
    margin-right: 10px;
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
.illustration {
  display: inline-block;
}
</style>
