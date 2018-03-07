<template>
  <div class="full-height" v-if="this.ws">
    <ul class="rooms" v-if="unread">
      <li :class="['public', {active: chat.current.roomId === 1}]"
        @click="enterChat({isHall: true})">
        <div class="meta">
          <div class="illustration">
            <icon class="volume-up" name="comments" scale="1.5"></icon>
          </div>
          <span class="title" >
            计划聊天室
          </span>
        </div>
      </li>
    </ul>
    <div class="rooms-container">
      <ul class="rooms m-b" v-if="showing.length">
        <li v-for="(item, index) in showing"
          :key="index"
          :class="{
            active: item.id === chat.current.chatWith,
            unread: !item.read
          }"
          @click="enterChat(item)">
          <div class="meta">
            <div class="illustration">
              <img class="avatar"
                :src="item.avatar? item.avatar : require('../assets/avatar.png')"
                alt="avatar">
            </div>
            <span class="title">
              <span>{{ item.username }}</span>
            </span>
          </div>
        </li>
        <li v-if="pagination.total > chats.length" @click="fillMemberChats">更多...</li>
      </ul>
      <ul class="text-center m-t" v-else>暂无进行中的聊天</ul>
    </div>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import { getChatList, buildRoom } from '../api'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'chatlist',
  components: {
    Icon
  },
  props: {
    unread: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: false,
      chats: [],
      pagination: {
        total: 0,
        offset: 0,
        limit: this.unread ? 10000 : 40
      },
      unreadChats: [],
      interval: null,
      previousChat: null,
      roomMap: {}
    }
  },
  computed: {
    ...mapGetters([
      'myRoles'
    ]),
    ...mapState([
      'chat',
      'roomMsgs',
      'chatList',
      'user',
      'ws'
    ]),
    showing () {
      const showing = this.unread ? this.chats.filter(chat => chat.read === false) : this.chats
      return showing
    }
  },
  watch: {
    'chat.current.roomId': {
      handler: function (val, oldVal) {
        if (val === 1 || oldVal === 1) {
          return
        }
        let key = this.roomMap[oldVal]
        let previous = this.chatList.filter(chat => chat.id === key)
        this.leaveChat(oldVal, previous[0])
      },
      deep: true
    }
  },
  methods: {
    getRoles (user) {
      return user.roles.map((role) => role.name)
    },
    fillMemberChats () {
      if (this.loading) {
        return
      }
      this.loading = true
      getChatList(this.pagination).then(res => {
        this.loading = false

        this.chats.push(...res.results)
        this.pagination.total = res.count

        this.$store.dispatch('updateChatList', this.chats)
        this.pagination.offset += this.pagination.limit
        return res
      })
    },
    leaveChat (roomId, previousChat) {
      let oldMsgs = this.roomMsgs[roomId].filter(msg => msg.type !== -1)
      let oldLastMsg = oldMsgs[oldMsgs.length - 1]

      if (oldLastMsg) {
        let oldLastMsgData = {
          id: oldLastMsg.id,
          other: previousChat.id
        }

        this.$store.dispatch('updateChatRead', {username: previousChat.username, read: true})
        this.read(this.ws, roomId, oldLastMsgData)
      }
    },
    enterChat (chat) {
      if (chat.isHall) {
        this.$store.dispatch('startChat', {id: 1})
        return
      }
      this.loading = true
      buildRoom({
        type: 2,
        status: 1,
        last_message: '',
        users: [this.user.id, chat.id]
      }).then(res => {
        this.roomMap[res.room.id] = chat.id
        this.$store.dispatch('startChat', {id: res.room.id, chatWith: chat.id})
        this.$forceUpdate()

        this.loading = false
        let currentMsg = this.roomMsgs[res.room.id] ? this.roomMsgs[res.room.id] : []
        let msgs = currentMsg.filter(msg => msg.type !== -1)
        let lastMessage = msgs[msgs.length - 1]
        if (lastMessage) {
          let lastMessageData = {
            id: lastMessage.id,
            other: chat.id
          }
          this.$store.dispatch('updateChatRead', {username: chat.username, read: true})
          this.read(this.ws, res.room.id, lastMessageData)
        }
      })
    },
    read (connection, roomId, lastMsg) {
      connection.send(JSON.stringify({
        command: 'read_msg',
        message: lastMsg.id,
        chat_with: lastMsg.other,
        room: roomId,
        user: this.user.username
      }))
    }
  },
  created () {
    this.fillMemberChats(this.pagination)
    this.interval = setInterval(() => {
      this.fillMemberChats()
    }, 120000)
  },
  beforeDestroy () {
    clearInterval(this.interval)
  }
}
</script>
<style lang="scss" scoped>
.rooms-container {
   height: calc(100% - 44px);
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
    background: #1976D2;
    color: #fff;
    font-weight: 700;
  }
  .unread {
    background: #FFB74D;
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
