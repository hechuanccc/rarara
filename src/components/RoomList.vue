<template>
  <div class="rooms-container" v-loading="lastMsgloading" element-loading-text="聊天室加载中" element-loading-background="rgba(0, 0, 0, 0.3)">
    <ul class="list" v-if="rooms.length">
      <li :class="['item', 'pointer',
        { active: chat.current.roomId === room.id },
        { unread: !room.is_read_latest_message && room.type !== 1 }]"
        v-for="(room, index) in rooms"
        @click="enterRoom(room)"
        :key="index">
        <div v-if="room.type === 2">
          <!-- private chats-->
          <img class="img m-r" :src="room.chat_with.avatar || require('../assets/avatar.png')" :alt="room.title"/>
          <p class="title">{{room.chat_with.display_name}}</p>
        </div>
        <div class="m-l" v-else>
          <!-- halls-->
          <i class="icon el-icon-info m-r"></i>
          <p class="title">{{room.id === 1 ? room.title : `${room.title} 聊天室大厅`}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { fetchRooms } from '../api'
import { mapState, mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  props: {
    defaultHall: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      previousRoom: {
        id: this.defaultHall,
        type: 1
      }
    }
  },
  methods: {
    enterRoom (room) {
      this.leaveRoom(this.previousRoom)
      this.previousRoom = room

      if (room.type === 1) {
        this.$store.dispatch('startChat', {id: room.id, type: 1})
      } else {
        this.$store.dispatch('startChat', {
          id: room.id,
          chatWith: room.chat_with.id,
          otherUser: room.chat_with.display_name,
          type: 2
        })

        let allMsgs = this.roomMsgs[room.id]

        if (allMsgs && allMsgs.length) {
          let lastMsg = allMsgs[allMsgs.length - 1]
          this.read(this.ws, room.id, lastMsg)
        }
      }
    },
    leaveRoom (room) {
      if (!room) { return }

      if (room.type !== 1) {
        let allMsgs = this.roomMsgs[room.id]
        if (allMsgs && allMsgs.length) {
          let lastMsg = allMsgs[allMsgs.length - 1]
          this.read(this.ws, room.id, lastMsg)
        }
      }
    },
    read (connection, roomId, lastMsg) {
      connection.send(JSON.stringify({
        command: 'read_msg',
        message: lastMsg.id,
        room: roomId,
        user: this.user.id
      }))

      this.$store.dispatch('updateRoomRead', { roomId: roomId, read: true })
    },
    initRooms () {
      fetchRooms().then((rooms) => {
        let temp = []
        rooms.forEach((room) => {
          if (room.type === 1) {
            temp.push(room)
            return
          }
          if (room.chat_with && room.type === 2) {
            temp.push(room)
          }
        })

        if (this.chat.current.roomId && !_.find(rooms, room => room.id === this.chat.current.roomId)) {
          temp.push({
            id: this.chat.current.roomId,
            chat_with: {
              display_name: this.chat.current.otherUser
            },
            is_read_latest_message: true,
            type: 2
          })
        }

        this.$store.dispatch('setRooms', temp)

        if (this.myRoles.includes('manager')) {
          let roomIds = this.rooms.map(room => room.id)
          roomIds.shift()
          this.$store.dispatch('sendJoinCommand', roomIds)
        }
      })
    }
  },
  computed: {
    ...mapState([
      'chat',
      'rooms',
      'roomMsgs',
      'user',
      'ws'
    ]),
    ...mapGetters([
      'myRoles'
    ]),
    currentIndex () {
      return _.findIndex(this.rooms, obj => obj.id === this.chat.current.roomId)
    },
    lastMsgloading () {
      return this.rooms.length !== Object.keys(this.roomMsgs).length
    }
  },
  created () {
    this.initRooms()
  }
}
</script>

<style lang="scss" scoped>
.rooms-container {
  height: 100%;
  overflow-y: auto;
}

.list {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  .item {
    padding: 5px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    &.unread {
      background: #FFB74D;
    }

    &.active {
      background:#1976D2;
      font-weight: 700;
    }

    &:hover {
      background: rgba(255, 255, 255, .2);
    }

    .icon {
      font-size: 18px;
      vertical-align: middle;
      color: #fff;
    }

    .img {
      width: 28px;
      height: 28px;
      vertical-align: middle;
    }

    .title {
      display: inline-block;
      width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #fff;
      white-space: nowrap;
      font-size: 13px;
      vertical-align: middle;
    }
  }
}
</style>
