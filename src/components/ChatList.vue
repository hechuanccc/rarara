<template>
  <div>
    <ul class="rooms" v-if="unread">
      <li :class="['public', {active: privateChat.current.roomId === 1}]"
        @click="switchChat(1, 1)">
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
        <li v-for="(chat, index) in showing"
          :key="index"
          v-if="chat.type !== 1"
          :class="{
            active: activeChatIndex === (index + 2),
            unread: !chat.read
          }"
          @click="switchChat(chat, index + 2)">
          <div class="meta">
            <div class="illustration">
              <img class="avatar"
                :src="chat.avatar? chat.avatar : require('../assets/avatar.png')"
                alt="avatar">
            </div>
            <span class="title">
              <span>{{ chat.username }}</span>
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
      activeChatIndex: 1,
      chats: [],
      pagination: {
        total: 0,
        offset: 0,
        limit: this.unread ? 10000 : 40
      },
      unreadChats: [],
      previousChat: null,
      interval: null
    }
  },
  watch: {
    'privateChat.current': {
      handler: function (val, oldval) {
        this.previousChat = {
          id: oldval.roomId,
          other: oldval.chatWith ? oldval.chatWith : val.chatWith,
          messages: oldval.messages
        }
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters([
      'myRoles'
    ]),
    ...mapState([
      'privateChat',
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
    switchChat (chat, index) {
      if (this.loading) {
        return
      }

      if (this.previousChat && !this.unread) {
        let oldMsgs = this.previousChat.messages.filter(msg => msg.type !== -1)
        let oldLastMsg = oldMsgs[oldMsgs.length - 1]
        if (oldLastMsg) {
          let oldLastMsgData = {
            id: oldLastMsg.id,
            other: this.previousChat.id
          }

          this.read(this.ws, this.previousChat.id, oldLastMsgData)
          this.$store.dispatch('updateChatRead', {username: chat.username, read: true})
        }
      }
      this.activeChatIndex = index

      if (index !== 1) {
        this.loading = true
        buildRoom({
          type: 2,
          status: 1,
          last_message: '',
          users: [this.user.id, chat.id]
        }).then(res => {
          this.$store.dispatch('startPrivateChat', {id: res.room.id, chatWith: chat.id})

          this.loading = false
          let currentMsg = this.roomMsgs[res.room.id] ? this.roomMsgs[res.room.id] : []
          let msgs = currentMsg.filter(msg => msg.type !== -1)
          let lastMessage = msgs[msgs.length - 1]
          if (lastMessage) {
            let lastMessageData = {
              id: lastMessage.id,
              other: chat.id
            }
            this.read(this.ws, res.room.id, lastMessageData)
          }
        })
      } else {
        this.$store.dispatch('startPrivateChat', {id: 1})
      }
    },
    read (connection, roomId, lastMsg) {
      connection.send(JSON.stringify({
        command: 'read_msg',
        message: lastMsg.id,
        chat_with: lastMsg.other,
        room: roomId,
        user: this.user.id
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
   height: calc(100vh - 160px);
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
