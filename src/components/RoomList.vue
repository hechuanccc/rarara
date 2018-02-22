<template>
  <div class="rooms-container" v-if="roomList.length && roomList[0].type === 1 && hallLastMsg">
    <ul class="rooms m-t">
      <li :class="['public', {active: activeRoomIndex === 0}]" @click="switchRoom(roomList[0], 0)">
        <div class="meta">
          <div class="illustration">
            <icon class="volume-up" name="comments" scale="1.5"></icon>
          </div>
          <span class="title" >
            计划聊天室
          </span>
        </div>
        <div class="last-message">{{hallLastMsg}}</div>
      </li>
    </ul>
    <ul class="rooms m-b">
      <li v-for="(room, index) in roomList"
        :key="index"
        v-if="room.type === 2"
        :class="{
          active: activeRoomIndex === index,
        }"
        @click="switchRoom(room, index)">
        <div class="meta">
          <div class="illustration">
            <img class="avatar"
              v-if="getRoles(room.users[1]).includes('customer service')"
              :src="require('../assets/stick_admin.png')"
              alt="avatar">
            <img class="avatar"
              :src="room.users[1].avatar? room.users[1].avatar :require('../assets/avatar.png')"
              v-else
              alt="avatar">
          </div>
          <span class="title">
            <span v-if="getRoles(room.users[1]).includes('customer service')">{{ `客服人员 ${room.users[1].nickname || room.users[1].username}`}}</span>
            <span v-else>{{ `与 ${room.users[1].nickname || room.users[1].username} 的私聊`}}</span>
          </span>
        </div>
        <div v-if="room.latest_message" class="last-message">{{room.latest_message}}</div>
      </li>
      <li class="load-more pointer" @click="fillMemberRooms()" v-if="!roomEnded" >查看更多</li>
    </ul>
  </div>
</template>

<script>
import _ from 'lodash'
import Icon from 'vue-awesome/components/Icon'
import { fetchMemberRoom } from '../api'
import { mapGetters } from 'vuex'

export default {
  props: {
    user: {
      type: Object
    },
    activeRoom: {
      type: Object
    },
    hallLastMsg: {
      type: String
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
  computed: {
    ...mapGetters([
      'myRoles'
    ])
  },
  watch: {
    'activeRoom': {
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
            item.latest_message = val.content
          }
        })
      },
      deep: true
    }
  },
  methods: {
    getRoles (user) {
      return user.roles.map((role) => role.name)
    },
    fillMemberRooms () {
      if (this.roomLoading || this.roomEnded) {
        return
      }
      this.roomLoading = true
      fetchMemberRoom(this.roomLimit, this.roomPage).then(res => {
        this.roomList = this.roomPage === 0 ? res.results : this.roomList.concat(res.results)
        this.roomEnded = this.roomLimit * (this.roomPage + 1) > res.count
        this.roomPage += 1
        this.roomLoading = false
        let temp = []
        this.roomList.forEach((room) => {
          if (room.users && room.users.length < 2 && (room.type === 2 || room.type === 3)) {
            return
          }
          temp.push({...room})
        })
        this.roomList = temp

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
  padding: 5px 10px;
}
.default-room {
  .fa-icon {
    vertical-align: middle;
  }
}
.illustration {
  display: inline-block;
}

.last-message {
  display: inline-block;
  width: 210px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
