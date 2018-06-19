<template>
  <div class="full-height">
    <div class="search-form m-t m-b m-l m-r">
      <el-input v-model="searchData.input"
        type="text"
        placeholder="请输入帐号名"
        class="ipt-search"
        @input="search"></el-input>
      <span class="el-icon-search pointer" @click="search"></span>
      <div v-if="searchData.searching">搜索 「{{searchData.input}}」中
        <span class="exit-search fr pointer" @click="exitSearch">退出搜索</span>
      </div>
    </div>
    <div class="chats-container">
      <ul class="chats m-b" v-if="showing.length">
        <li v-for="(item, index) in showing"
          :key="index"
          v-if="item"
          :class="['li', 'pointer', { online: item.online }]">
          <el-popover placement="right" trigger="click">
            <div v-if="isManager">
              <div v-if="!item.banned" class="action pointer" @click="ban(item, 15, index)">禁言 {{item.remarks || item.nickname}}</div>
              <div v-if="!item.blocked" class="action pointer" @click="block(item, index)">拉黑 {{item.remarks || item.nickname}}</div>
              <div v-if="item.banned" class="action pointer" @click="unban(item, index)">解除禁言 {{item.remarks || item.nickname}}</div>
              <div v-if="item.blocked" class="action pointer" @click="unblock(item, index)">解除拉黑 {{item.remarks || item.nickname}}</div>
            </div>
            <div v-else>
              <div class="action pointer" @click="enterChat(item)">与 {{item.remarks || item.nickname}} 私聊</div>
              <div class="action pointer" @click="handleChatClick(item)">查看 {{item.remarks || item.nickname}}</div>
            </div>
            <div slot="reference">
              <div class="illustration">
                <img class="avatar m-r"
                  :src="item.avatar || require('../assets/avatar.png')"
                  alt="avatar">
              </div>
              <p class="title">{{ item.remarks || item.nickname}}</p>
            </div>
          </el-popover>
        </li>
        <li class="pointer m-l" v-if="(pagination.total > chats.length && !searchData.input.length)" @click="fillMemberChats">更多...</li>
      </ul>
      <ul class="text-center m-t" v-else>暂无进行中的聊天</ul>
    </div>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import { getChatList, searchChatList, buildRoom, getChatUser, unbanChatUser, banChatUser, blockChatUser, unblockChatUser } from '../api'
import { mapState, mapGetters } from 'vuex'
import _ from 'lodash'
export default {
  name: 'chatlist',
  components: {
    Icon
  },
  props: {
    releasedUser: {
      type: Object
    },
    restraintedUser: {
      type: Object
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
      interval: null,
      searchData: {
        searching: false,
        input: '',
        result: []
      }
    }
  },
  computed: {
    ...mapState([
      'chat',
      'chatList',
      'user',
      'ws',
      'restraintMembers'
    ]),
    ...mapGetters([
      'myRoles'
    ]),
    showing () {
      let showing
      if (this.searchData.searching) {
        showing = this.searchData.result
      } else {
        showing = this.chats
      }
      return showing
    },
    isManager () {
      return this.myRoles.includes('manager')
    }
  },
  watch: {
    'searchData.input': function (ipt) {
      if (!ipt.length) {
        this.exitSearch()
      }
    },
    'releasedUser': function (obj) {
      let released = this.chats.find(chat => chat.username === obj.user)
      if (obj.action === 'unblock') {
        released.blocked = false
      }

      if (obj.action === 'unban') {
        released.banned = false
      }
    },
    'restraintedUser': function (obj) {
      let restraintedIdx = this.chats.findIndex(chat => chat.username === obj.user)
      if (obj.action === 'block') {
        this.$set(this.chats[restraintedIdx], 'blocked', true)
      }

      if (obj.action === 'ban') {
        this.$set(this.chats[restraintedIdx], 'banned', true)
      }
    }
  },
  methods: {
    handleChatClick (chat) {
      this.$emit('getChosenChat', chat)
    },
    exitSearch () {
      this.searchData = {
        searching: false,
        input: '',
        result: []
      }
    },
    search: _.debounce(function () {
      if (!this.searchData.input) {
        return
      }

      this.loading = true
      this.searchData.searching = true

      searchChatList(this.searchData.input).then(res => {
        this.searchData.result = res
        this.loading = false
      })
    }, 500),
    fillMemberChats () {
      if (this.loading) {
        return
      }
      this.loading = true

      getChatList(this.pagination).then(res => {
        this.chats.push(...res.results)
        this.pagination.total = res.count
        this.pagination.offset += this.pagination.limit
        this.$store.dispatch('updateChatList', this.chats)
        this.loading = false
        return res
      })
    },
    enterChat (chat) {
      if (this.loading) { return }
      this.loading = true
      buildRoom({
        type: 2,
        status: 1,
        last_message: '',
        users: [this.user.id, chat.id]
      }).then(res => {
        this.$store.dispatch('startChat', {
          id: res.room.id,
          chatWith: chat.id,
          otherUser: chat.username,
          type: 2
        })
        this.loading = false
        this.$emit('switchToRooms')
      })
    },
    initChats () {
      this.fillMemberChats(this.pagination)
      this.interval = setInterval(() => {
        this.fillMemberChats()
      }, 60000)
    },
    ban (chat, mins, index) {
      banChatUser(chat.default_room, {
        user: chat.username,
        banned_time: mins
      }).then((data) => {
        this.getUser(chat.default_room)
        this.$set(this.chats[index], 'banned', true)
        this.$forceUpdate()
        this.$message({
          showClose: true,
          message: data.status,
          type: 'success'
        })
      }, errorMsg => {
        this.$message({
          showClose: true,
          message: errorMsg.response.data.message,
          type: 'error'
        })
      })
    },
    unban (chat, index) {
      unbanChatUser(chat.default_room, {
        user: chat.username
      }).then((data) => {
        this.getUser(chat.default_room)
        this.$set(this.chats[index], 'banned', false)
        this.$forceUpdate()
        this.$message({
          showClose: true,
          message: data.status,
          type: 'success'
        })
      }, errorMsg => {
        this.$message({
          showClose: true,
          message: errorMsg.response.data.message,
          type: 'error'
        })
      })
    },
    block (chat, index) {
      blockChatUser(chat.default_room, {
        user: chat.username
      }).then((data) => {
        this.getUser(chat.default_room)
        this.$set(this.chats[index], 'blocked', true)
        this.$forceUpdate()
        this.$message({
          showClose: true,
          message: data.status,
          type: 'success'
        })
      }, errorMsg => {
        this.$message({
          showClose: true,
          message: errorMsg.response.data.message,
          type: 'error'
        })
      })
    },
    unblock (chat, index) {
      unblockChatUser(chat.default_room, {
        user: chat.username
      }).then((data) => {
        this.getUser(chat.default_room)
        this.$set(this.chats[index], 'blocked', false)
        this.$forceUpdate()
        this.$message({
          showClose: true,
          message: data.status,
          type: 'success'
        })
      }, errorMsg => {
        this.$message({
          showClose: true,
          message: errorMsg.response.data.message,
          type: 'error'
        })
      })
    },
    getUser (roomId) {
      getChatUser(roomId).then(response => {
        this.$store.dispatch('setRestraintMembers', {
          roomId: roomId,
          data: {
            block_users: response.block_users,
            banned_users: response.banned_users
          }})
      })
    }
  },
  created () {
    this.initChats()
  },
  beforeDestroy () {
    clearInterval(this.interval)
  }
}
</script>

<style lang="scss" scoped>
.chats-container {
   height: calc(100% - 90px);
   overflow-y: auto;
}
.chats {
  border-top: 1px solid rgba(255, 255, 255, .1);
  .title {
    display: inline-block;
    width: 150px;
    overflow: hidden;
    vertical-align: middle;
    font-size: 13px;
    color: #fff;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .avatar {
    width: 28px;
    height: 28px;
    vertical-align: middle;
  }
  .public .title {
    font-size: 14px;
  }
  .li {
    position: relative;
    color: #ccc;
    padding: 5px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, .2);
    &:hover {
      background: rgba(255, 255, 255, .2);
    }
    &.online:after {
      content: '';
      position: absolute;
      top: 50%;
      right: 20px;
      display: inline-block;
      width: 10px;
      height: 10px;
      margin-top: -5px;
      background-color: #00c300;
      border-radius: 50%;
    }
  }
}
.load-more {
  padding: 5px 10px;
}
.illustration {
  display: inline-block;
}
/* search */
.search-form {
  position: relative;
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
.action {
  position: relative;
  border-bottom: 1px solid #ddd;
  padding-top: 5px;
  padding-bottom: 5px;
  line-height: 24px;
  &:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 0;
    height: 1px;
    background-color: #000;
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
