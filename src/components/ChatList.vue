<template>
  <div class="rooms-container">

    <ul class="rooms m-t">
      <li :class="['public', {active: activeChatIndex === 1}]"
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

    <ul class="rooms m-b" v-if="chatList.length">
      <li v-for="(chat, index) in chatList"
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
    </ul>

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
  data () {
    return {
      loading: false,
      activeChatIndex: 1,
      previousChat: null
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
    ])
  },
  methods: {
    getRoles (user) {
      return user.roles.map((role) => role.name)
    },
    fillMemberRooms () {
      if (this.loading) {
        return
      }
      this.loading = true
      getChatList().then(res => {
        this.loading = false

        this.$store.dispatch('updateChatList', res.results)
        return res
      })
    },
    switchChat (chat, index) {
      if (this.loading) {
        return
      }

      if (this.previousChat) {
        let oldMsgs = this.previousChat.messages.filter(msg => msg.type !== -1)
        let oldLastMsg = oldMsgs[oldMsgs.length - 1]
        if (oldLastMsg) {
          let oldLastMsgData = {
            id: oldLastMsg.id,
            other: this.previousChat.other
          }
          this.read(this.ws, this.previousChat.id, oldLastMsgData)
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
          this.$store.dispatch('startPrivateChat', {id: res.room.id, chatWith: chat.username})
          this.$store.dispatch('updateChatRead', {username: chat.username, read: true})
          this.loading = false
          let currentMsg = this.roomMsgs[res.room.id] ? this.roomMsgs[res.room.id] : []
          let msgs = currentMsg.filter(msg => msg.type !== -1)
          let lastMessage = msgs[msgs.length - 1]
          if (lastMessage) {
            let lastMessageData = {
              id: lastMessage.id,
              other: chat.username
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
        user: this.user.username
      }))
    }
  },
  created () {
    this.fillMemberRooms()
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
