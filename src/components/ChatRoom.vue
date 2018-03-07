<template>
  <div class="container-chat">
    <el-container
      class="chat-box"
      v-loading="loading"
      id="chatBox"
      element-loading-text="正在登录计划聊天室">
      <el-main class="content" id="chatBox">
        <ul class="lay-scroll">
          <li v-for="(item, index) in showingMessages"
            :key="index"
            :class="
              ['clearfix',
                'item',
                item.sender && (user.username === item.sender.username) ? 'item-right' : 'item-left', item.type < 0 ? 'sys-msg' : ''
              ]">
            <div class="lay-block clearfix" v-if="item.type >= 0">
              <div class="avatar" @click="handleAvatarClick(item)">
                <icon name="cog" class="font-cog" v-if="item.type == 4" scale="3"></icon>
                <img :src="item.sender && item.sender.avatar ? item.sender.avatar : require('../assets/avatar.png')" v-else>
              </div>
              <div class="lay-content">
                <div class="msg-header">
                  <h4>{{item.type === 4 ? '计划消息' : item.sender && item.sender.username === user.username && user.nickname ? user.nickname : item.sender && (item.sender.nickname || item.sender.username)}}</h4>
                  <span class="common-member" v-if="item.type !== 4">
                    {{item.sender && item.sender.roles.length && getRoles(item).includes('manager') ? '管理员' : '普通会员'}}
                  </span>
                  <span class="msg-time">{{item.created_at | moment('HH:mm:ss')}}</span>
                </div>
                <div :class="['bubble', 'bubble' + item.type]">
                  <p>
                    <span v-if="item.type === 0 || item.type === 4">{{item.content}}</span>
                    <img @click="showImageMsg = true; showImageMsgUrl = item.content" v-else-if="item.type === 1" :src="item.content">
                  </p>
                </div>
              </div>
            </div>
            <div class="inner" v-else-if="item.type === -1">
              <p>以上是历史消息</p>
            </div>
          </li>
          <li v-if="personal_setting.block" class="block-user-info">您已被管理员拉黑，请联系客服。<li>
          <li ref="msgEnd" id="msgEnd" class="msgEnd"></li>
        </ul>
      </el-main>
      <el-footer class="footer" height="100">
        <div class="control-bar">
          <el-popover
            ref="popover4"
            placement="top-start"
            width="260"
            trigger="click">
            <div class="emoji-container">
              <a href="javascript:void(0)"
                v-for="(item, index) in emojis.people.slice(0, 42)"
                :key="index"
                class="emoji"
                @click="personal_setting.chat.status ? msgContent = msgContent + item.emoji + ' ' : ''">
                {{item.emoji}}
              </a>
            </div>
          </el-popover>
          <a v-popover:popover4
            v-if="emojiSuccess"
            href="javascript:void(0)"
            title="发送表情"
            class="btn-control btn-smile">
            <icon scale="1.3" name="smile-o"></icon>
          </a>
          <a href="javascript:void(0)" class="btn-control btn-smile">
            <label for="imgUploadInput">
              <span title="上传图片">
                <i class="el-icon-picture"></i>
                <input :disabled="!personal_setting.chat.status" @change="sendMsgImg" type="file" ref="fileImgSend" class="img-upload-input" id="imgUploadInput" accept=".jpg, .png, .gif, .jpeg, image/jpeg, image/png, image/gif">
              </span>
            </label>
          </a>
          <span v-if="personal_setting.user && myRoles.includes('manager')" class="btn-control right" @click="openManageDialog()" >
            <icon name="cog" class="font-cog" scale="1.4"></icon>
          </span>

          <div class="chat-buttons" v-if="ws && !myRoles.includes('customer service') || !myRoles.includes('manager')">
            <el-button :type="chat.read ? '' : 'warning'"
              :plain="chat.read"
              :key="index"
              size="mini"
              @click.native="openChatDialog(chat)"
              v-for="(chat, index) in chatList">
              {{`客服 ${index + 1}`}}
            </el-button>
          </div>

        </div>
        <div class="typing">
          <div :class="['txtinput', 'el-textarea', !personal_setting.chat.status ? 'is-disabled' : '']">
            <textarea  @keyup.enter="sendMsg"
              placeholder="请文明发言"
              type="textarea" rows="2"
              autocomplete="off"
              validateevent="true"
              class="el-textarea-inner"
              v-model="msgContent"
              :disabled="!personal_setting.chat.status">
            </textarea>
          </div>
          <div class="sendbtn fr">
            <a href="javascript:void(0)" class="u-btn" @click="sendMsg">发送</a>
          </div>
        </div>
      </el-footer>
    </el-container>

    <!-- chatting image lightbox -->
    <el-dialog :visible.sync="showImageMsg"
      width="640px"
      custom-class="text-center"
      append-to-body>
      <img :src="showImageMsgUrl" class="popup-uploadedimage">
    </el-dialog>

    <!-- restraint dialog for manager -->
    <el-dialog
      title="管理"
      :visible.sync="restraint.dialogVisible"
      :width="restraint.showManageDialog ? '700px' : '30%'"
      class="restraint-dialog"
      :append-to-body="true"
      :modal-append-to-body="true"
      center>
      <Restraint :restraint="restraint"
        :blockedUsers="blockedUsers"
        :bannedUsers="formattedBannerUsers"
        :RECEIVER="1"
        @updateUsers="updateUsers"
        />
    </el-dialog>

    <!-- private chat dialog -->
     <el-dialog
       class="privatechat-dialog"
       :visible.sync="chat.dialogVisible"
       :width="'550px'"
       @close="closeChatDialog()"
       top="10vh"
       center>
      <PrivateChat :personalSetting="personal_setting"
        :emojis="emojis"
        :joinChatRoom="joinChatRoom"
        v-if="chat.current.roomId && chat.current.roomId !== 1"/>
    </el-dialog>

  </div>

</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/cog'
import 'vue-awesome/icons/smile-o'
import { fetchChatEmoji, sendImgToChat, getChatUser, buildRoom, getChatList } from '../api'
import urls from '../api/urls'
import { msgFormatter } from '../utils'
import config from '../../config'
import { mapGetters, mapState } from 'vuex'
import PrivateChat from '../components/PrivateChat'
import Restraint from './Restraint'

const WSHOST = config.chatHost

export default {
  components: {
    Icon,
    Restraint,
    PrivateChat
  },
  data () {
    return {
      ws: null,
      msgContent: '',
      showImageMsg: false,
      showImageMsgUrl: '',
      loading: false,
      emojis: {
        people: []
      },
      chatHall: 1,
      RECEIVER: 1,
      personal_setting: {
        chat: {
          reasons: []
        }
      },
      blockedUsers: [],
      bannedUsers: [],
      restraint: {
        dialogVisible: false,
        user: '',
        showManageDialog: false,
        showRestraintDialog: false,
        nowTab: '0',
        tabs: [
          {
            display: '黑名单'
          },
          {
            display: '禁言'
          }
        ]
      },
      roomMessages: {},
      host: urls.domain,
      emojiSuccess: true,
      currentChat: null
    }
  },
  watch: {
    'chat.current.roomId' (val) {
      this.RECEIVER = val

      this.roomMessages[val] = this.roomMessages[val] ? this.roomMessages[val] : []
      this.$store.dispatch('getChatMessages', this.roomMessages[val])

      this.$nextTick(() => {
        this.$refs.msgEnd && this.$refs.msgEnd.scrollIntoView()
      })
    },
    'roomMessages': function () {
      this.$store.dispatch('setRoomMsgs', this.roomMessages)
      this.$forceUpdate()
    }
  },
  beforeDestroy () {
    this.leaveRoom()
    this.$store.dispatch('endChat')
    clearInterval(this.liveInterval)
  },
  computed: {
    ...mapGetters([
      'myRoles'
    ]),
    ...mapState([
      'user',
      'chat',
      'chatList'
    ]),
    isLogin () {
      return this.$store.state.user.logined && this.$route.name !== 'Home'
    },
    formattedBannerUsers () {
      let result = []
      if (this.bannedUsers.length) {
        this.bannedUsers.forEach((item) => {
          result.push({
            username: item.username,
            banned_time: this.$moment(item.banned_time).fromNow(true)
          })
        })

        return result
      }
    },
    showingMessages () {
      const showing = this.myRoles.includes('customer service') ? this.roomMessages[this.chat.current.roomId] : this.roomMessages[1]
      return showing
    }
  },
  created () {
    if (!this.myRoles.includes('customer service')) {
      this.getChatList({offset: 0, limit: 20})
    }
    if (this.$route.name !== 'Home') {
      this.leaveRoom()
    } else {
      this.joinChatRoom()
    }
  },
  methods: {
    getChatList (pagination) {
      getChatList(pagination).then(data => {
        this.$store.dispatch('updateChatList', data.results)
      })
    },
    openChatDialog (chat) {
      let obj = {
        type: 2,
        status: 1,
        latest_message: '',
        users: [this.user.id, chat.id]
      }

      buildRoom(obj).then(res => {
        let newRoom = res.room
        this.$store.dispatch('startChat', {id: newRoom.id, chatWith: chat.id})
        this.$store.dispatch('updateChatRead', {username: chat.username, read: true})

        let currentMsg = this.roomMessages[newRoom.id] ? this.roomMessages[newRoom.id] : []
        if (currentMsg.length) {
          let msgs = currentMsg.filter(msg => msg.type !== -1)
          let lastMessage = msgs[msgs.length - 1]
          let lastMsgData = {
            msgId: lastMessage.id,
            other: chat.id
          }
          this.read(this.ws, newRoom.id, lastMsgData)

          this.currentChat = {
            chat: chat,
            roomId: newRoom.id
          }
        }
      }, errRes => {
        this.openMessageBox(msgFormatter(errRes), 'error')
      })
    },
    closeChatDialog () {
      if (!this.currentChat) {
        return
      }
      let room = this.currentChat.roomId
      let currentMsg = this.chat.current.messages ? this.chat.current.messages : []

      if (currentMsg.length) {
        let msgs = currentMsg.filter(msg => msg.type !== -1)
        let lastMessage = msgs[msgs.length - 1]
        let lastMsgData = {
          msgId: lastMessage.id,
          other: this.currentChat.chat.username
        }
        this.read(this.ws, room, lastMsgData)
        this.currentChat = null
      }
      this.$store.dispatch('endChat')
    },
    read (connection, roomId, lastMsg) {
      if (connection) {
        connection.send(JSON.stringify({
          command: 'read_msg',
          message: lastMsg.msgId,
          chat_with: lastMsg.other,
          room: roomId,
          user: this.user.username
        }))
      }
    },
    checkLiving (ws) {
      this.liveInterval = setInterval(() => {
        ws.send(JSON.stringify({
          command: 'live',
          user_id: this.user.username
        }))
      }, 300000)
    },
    getRoles (message) {
      return message.sender.roles.map((role) => role.name)
    },
    joinChatRoom () {
      let token = this.$cookie.get('access_token')
      this.loading = true
      this.$store.dispatch('startLoading')

      this.ws = new WebSocket(`${WSHOST}/chat/stream?token=${token}`)

      this.ws.onopen = () => {
        this.$store.dispatch('setWebsocket', this.ws)

        this.checkLiving(this.ws)

        if (!this.emojis.people.length) {
          fetchChatEmoji().then((resData) => {
            this.emojis = resData
          }).catch(() => {
            this.emojiSuccess = false
          })
        }

        this.handleMsg()
      }
      this.ws.onclose = () => {
        this.ws = null
        this.$store.dispatch('setWebsocket', this.ws)
      }
      this.ws.onerror = (err) => {
        console.log(err)
      }
    },
    handleMsg () {
      this.loading = false
      this.$store.dispatch('endLoading')
      if (!this.ws) { return false }

      this.ws.send(JSON.stringify({
        'command': 'join',
        'receivers': [this.chatHall]
      }))

      this.ws.onmessage = (resData) => {
        let correctResponse = typeof (resData.data) === 'string'
        if (correctResponse) {
          try {
            let data = JSON.parse(resData.data)

            if (!data.error_type) {
              let latestMsg = data.latest_message

              if (latestMsg) {
                if (data.count) {
                  let lastMsg = latestMsg[0]

                  latestMsg.forEach((msg) => {
                    if (!msg.sender.avatar) {
                      return
                    }
                    msg.sender.avatar = this.host + msg.sender.avatar
                  })

                  this.$set(this.roomMessages, lastMsg.receivers, latestMsg.reverse().concat([{ type: -1 }]))
                }

                this.$nextTick(() => {
                  this.$refs.msgEnd && this.$refs.msgEnd.scrollIntoView()
                })

                return
              } else if (data.personal_setting) {
                this.personal_setting = data.personal_setting
                this.$store.dispatch('setUser', data.personal_setting)
              } else {
                switch (data.type) {
                  case 2:

                    if (data.command === 'banned') {
                      this.openMessageBox(data.content, 'error')
                    } else if (data.command === 'unblock') {
                      this.personal_setting.blocked = false
                      this.joinChatRoom()
                    } else if (data.command === 'unbanned') {
                      this.personal_setting.chat.status = 1
                    }

                    this.$notify({
                      message: data.content,
                      offset: 100,
                      type: 'success',
                      duration: 2200,
                      customClass: 'top-right-msg',
                      showClose: false
                    })

                    return
                  default:
                  // websocket/upload/user-avatar/54fa2ca4059245f29be5e9da2c55e14a.jpg
                  // /upload/user-avatar/c82833fa36b54aa7ab40ce8ab3eac68b.jpg
                    if (data.sender && data.sender.avatar !== null) {
                      data.sender.avatar = this.host + '/' + data.sender.avatar.replace('websocket/', '')
                      if (data.sender.avatar.indexOf('//upload') !== -1) {
                        data.sender.avatar = data.sender.avatar.replace('//upload', '/upload')
                      }
                    }

                    if (!this.roomMessages[data.receivers]) {
                      this.roomMessages[data.receivers] = []
                    }

                    this.roomMessages[data.receivers].push(data)

                    let meSpeaking = (data.sender.username === this.user.username)
                    let inCurrentRoom = (this.chat.current.roomId === data.receivers)

                    if (!meSpeaking && !inCurrentRoom) {
                      this.$store.dispatch('updateChatRead', {username: data.sender.username, read: false})
                    }

                    this.$forceUpdate()
                }

                let chatBox = document.getElementById('chatBox')
                if (chatBox) {
                  let h = chatBox.clientHeight
                  let sh = chatBox.scrollHeight || chatBox.offsetHeigth
                  let st = chatBox.scrollTop || document.documentElement.scrollTop || document.body.scrollTop
                  if (h + st + 100 >= sh || (data.sender && data.sender.username === this.user.username)) {
                    this.$nextTick(() => {
                      this.$refs.msgEnd && this.$refs.msgEnd.scrollIntoView()
                    })
                  }
                }
              }
            } else {
              if (data.error_type !== 2 && data.error_type !== 3) {
                switch (data.error_type) {
                  case 4:
                    this.personal_setting.banned = true
                    this.personal_setting.chat.status = 0
                    this.openMessageBox('您已被聊天室管理员禁言，在' + this.$moment(data.msg).format('YYYY-MM-DD HH:mm:ss') + '后才可以发言。', 'error')
                    break
                  case 5:
                    this.personal_setting.block = true
                    this.personal_setting.chat.status = 0
                    this.openMessageBox(data.msg, 'error')
                    break
                  case 6:
                    this.openMessageBox(data.msg, 'error')
                    setTimeout(() => {
                      this.$store.dispatch('logout').then(res => {
                        this.$router.push({name: 'Login'})
                      })
                    }, 3000)
                    break
                  default:
                    this.openMessageBox(data.msg, 'error')
                }
              }
            }
          } catch (e) {
            console.log(e)
          }
        }
      }
      setTimeout(() => {
        this.$refs.msgEnd && this.$refs.msgEnd.scrollIntoView()
      }, 1000)
    },
    sendMsgImg (e) {
      let fileInp = this.$refs.fileImgSend
      let file = fileInp.files[0]
      if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(fileInp.value) || !this.personal_setting.chat.status) {
        this.openMessageBox('文件格式不正确或您目前尚不符合发言条件', 'error')
        return false
      }
      if (file.size > 1024 * 1024) {
        this.openMessageBox('图片尺寸太大，请选择较小尺寸的图片。', 'error')
        return
      }
      let formData = new FormData()

      formData.append('receiver', this.RECEIVER)
      formData.append('image', file)
      sendImgToChat(formData).then((data) => {
        fileInp.value = ''
      })
    },
    sendMsg () {
      if (!this.msgContent.trim()) { return false }
      if (!this.ws) {
        return this.joinChatRoom()
      }

      this.ws.send(JSON.stringify({
        'command': 'send',
        'receivers': [this.RECEIVER],
        'type': 0,
        'content': this.msgContent
      }))
      this.msgContent = ''
    },
    leaveRoom () {
      this.ws && this.ws.send(JSON.stringify({
        'command': 'leave',
        'receivers': [this.chatHall]
      }))

      if (this.ws) {
        this.ws.close()
      }
    },
    getUser () {
      getChatUser(1).then(response => {
        this.bannedUsers = response.banned_users
        this.blockedUsers = response.block_users
      })
    },
    updateUsers (data) {
      this.bannedUsers = data.banned_users
      this.blockedUsers = data.block_users
    },
    handleAvatarClick (message) {
      if (this.myRoles.includes('manager')) {
        let role = message.sender.roles.map((role) => role.name)
        if ((this.personal_setting.user.username === message.sender.username) || role.includes('manager')) {
          return
        }
        this.restraint.user = message.sender
        this.restraint.showManageDialog = false
        this.restraint.showRestraintDialog = true
        this.restraint.dialogVisible = true
      }
    },
    switchBlockTab (index) {
      this.restraint.nowTab = index + ''
    },
    openManageDialog () {
      this.restraint.showRestraintDialog = false
      this.restraint.showManageDialog = true
      this.restraint.dialogVisible = true

      this.getUser()
    },
    openMessageBox (msg, type) {
      this.$message({
        showClose: true,
        message: msg,
        type: type
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../style/vars.scss';

.container-chat {
  height: 100%;
}
.chat-box {
  width: 100%;
  overflow-x: hidden;
  height: 100%;
  z-index: 1;

}
.title {
  line-height: 40px;
  position: relative;
  background-color: #006bb3;
  color: #fff;
  padding: 0 10px;
  .font-home {
    margin-top: 8px;
  }
  h3 {
    font-size: 16px;
    color: #fff;
  }
  .close {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 8px 10px 0 0;
  }
  .right {
    font-size: 14px;
    .icon-user {
      cursor: pointer;
      margin: 8px 10px;
      cursor: pointer;
    }
  }
}

.content {
  background-color: rgba(255, 255, 255, .2);
  background-attachment: fixed;
  background-size: cover;
  padding: 10px;
  margin-bottom: 10px;
}

.chat-announce {
  position: absolute;
  top: 43px;
  left: 5px;
  right: 5px;
  background: rgba(237,244,254,.91);
  border: 1px solid #c2cfe2;
  border-radius: 5px;
  padding-right: 10px;
  height: 29px;
  overflow: hidden;
  z-index: 999;
  .ttl {
    display: block;
    float: left;
    background: #e1edfd;
    color: red;
    padding: 6px 8px;
    padding-top: 0;
    padding-bottom: 0;
    line-height: 29px;
    .volume-up {
      padding-top: 5px;
      margin-right: 4px;
    }
  }
  .scroll {
    display: block;
    margin-left: 72px;
    padding-top: 5px;
  }
}
.controls {
  position: absolute;
  top: 78px;
  left: 0;
  width: 100%;
  text-align: center;
  z-index: 999;
  .list-ctrl {
    margin: 0 5px;
    display: inline-block;
    background: #fff;
    border: 1px solid #e2e2e2;
    padding: 1px 9px;
    padding-left: 7px;
    border-radius: 15px;
    color: #a5a5a5;
    height: 17px;
  }
}
.lay-scroll {
  .block-user-info {
    text-align: center;
    padding-top: 100px;
    font-size: 16px;
    color: red;
  }
}
.item {
  margin-top: 20px;
  &.sys-msg {
    text-align: center;
    margin-top: 5px;
    .inner {
      color: #dedede;
      display: inline-block;
      background: rgba(255, 255, 255, .1);
      border-radius: 4px;
      padding: 5px 20px;
    }
    .type-warning {
      color: #f60;
      .btn-here {
        color: rgb(25, 158, 216);
      }
    }
  }
  &.item-left {
    .lay-block {
      .lay-content {
        .bubble:after {
          left: 0;
          border-left: 0;
          margin-left: -9px;
          border-right-color: inherit;
        }
      }
    }
  }
  &.item-right {
    .lay-block {
      .avatar {
        float: right;
      }
      .lay-content {
        float: right;
        margin-right: 15px;
        .msg-header {
          h4 {
            max-width: 150px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: right;
            float: right;
            padding-top: 2px;
            color: #fff;
          }

          span {
            float: right;
          }
        }
        .bubble {
          float: right;
        }
        .bubble:after {
          right: 0;
          border-right: 0;
          margin-right: -9px;
          border-left-color: inherit;
        }
      }
    }
  }
}
.lay-block {
  .avatar {
    width: 42px;
    height: 42px;
    cursor: pointer;
    float: left;
    .font-cog {
      color: #7285d6;
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 7px;
    }
  }
}

.common-member {
  display: inline-block;
  margin: 0 5px;
  background: #cb9b64;
  color: #fff;
  padding: 0 6px;
  border-radius: 10px;
  font-weight: 400;
  font-size: 10px;
}


.lay-content {
  margin-left: 18px;
  float: left;
  max-width: 75%;
}
.msg-header {
  overflow: hidden;
  margin-bottom: 5px;
  h4 {
    display: inline-block;
    color: #fff;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 400;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 12px;
    cursor: pointer;
  }

  .msg-time {
    display: inline-block;
    color: #ccc;
  }
}
.bubble {
  background: linear-gradient(to right, $primary, rgb(25, 158, 216));
  border-left-color: rgb(25, 158, 216);
  border-right-color: $primary;
  color: rgb(255, 255, 255);
  position: relative;
  border-radius: 5px;
  padding: 5px 8px;
  font-size: 13px;
  display: inline-block;
  p {
    width: 100%;
  }
  &.bubble1 {
    width: 55%;
  }
  &.bubble4 {
    background: #ab47bc;
    background: linear-gradient(to right,#ab47bc,#5169DE);
    border-left-color: #5169de;
    border-right-color: #ab47bc;
  }
  p {
    display: inline-block;
    span {
      white-space: pre-wrap;
      word-break: break-all;
    }
    img {
      width: 100%;
      min-height: 50px;
      cursor: pointer;
    }
  }
}
.bubble:after {
  content: '';
  position: absolute;
  top: 14px;
  width: 0;
  height: 0;
  border: 9px solid transparent;
  border-top: 0;
  margin-top: -7px;
}
.footer {
  background: rgba(0, 0, 0, .3);
  padding: 0;
  width: 100%;
  .control-bar {
    height: 32px;
    border: 1px solid #999;
    position: relative;
    overflow: hidden;
    .btn-smile {
      .img-upload-input {
        width: 0.1px;
        height: 0.1px;
        opacity: 0;
        position: absolute;
        top: -20px;
      }
    }
    .btn-smile:hover {
      background: #666;
    }
  }
  .typing {
    border: 1px solid #999;
    border-top: none;
    position: relative;
    .txtinput {
      display: block;
      width: auto;
      margin-right: 80px;
    }
    .el-textarea {
      vertical-align: bottom;
    }
    .is-disabled {
      .el-textarea-inner {
        background-color: #eef1f6;
        border-color: #d1dbe5;
        color: #bbb;
        cursor: not-allowed;
        height: 54px;
        resize: none;
      }
    }
    .el-textarea-inner {
      outline: none;
      display: block;
      padding: 5px 7px;
      line-height: 1.5;
      width: 100%;
      height: 80px;
      min-width: 100%;
      max-width: 100%;
      min-height: 80px;
      max-height: 80px;
      font-size: 14px;
      color: #fff;
      background-color: transparent;
      border: none;
      border-radius: 4px;
      transition: border-color .2s cubic-bezier(.645,.045,.355,1);
      box-sizing: border-box;
      background-image: none;
    }
  }

  .btn-control {
    float: left;
    display: inline-block;
    padding: 5px 12px;
    color: #ddd;
    cursor: pointer;
    &.right {
      float: right;
    }
    .el-icon-picture {
      cursor: pointer;
      font-size: 20px;
    }
  }
  .sendbtn {
    position: absolute;
    right: 0;
    bottom: 0;
  }
}
.edit-profile {
  max-width: 310px;
  border-radius: 5px;
  background: rgba(255,255,255,.93);
  margin: 50px auto 0;
  position: relative;
  min-height: 200px;
  border: 1px solid #c8d4e4;
  text-align: center;
  padding: 20px 0;
  width: 90%;
  z-index: 9999;
  color: #4f77ab;
  .avatar-upload-tip {
    font-size: 12px;
    color: rgb(255, 127, 77);
  }
  .icon-edit {
    font-size: 20px;
  }
  .avatar {
    display: inline-block;
    border-radius: 50%;
    width: 90px;
    height: 90px;
    border: 1px solid #c8d4e4;
    overflow: hidden;
    cursor: pointer;
    img {
      display: block;
      width: 100%;
    }
    label {
      display: block;
      position: absolute;
      top: 38px;
      left: 0;
      width: 100%;
      text-align: center;
      color: #fff;
      font-size: 50px;
      color: #909090;
      cursor: pointer;
    }
  }
  .txt-nick {
    font-size: 20px;
  }
  p {
    margin-top: 5px;
    cursor: pointer;
  }
  .u-btn {
    width: 56px;
    height: 20px;
    font-size: 12px;
    line-height: 20px;
  }
  .el-icon-edit-outline {
    color: $primary;
    font-size: 20px;
  }
}

.u-btn {
  display: inline-block;
  text-align: center;
  width: 80px;
  font-size: 14px;
  line-height: 80px;
  background: $primary;
  color: #fff;
  cursor: pointer;
}

.chat-guide {
  position: fixed;
  right: 0;
  top: 50%;
  width: 40px;
  height: 122px;
  margin-top: -76px;
  background-size: 100%;
  cursor: pointer;
  z-index: 0;
  background: #1e72df;
  border-radius: 8px 0 0 8px;
  padding-top: 14px;
  .font-wechat {
    color: #d1e6fe;
  }
  ul {
    font-size: 18px;
    color: #fff;
    li {
      text-align: center;
      padding: 4px 0;
    }
  }
}

.emoji-container {
  overflow-y: auto;
  .emoji {
    padding: 2px 6px 0 4px;
    display: inline-block;
    cursor: pointer;
    position: relative;
    font-size: 18px;
    text-align: center;
    border: 2px solid transparent;
  }
  .emoji:hover {
    border-color: #ff5a00;
  }
}

.popup-uploadedimage {
  width: 100%;
  height: 100%;
}

.chat-buttons {
  float: right;
  padding-top: 3px;
  margin-right: 10px;
  .is-plain {
    border: none;
  }
}

.privatechat-dialog /deep/ .el-dialog--center .el-dialog__header {
  padding-top: 0;
}
</style>
