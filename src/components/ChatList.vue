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
    <div class="search-form m-t m-b m-l m-r" v-if="!unread">
      <el-form>
        <el-form-item>
          <el-input v-model="searchData.input"
            placeholder="请输入帐号名"
            class="ipt-search"
            @keyup.native.enter="search"></el-input>
            <span class="el-icon-search pointer" @click="search"></span>
        </el-form-item>
      </el-form>
      <div v-if="searchData.searching">
        搜索 「{{searchData.input}}」中
        <span class="exit-search pointer" @click="exitSearch">退出搜索</span>
      </div>
    </div>
    <div class="rooms-container">
      <ul class="rooms m-b" v-if="showing.length">
        <li v-for="(item, index) in showing"
          :key="index"
          :class="{
            active: (item.id === chat.current.chatWith) && unread,
            unread: !item.read && unread
          }">
          <div class="meta" @click="enterChat(item)" v-if="unread">
            <div class="illustration">
              <img class="avatar"
                :src="item.avatar? item.avatar : require('../assets/avatar.png')"
                alt="avatar">
            </div>
            <span class="title">
              <span>{{ item.username }}</span>
            </span>
          </div>

        <el-popover
          v-else
          placement="right"
          trigger="click">
          <div>
            <div class="action pointer" @click="enterChat(item)">與 {{item.username}} 私聊</div>
            <div class="action pointer" @click="handleChatClick(item)">查看 {{item.username}}</div>
          </div>
          <div class="meta" slot="reference">
            <div class="illustration">
              <img class="avatar"
                :src="item.avatar? item.avatar : require('../assets/avatar.png')"
                alt="avatar">
            </div>
            <span class="title">
              <span>{{ item.username }}</span>
            </span>
          </div>
          </el-popover>

        </li>

        <li  v-if="!unread && (pagination.total > chats.length && !searchData.input.length)" @click="fillMemberChats">更多...</li>
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
    },
    rooms: {
      type: Object
    },
    roomAmount: {
      type: Number
    }
  },
  data () {
    return {
      loading: false,
      chats: [],
      pagination: {
        total: 0,
        offset: 0,
        limit: 40
      },
      unreadChats: [],
      interval: null,
      previousChat: null,
      allChatList: [],
      searchData: {
        searching: false,
        input: '',
        result: []
      },
      roomList: []
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
      let showing
      if (this.searchData.searching) {
        showing = this.searchData.result
      } else {
        this.initRoomList()

        showing = this.unread ? this.roomList : this.chats
      }
      return showing
    }
  },
  watch: {
    'chat.current.roomId': {
      handler: function (val, oldVal) {
        if (val === 1 || oldVal === 1) {
          return
        }

        let key = this.rooms[oldVal]
        let previous = this.chatList.filter(chat => chat.id === key)
        this.leaveChat(oldVal, previous[0])
      },
      deep: true
    },
    'searchData.input': function (ipt) {
      if (!ipt.length) {
        this.exitSearch()
      }
    },
    'roomAmount': {
      handler: function () {
        this.initRoomList()
      },
      deep: true
    }
  },
  methods: {
    initRoomList () {
      if (!this.rooms) { return }
      let temp = []
      let values = Object.values(this.rooms)
      getChatList().then(res => {
        this.allChatList = res
        values.forEach((val) => {
          temp.push(this.allChatList.find((chat) => chat.id === val.id))
        })
        this.roomList = temp
      })
    },
    handleChatClick (chat) {
      if (this.unread) {
        this.enterChat()
      } else {
        this.$emit('getChosenChat', chat)
      }
    },
    exitSearch () {
      this.searchData = {
        searching: false,
        input: '',
        result: []
      }
    },
    search () {
      if (!this.searchData.input) {
        return
      }
      this.loading = true
      this.searchData.searching = true
      if (!this.allChatList.length) {
        getChatList().then(res => {
          this.allChatList = res
          let filtered = this.allChatList.filter(obj => obj.username.toLowerCase().indexOf(this.searchData.input.toLowerCase()) !== -1)

          this.searchData.result = filtered

          this.loading = false
        })
      } else {
        let filtered = this.allChatList.filter(obj => obj.username.toLowerCase().indexOf(this.searchData.input.toLowerCase()) !== -1)
        this.searchData.result = filtered
      }
    },
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
      if (!previousChat) {
        return
      }

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
      if (chat && chat.isHall) {
        this.$store.dispatch('startChat', {id: 1})
        return
      }
      if (!this.unread) {
        this.$emit('switchToRooms')
      }
      if (this.loading) {
        return
      }
      this.loading = true

      buildRoom({
        type: 2,
        status: 1,
        last_message: '',
        users: [this.user.id, chat.id]
      }).then(res => {
        this.$store.dispatch('setRooms', {
          id: chat.id,
          roomId: res.room.id,
          username: chat.username
        })

        this.$store.dispatch('startChat', {id: res.room.id, chatWith: chat.id, otherUser: chat.username})
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

        this.initRoomList()
      })
    },
    initChats () {
      this.fillMemberChats(this.pagination)
      this.interval = setInterval(() => {
        this.fillMemberChats()
      }, 120000)
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
    if (!this.unread) {
      this.initChats()
    }
  },
  beforeDestroy () {
    clearInterval(this.interval)
  }
}
</script>
<style lang="scss" scoped>
.rooms-container {
   height: calc(100% - 90px);
   overflow-y: auto;
}
.rooms {
  border-top: 1px solid rgba(255, 255, 255, .1);
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
  .unread {
    background: #FFB74D;
  }
  .active {
    background: #1976D2;
    color: #fff;
    font-weight: 700;
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

.ipt-search /deep/ .el-input__inner{
  background: #999;
  border: none;
  color: #fff;
  &::placeholder {
    color: #ccc;
  }
}
.el-icon-search {
  position: absolute;
  right: 10px;
  top: 5px;
  font-size: 18px;
  font-weight: bolder;
  &:hover {
    color: #666;
  }
}
.exit-search {
  float: right;
}

.action {
  position: relative;
  border-bottom: 1px solid #ddd;
  padding-top: 5px;
  padding-bottom: 5px;
  line-height: 24px;
  &:after {
    position: absolute;
    content: '';
    left: 0;
    bottom: 0;
    width: 0;
    height: 1px;
    background: #000;
    transition: width .3s;
  }
  &:hover {
    color: black;
    &:after {
      width: 100%;
    }
  }
}
</style>
