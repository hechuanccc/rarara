<template>
  <div class="container-chat">
    <el-container
      class="chat-box"
      v-loading="loading"
      element-loading-text="正在登录计划聊天室">
      <el-main class="content" id="chatBox">
        <ul class="lay-scroll">
          <li v-for="(item, index) in showingMessages"
            :key="index"
            :class="
              ['clearfix',
                'item',
                item.sender && (user.username === item.sender.username) ?
                'item-right' : 'item-left', item.type < 0 ?
                'sys-msg' : ''
              ]">

            <div class="lay-block clearfix" v-if="item.type >= 0 && item.type !== 6">
              <div class="avatar" @click="handleAvatarClick(item)">
                <icon name="cog" class="font-cog" v-if="item.type == 4" scale="3"></icon>
                <img :src="item.sender && item.sender.avatar ? item.sender.avatar : require('../assets/avatar.png')" v-else>
              </div>
              <div class="lay-content">

                <div class="msg-header">
                  <h4>{{
                    item.type === 4 ?
                    '计划消息' : item.sender && item.sender.username === user.username && user.nickname ?
                    user.nickname : item.sender && (item.sender.nickname || item.sender.username)
                  }}
                  </h4>
                  <span :class="['common-member', {'manager': getRoles(item).includes('manager')}]" v-if="item.type !== 4 && item.sender && item.sender.roles.length !== 1">
                    {{ getRoles(item).includes('manager') ? '管理员' : '客服人员' }}
                  </span>
                  <span class="msg-time">{{item.created_at | moment('HH:mm:ss')}}</span>
                </div>
                <div v-if="item.type === 5">
                  <div v-if="(myRoles && myRoles.includes('visitor'))" class="envelope-message expired">
                    <img class="img m-r" src="../assets/envelope_message.png" alt="envelope"/>
                    <div class="send-texts">
                      <p class="slogan">{{item.content ? item.content : '恭喜发财 大吉大利'}}</p>
                      <p class="action">会员才可以抢红包！</p>
                    </div>
                  </div>
                  <div :class="['envelope-message','pointer',
                    {'null': (item.envelope_status.total === item.envelope_status.users.length) && !item.envelope_status.users.map(item => item.receiver_id).includes(user.id)}]"
                    v-else-if="item.envelope_status && !item.envelope_status.expired"
                    @click="takeEnvelope(item)">
                    <img class="img m-r" src="../assets/envelope_message.png" alt="envelope"/>
                    <div class="send-texts">
                      <p class="slogan">{{item.content ? item.content : '恭喜发财 大吉大利'}}</p>
                      <p class="action">
                        {{
                          item.envelope_status.users.map(item => item.receiver_id).includes(user.id) ?
                          '已领取' : (item.envelope_status.total === item.envelope_status.users.length)  ?
                          '已领完' : '待领取'
                        }}
                      </p>
                    </div>
                  </div>
                  <div class="envelope-message expired"
                    v-else-if="item.envelope_status.expired">
                    <img class="img m-r"
                      src="../assets/envelope_message.png"
                      alt="envelope"/>
                    <div class="send-texts">
                      <p class="slogan">{{item.content ? item.content : '恭喜发财 大吉大利'}}</p>
                      <p>已过期</p>
                    </div>
                  </div>
                </div>
                <div class="text-center sticker-msg" v-else-if="item.type === 7">
                  <img-async class="img"
                    :src="item.content"
                    @imgStart="imgLoadCount++"
                    @imgLoad="imgLoadCount--"/>
                </div>
                <div :class="['bubble', 'bubble' + item.type]" v-else>
                  <p>
                    <span v-if="item.type === 0 || item.type === 4">{{item.content}}</span>
                    <img-async @click.native="showImageMsg = true; showImageMsgUrl = item.content"
                      v-else-if="item.type === 1"
                      :src="item.content"
                      @imgStart="imgLoadCount++"
                      @imgLoad="imgLoadCount--"/>
                  </p>
                </div>
              </div>
            </div>

            <div class="inner" v-else-if="item.type === -1">
              <p>以上是历史消息</p>
            </div>

            <div class="text-center" v-else-if="item.type === 6 && item.sender.id === user.id">
              <p class="get-envelope">{{`${item.get_envelope_user.id === user.id ? '你' : item.get_envelope_user.nickname}抢到了你的红包`}}</p>
            </div>

          </li>
          <li v-if="personal_setting.block" class="block-user-info">您已被管理员拉黑，请联系客服。<li>
          <li ref="msgEnd" id="msgEnd" class="msgEnd"></li>
        </ul>
      </el-main>

      <el-footer class="footer m-t"
        height="100">
        <div class="control-bar">
          <el-popover
            :disabled="myRoles.includes('visitor') || personal_setting.block"
            v-model="showStickerPopover"
            :popper-class="'emoji-popover'"
            ref="popover4"
            placement="top-start"
            :width="stickerTab === 'stickers' ? 460 : 300"
            trigger="click">
            <el-tabs type="border-card" class="stickers-tab" v-model="stickerTab">
              <el-tab-pane label="表情符号" name="emojis">
                <div class="emoji-container">
                  <Emojis :emojis="emojis.people.slice(0, 42)" @emojiClick="handleEmojiClick"/>
                </div>
              </el-tab-pane>
              <el-tab-pane v-if="stickerGroups.length" label="表情包" name="stickers">
                <div class="stickers-container">
                  <Stickers @sendSticker="sendSticker" v-if="stickerTab === 'stickers'"/>
                </div>
              </el-tab-pane>
              </el-tabs>
            </el-popover>

          <a v-popover:popover4
            v-if="emojiSuccess"
            @click="handleEmojiIconClick"
            href="javascript:void(0)"
            title="发送表情"
            :class="['btn-control','btn-smile', 'pointer', {'not-allowed': personal_setting.block}]">
            <icon scale="1.3" name="smile-o"></icon>
          </a>

          <a href="javascript:void(0)" :class="['btn-control', 'btn-smile', 'pointer', {'not-allowed': personal_setting.block}]">
            <label for="imgUploadInput" @click="handleImgIconClick($event)">
              <span title="上传图片">
                <i :class="['el-icon-picture', {'not-allowed': personal_setting.block}]"></i>
                <input :disabled="!personal_setting.chat.status"
                  @change="sendMsgImg"
                  type="file"
                  ref="fileImgSend"
                  class="img-upload-input"
                  id="imgUploadInput"
                  accept=".jpg, .png, .gif, .jpeg, image/jpeg, image/png, image/gif">
              </span>
            </label>
          </a>

          <div v-if="globalPreference.envelope_settings && globalPreference.envelope_settings.enabled === '1' && chat.current.roomId === 1"
            :class="['envelope-icon','pointer', {'not-allowed': personal_setting.block}]" @click="handleEnvelopeIconClick">
            <img class="img" src="../assets/envelope_icon.png" alt="envelope-icon">
          </div>

          <span v-if="personal_setting.user && myRoles.includes('manager')" class="btn-control right" @click="openManageDialog()" >
            <icon name="cog" class="font-cog" scale="1.4"></icon>
          </span>

          <div class="chat-buttons" v-if="ws && (!myRoles.includes('customer service') && !myRoles.includes('manager') && !myRoles.includes('visitor'))">
            <el-button :type="chat.read ? '' : 'warning'"
              class="chat-button"
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

    <!-- for Restraint member in chatHall -->
    <el-dialog
      title="管理"
      :visible.sync="restraint.dialogVisible"
      :width="restraint.content === 'all' ? '700px' : '30%'"
      class="restraint-dialog"
      top="5vh"
      :append-to-body="true"
      :modal-append-to-body="true"
      center>
      <Restraint :restraint="restraint"
        :blockedUsers="blockedUsers"
        v-if="restraint.dialogVisible"
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
        :roomMsgs="roomMsgs"
        :chat="chat"
        v-if="chat.current.roomId && chat.current.roomId !== 1"/>
    </el-dialog>

    <!-- red envelope dialog -->
     <el-dialog
       class="red-envelope-dialog"
       :visible.sync="envelope.visible"
       :width="'400px'"
       top="10vh"
       center>
      <Envelope :status="envelope.status"
        v-if="envelope.visible"
        :content="envelope.content"
        :envelope="envelope.envelope"
        :joinChatRoom="joinChatRoom"
        @closeDialog="closeEnvelope"
        @handleSend="handleEnvelopeSend"/>
    </el-dialog>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/cog'
import 'vue-awesome/icons/smile-o'
import { fetchChatEmoji, sendImgToChat, getChatUser, buildRoom, getChatList, takeEnvelope } from '../api'
import urls from '../api/urls'
import { msgFormatter } from '../utils'
import { mapGetters, mapState } from 'vuex'
import PrivateChat from '../components/PrivateChat'
import Envelope from '../components/Envelope'
import Restraint from './Restraint'
import ImgAsync from './ImgAsync'
import Emojis from './Emojis'
import Stickers from './Stickers'

export default {
  components: {
    Icon,
    Restraint,
    PrivateChat,
    Envelope,
    ImgAsync,
    Emojis,
    Stickers
  },
  data () {
    return {
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
        chat: {}
      },
      blockedUsers: [],
      bannedUsers: [],
      restraint: {
        dialogVisible: false,
        user: '',
        content: '',
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
      currentChat: null,
      envelope: {
        content: '',
        status: '',
        visible: false,
        envelope: {}
      },
      showStickerPopover: false,
      stickerTab: 'emojis',
      imgLoadCount: 0,
      needScrollToBottom: false
    }
  },
  watch: {
    'imgLoadCount': function (count) {
      if (count === 0) {
        if (this.needScrollToBottom) {
          this.$nextTick(() => {
            this.$refs.msgEnd && this.$refs.msgEnd.scrollIntoView()
          })
        }
      }
    },
    'chat.current.roomId' (val) {
      this.RECEIVER = val

      this.roomMessages[val] = this.roomMessages[val] ? this.roomMessages[val] : []
      this.$store.dispatch('getChatMessages', this.roomMessages[val])

      this.$nextTick(() => {
        this.$refs.msgEnd && this.$refs.msgEnd.scrollIntoView()
      })
    },
    'roomMessages': {
      handler: function () {
        this.$store.dispatch('setRoomMsgs', this.roomMessages)

        let rooms = {}
        let roomIds = Object.keys(this.roomMessages)

        roomIds.forEach((roomId) => {
          let otherSent = this.roomMessages[roomId].filter((msg) => {
            if (roomId !== '1' && msg.type !== -1) {
              return true
            }
          })

          if (!otherSent.length) { return }
          let other = otherSent[0].chat_with.username === this.user.username ? otherSent[0].sender : otherSent[0].chat_with
          let roomData = {
            roomId: roomId,
            id: other.id,
            username: other.username
          }
          rooms[roomData.roomId] = roomData
        })

        this.$store.dispatch('setRooms', rooms)
        this.$forceUpdate()
      },
      deep: true
    },
    'user.logined': {
      handler: function (val, oldVal) {
        if (val !== oldVal && val) {
          clearInterval(this.liveInterval)
          this.joinChatRoom()
        }
      },
      deep: true
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
      'globalPreference',
      'user',
      'chat',
      'chatList',
      'roomMsgs',
      'envelopes',
      'stickerGroups',
      'ws'
    ]),
    isLogin () {
      return this.$store.state.user.logined && this.$route.name !== 'Home'
    },
    formattedBannerUsers () {
      let result = []
      if (this.bannedUsers.length) {
        this.bannedUsers.forEach((item) => {
          let validBanned = this.$moment(item.banned_time).diff(this.$moment()) > 0
          if (validBanned) {
            result.push({
              username: item.username,
              banned_time: this.$moment(item.banned_time).fromNow(true)
            })
          }
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
    localStorage.setItem('stickers', '{}')
  },
  mounted () {
    this.joinChatRoom()
  },
  methods: {
    handleImgIconClick (e) {
      if (this.personal_setting.block) {
        return
      }
      if ((this.myRoles.length && this.myRoles.includes('visitor'))) {
        e.preventDefault()
        this.$store.dispatch('updateUnloginedDialog', {visible: true, status: 'Login'})
      }
    },
    handleEmojiIconClick () {
      if (this.myRoles.includes('visitor')) {
        this.$store.dispatch('updateUnloginedDialog', {visible: true, status: 'Login'})
      }
    },
    handleEmojiClick (emoji) {
      this.msgContent = this.msgContent + emoji.emoji + ' '
    },
    closeEnvelope () {
      this.envelope.visible = false
    },
    takeEnvelope (envelope) {
      if (this.personal_setting.block || this.myRoles.includes('visitor')) {
        return
      }

      this.envelope.content = envelope.content
      this.envelope.status = 'taking'

      let payload = {
        envelope_id: envelope.envelope_status.id,
        receiver_id: this.user.id
      }

      this.envelope.visible = true

      takeEnvelope(payload).then(res => {
        res.envelope_id = payload.envelope_id
        this.envelope.envelope = res

        if (res.amount) {
          this.$store.dispatch('fetchUser').then(() => { this.envelope.status = 'success' })
        } else {
          switch (res.status) {
            case 'expired' :
              this.envelope.status = 'expired'

              let index = this.roomMessages['1'].findIndex((msg) => msg.type === 5 && msg.envelope_status && msg.envelope_status.id === payload.envelope_id)
              this.roomMessages['1'][index].envelope_status.expired = true
              return
            case 'repeat' :
              this.envelope.status = 'repeat'
              return
            case 'fail' :
              this.envelope.status = 'fail'
          }
        }
      })
    },
    handleEnvelopeSend (envelope) {
      this.envelope.visible = false
      this.envelope.status = ''
      this.$store.dispatch('fetchUser')

      this.$nextTick(() => {
        this.$refs.msgEnd && this.$refs.msgEnd.scrollIntoView()
      })
    },
    handleEnvelopeIconClick () {
      if (this.personal_setting.block) {
        return
      }
      if (this.myRoles.includes('visitor')) {
        this.$store.dispatch('updateUnloginedDialog', {visible: true, status: 'Login'})
      } else {
        this.envelope.status = 'sending'
        this.envelope.visible = true
        this.envelope.envelope = {}
      }
    },
    showingName (user) {
      return user.usernickname ? user.usernickname : user.username
    },
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
        this.$store.dispatch('startChat', {id: newRoom.id, chatWith: chat.id, otherUser: chat.username})
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
      if (this.currentChat) {
        let room = this.currentChat.roomId
        let currentMsg = this.chat.current.messages ? this.chat.current.messages : []

        if (currentMsg.length) {
          let msgs = currentMsg.filter(msg => msg.type !== -1)
          let lastMessage = msgs[msgs.length - 1]
          let lastMsgData = {
            msgId: lastMessage.id,
            other: this.currentChat.chat.id
          }
          this.read(this.ws, room, lastMsgData)
          this.currentChat = null
        }
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
          user_id: this.user.id
        }))
      }, 30000)
    },
    getRoles (message) {
      return message.sender.roles.map((role) => role.name)
    },
    joinChatRoom () {
      const callback = () => {
        this.checkLiving(this.ws)
        window.addEventListener('beforeunload', e => this.beforeunloadHandler(e))
        if (!this.emojis.people.length) {
          fetchChatEmoji().then((resData) => {
            this.emojis = resData
          }).catch(() => {
            this.emojiSuccess = false
          })
        }

        this.handleMsg()
      }

      this.loading = true
      let currentToken = this.$cookie.get('access_token')

      if (this.ws) { // avoid rejoin room
        let socketValidate = this.ws.url.indexOf(currentToken) !== -1
        if (socketValidate) {
          callback()
        } else {
          this.leaveRoom()
          this.$store.dispatch('connectSocket', callback)
        }
      } else {
        this.$store.dispatch('connectSocket', callback)
      }
    },
    handleMsg () {
      this.loading = false
      if (!this.ws) { return false }

      this.ws.onmessage = (resData) => {
        let correctResponse = typeof (resData.data) === 'string'
        if (correctResponse) {
          try {
            let data = JSON.parse(resData.data)

            if (!data.error_type) {
              let latestMsgs = data.latest_message

              if (latestMsgs) {
                if (data.count) {
                  let lastMsg = latestMsgs[0]
                  this.needScrollToBottom = true
                  latestMsgs.forEach((msg) => {
                    if (msg.type === 7) {
                      msg.content = this.host + msg.content
                    }
                    if (!msg.sender.avatar) {
                      return
                    }
                    msg.sender.avatar = this.host + msg.sender.avatar
                  })

                  this.$set(this.roomMessages, lastMsg.receivers, latestMsgs.reverse().concat([{ type: -1 }]))

                  let envelopes = latestMsgs.filter((msg) => msg.type === 5 && msg.envelope_status && !msg.envelope_status.expired)
                  envelopes.forEach((envelope) => {
                    this.$store.dispatch('collectEnvelope', envelope)
                  })
                }

                this.$nextTick(() => {
                  this.$refs.msgEnd && this.$refs.msgEnd.scrollIntoView()
                })

                return
              } else if (data.personal_setting) {
                if (data.personal_setting.user.avatar && data.personal_setting.user.avatar.indexOf('http') === -1) {
                  data.personal_setting.user.avatar = this.host + data.personal_setting.user.avatar
                }
                this.personal_setting = data.personal_setting
                this.$store.dispatch('setUser', data.personal_setting)
              } else {
                switch (data.type) {
                  case 2:

                    if (data.command === 'banned') {
                      this.personal_setting.chat.status = 0
                      this.openMessageBox(data.content, 'error')
                    } else if (data.command === 'unblock') {
                      this.personal_setting.block = false
                      this.personal_setting.chat.status = 1
                      this.$emit('chatStatusChanged', data.command)
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
                  case 5:
                    if (data.sender && data.sender.avatar !== null) {
                      data.sender.avatar = this.host + '/' + data.sender.avatar.replace('websocket/', '')
                      if (data.sender.avatar.indexOf('//upload') !== -1) {
                        data.sender.avatar = data.sender.avatar.replace('//upload', '/upload')
                      }
                    }
                    this.roomMessages[data.receivers].push(data)
                    this.$store.dispatch('collectEnvelope', data)
                    this.$nextTick(() => {
                      this.$refs.msgEnd && this.$refs.msgEnd.scrollIntoView()
                    })
                    return
                  case 6:
                    if (data.sender && data.sender.avatar !== null) {
                      data.sender.avatar = this.host + '/' + data.sender.avatar.replace('websocket/', '')
                      if (data.sender.avatar.indexOf('//upload') !== -1) {
                        data.sender.avatar = data.sender.avatar.replace('//upload', '/upload')
                      }
                    }

                    this.roomMessages[data.receivers].push(data)
                    this.$store.dispatch('collectEnvelope', data)
                    let currentEnvelopeIndex = this.roomMessages[data.receivers].findIndex((msg) => msg.envelope_status && msg.envelope_status.id === data.envelope_status.id)

                    this.roomMessages[data.receivers][currentEnvelopeIndex].envelope_status = data.envelope_status

                    if (data.sender.id === this.user.id) {
                      this.$nextTick(() => {
                        this.$refs.msgEnd && this.$refs.msgEnd.scrollIntoView()
                      })
                    }
                    return

                  default:
                    if (data.command === 'live') {
                      return
                    }
                    if (data.sender && data.sender.avatar !== null) {
                      data.sender.avatar = this.host + '/' + data.sender.avatar.replace('websocket/', '')
                      if (data.sender.avatar.indexOf('//upload') !== -1) {
                        data.sender.avatar = data.sender.avatar.replace('//upload', '/upload')
                      }
                    }

                    if (data.type === 7 && data.content && data.content !== null) {
                      data.content = this.host + '/' + data.content.replace('websocket/', '')
                      if (data.content.indexOf('//upload') !== -1) {
                        data.content = data.content.replace('//upload', '/upload')
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

                    let chatBox = document.getElementById('chatBox')
                    let clientHeight = chatBox.clientHeight
                    let scrollHeight = chatBox.scrollHeight

                    this.$forceUpdate()
                    let scrollTop = chatBox.scrollTop
                    this.needScrollToBottom = true

                    this.$nextTick(() => {
                      if (scrollTop + clientHeight > (scrollHeight - 200) || (data.sender && data.sender.username === this.user.username)) {
                        this.$refs.msgEnd && this.$refs.msgEnd.scrollIntoView()
                      } else {
                        this.needScrollToBottom = false
                      }
                    })
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
                    this.$emit('chatStatusChanged', 'block')
                    this.openMessageBox(data.msg, 'error')
                    break
                  case 6: // 同時登入
                    this.openMessageBox(data.msg, 'error')
                    setTimeout(() => {
                      this.leaveRoom()
                      this.$store.dispatch('trial').then(() => {
                        this.$store.dispatch('updateUnloginedDialog', {visible: true, status: 'Login'})
                      })
                    }, 3000)
                    break
                  case 7:  // 凍結
                    this.openMessageBox(data.msg, 'error')
                    setTimeout(() => {
                      this.$store.dispatch('resetUser')
                      this.$store.dispatch('updateUnloginedDialog', {visible: true, status: 'Login'})
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
    sendSticker () {
      this.showStickerPopover = false
    },
    sendMsgImg (e) {
      if (this.myRoles.includes('visitor')) {
        this.$store.dispatch('updateUnloginedDialog', {visible: true, status: 'Login'})
        return
      }
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
      if (this.myRoles.includes('visitor')) {
        this.$store.dispatch('updateUnloginedDialog', {visible: true, status: 'Login'})
        return
      }
      if (!this.msgContent.trim()) { return false }

      if (!this.ws) {
        this.joinChatRoom()
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
      this.$store.dispatch('leaveSocket', this.chat.current.roomId)
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
      let role = message.sender.roles.map((role) => role.name)
      if (this.myRoles.includes('manager')) {
        if ((this.personal_setting.user.username === message.sender.username) || role.includes('manager')) {
          return
        }
        this.restraint.user = message.sender
        this.restraint.content = 'single'
        this.restraint.dialogVisible = true
      }

      if (this.chat.current.roomId === 1 &&
        this.myRoles.includes('customer service') &&
        role.length === 1 &&
        role[0] === 'member') {
        this.$emit('handleAvatarClick', message.sender)
      }
    },
    openManageDialog () {
      this.restraint.nowTab = '0'
      this.restraint.content = 'all'
      this.restraint.dialogVisible = true

      this.getUser()
    },
    openMessageBox (msg, type) {
      this.$message({
        showClose: true,
        message: msg,
        type: type
      })
    },
    beforeunloadHandler (e) {
      this.ws.send(JSON.stringify({
        command: 'live',
        user_id: this.user.id,
        status: 'disconnect'
      }))
    }
  },
  destroyed () {
    window.removeEventListener('beforeunload', e => this.beforeunloadHandler(e))
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
  height: 100%;
  overflow-x: hidden;
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
      margin: 8px 10px;
      cursor: pointer;
    }
  }
}

.content {
  height: 100%;
  background-color: rgba(255, 255, 255, .2);
  background-attachment: fixed;
  background-size: cover;
  padding: 10px;
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
  &:empty {
    margin: 0px;
  }
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
          text-align: right;
          h4 {
            max-width: 150px;
            vertical-align: middle;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: right;
            color: #fff;
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
  height: 22px;
  line-height: 22px;
  background: #1976d2;
  color: #fff;
  padding: 0 10px;
  border-radius: 10px;
  &.manager {
    background: #d6a254;
  }
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
    vertical-align: middle;
    text-overflow: ellipsis;
    line-height: 12px;
    cursor: pointer;
  }

  .msg-time {
    display: inline-block;
    color: #ccc;
    vertical-align: middle;
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
    .envelope-icon {
      display: inline-block;
      padding: 3px 10px;
      &:hover {
        background: #666;
      }
      .img {
        width: 20px;
      }
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
    &.right {
      float: right;
    }
    .el-icon-picture {
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
  width: 70px;
  height: 70px;
  font-size: 14px;
  line-height: 70px;
  border-radius: 2px;
  margin: 5px;
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
  height: 300px;
  max-height: 300px;
  overflow-y: auto;
}

.stickers-container {
  height: 300px;
  max-height: 300px;
  overflow-y: auto;
}


.popup-uploadedimage {
  width: 100%;
  height: 100%;
}

.chat-buttons {
  float: right;
  padding-top: 2px;
  margin-right: 5px;
  .chat-button {
    border-radius: 2px;
    width: 70px;
  }
  .is-plain {
    border: none;
  }
}

.privatechat-dialog /deep/ .el-dialog--center .el-dialog__header {
  padding-top: 0;
}

.red-envelope-dialog /deep/ .el-dialog__header , .red-envelope-dialog /deep/ .el-dialog__body {
  padding: 0;
}


.sticker-msg {
  width: 150px;
  height: auto;
  .img {
    width: 100%;
    height: 100%;
  }
}

.envelope-message {
  display: flex;
  width: 190px;
  padding: 10px;
  border-radius: 5px;
  justify-content: stretch;
  background-color: #fa9d3b;
  position: relative;
  &.expired {
    background: #f5c38e;
  }
  &.null {
    background: #f5c38e;
  }
  .img {
    width: 30px;
    height: 35px;
  }
  .send-texts {
    color: #fff;
    .slogan {
      font-size: 14px;
      width: 150px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  &:after {
    content: '';
    position: absolute;
    top: 14px;
    width: 0;
    height: 0;
    border: 9px solid transparent;
    border-top: 0;
    margin-top: -7px;
    border-right-color: #fa9d3b;
  }
}
.item-left .envelope-message{
  &:after {
    left: 0;
    border-left: 0;
    margin-left: -8px;
  }
  &.null:after, &.expired:after {
    border-right-color: #f5c38e;
  }
}
.item-right .envelope-message{
  float: right;
  &:after {
    right: 0;
    border-right: 0;
    margin-right: -9px;
    border-left-color: #fa9d3b;
  }
  &.null:after, &.expired:after {
    border-left-color: #f5c38e;
  }
}
.get-envelope {
  display: inline-block;
  color: #dedede;
  background: rgba(255, 255, 255, 0.1);
  padding: 5px 20px;
  border-radius: 4px;
}

</style>

<style lang="scss">
.emoji-popover {
  &.el-popover {
    padding: 0;
  }
  .el-tabs--border-card {
    border: 0;
  }
}

.stickers-tab .el-tabs__content {
  padding: 0;
}
</style>
