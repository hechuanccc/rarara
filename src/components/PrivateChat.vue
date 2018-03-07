<template>
  <div class="privatechat-container">
    <h2 class="title text-center m-b">联系客服</h2>
    <div>
      <ul class="chat-records m-b"
        v-if="showing && showing.length">
        <li class="record m-t m-b"
          v-if="msg.type !== -1"
          v-for="(msg, index) in showing"
          :key="index">
          <div :class="['speaker', {'self': msg.sender.username === user.username}]">
            <div class="avatar">
              <img :src="msg.sender.avatar || require('../assets/avatar.png')" :alt="msg.sender.username">
            </div>
            <div class="information">
              <span class="user">{{msg.sender.nickname || msg.sender.username}}</span>
              <span :class="['character', {service: getRoles(msg).includes('customer service')}]">
                {{getCharacter(msg)}}
              </span>
              <span class="time">{{msg.created_at | moment('HH:mm:ss')}}</span>
              <div class="content-box">
                <div v-if="msg.type === 0" class="content p-l p-r m-t-sm">{{msg.content}}</div>
                <img class="content" v-else-if="msg.type === 1" :src="msg.content" :alt="msg.content">
              </div>
            </div>
          </div>
        </li>
        <li class="text-center" v-else>
          <span class="separator">以上是历史消息</span>
        </li>
      <div ref="msgEnd"></div>
      </ul>
      <div class="text-center chat-records" v-else>
        <div class="p-t">暂无聊天记录</div>
      </div>
    </div>
    <div class="speaking">
      <div class="control-bar">
        <div class="left">
          <el-popover
            ref="emoji-popover"
            placement="top-start"
            width="260"
            trigger="click">
            <div class="emoji-container">
              <span v-for="(item, index) in emojis.people.slice(0, 42)"
                :key="index"
                class="emoji pointer"
                @click="speakingContent = speakingContent + item.emoji + ' '">
                {{item.emoji}}
              </span>
            </div>
          </el-popover>
          <span class="emoji pointer" v-popover:emoji-popover>
            <icon scale="1.3" name="smile-o"></icon>
          </span>
          <label class="upload pointer" for="privateImgUpload">
            <i class="el-icon-picture"></i>
            <input :disabled="notAllowed"
              @change="sendMsgImg"
              type="file"
              ref="privateImgSend"
              class="img-upload-input"
              id="privateImgUpload"
              accept=".jpg, .png, .gif, .jpeg, image/jpeg, image/png, image/gif">
          </label>
        </div>
      </div>
      <div class="typing">
        <div class="input">
          <textarea :placeholder="notAllowed ? '您没有发言的权限' :'请文明发言'"
            @keyup.enter="sendMsg"
            v-model="speakingContent"
            type="textarea"
            autocomplete="off"
            :disabled="notAllowed"
            class="textarea">
            </textarea>
        </div>
        <div :class="['send-button', 'pointer' ,'text-center', {'not-allowed': notAllowed}]" @click="sendMsg">
          <span class="text">发送</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { sendImgToChat } from '../api'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/smile-o'
import {mapState} from 'vuex'

export default {
  components: {
    Icon
  },
  data () {
    return {
      speakingContent: ''
    }
  },
  props: {
    joinChatRoom: {
      type: Function
    },
    emojis: {
      type: Object
    },
    personalSetting: {
      type: Object
    }
  },
  computed: {
    ...mapState([
      'chat',
      'ws',
      'user',
      'roomMsgs',
      'chatList'
    ]),
    notAllowed () {
      return !this.personalSetting.chat.status
    },
    currentChatIndex () {
      let nowIndex = this.chatList.findIndex(chat => chat.id === this.chat.current.chatWith)
      return nowIndex + 1
    },
    showing () {
      return this.roomMsgs[this.chat.current.roomId]
    }
  },
  watch: {
    'showing': function () {
      this.$nextTick(() => {
        this.$refs.msgEnd && this.$refs.msgEnd.scrollIntoView()
      })
    }
  },
  methods: {
    sendMsg () {
      if (this.notAllowed) { return }
      if (!this.speakingContent.trim()) { return false }
      if (!this.ws) {
        this.joinChatRoom()
      }

      this.ws.send(JSON.stringify({
        'command': 'send',
        'receivers': [this.chat.current.roomId],
        'type': 0,
        'content': this.speakingContent
      }))

      this.speakingContent = ''
    },
    sendMsgImg (e) {
      let fileInp = this.$refs.privateImgSend
      let file = fileInp.files[0]
      if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(fileInp.value) || this.notAllowed) {
        this.openMessageBox('文件格式不正确或您目前尚不符合发言条件', 'error')
        return false
      }
      if (file.size > 1024 * 1024) {
        this.openMessageBox('图片尺寸太大，请选择较小尺寸的图片。', 'error')
        return
      }
      let formData = new FormData()
      formData.append('receiver', this.chat.current.roomId)
      formData.append('image', file)

      sendImgToChat(formData).then((data) => {
        fileInp.value = ''
      })
    },
    getRoles (message) {
      return message.sender.roles.map((role) => role.name)
    },
    getCharacter (msg) {
      let char = ''
      if (msg.sender && msg.sender.roles.length) {
        char = this.getRoles(msg).includes('customer service') ? '客服人员' : '普通会员'
      }

      return char
    },
    openMessageBox (content, type) {
      this.$message({
        showClose: true,
        message: content,
        type: type
      })
    }
  },
  mounted () {
    this.$refs.msgEnd && this.$refs.msgEnd.scrollIntoView()
  }
}
</script>

<style lang="scss" scoped>
.title {
  font-size: 18px;
  color: #4a4a4a;
}

.chat-records {
  width: 100%;
  max-height: 45vh;
  min-height: 450px;
  background-color: #f6f6f6;
  overflow: auto;
}

.separator {
  display: inline-block;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 5px 10px;
  color: #666;
}

.speaker {
  width: 100%;

  .avatar, .information {
    display: inline-block;
  }

  .avatar {
    width: 42px;
    height: 42px;
    img {
      width: 100%;
      height: 100%;
    }
  }

  .information {
    font-size: 12px;
    word-break: break-all;
    .character {
      display: inline-block;
      padding: 0 6px;
      margin-right: 5px;
      margin-left: 5px;
      background: #cb9b64;
      color: #fff;
      font-weight: 400;
      border-radius: 10px;
      &.service {
        background: #4a90e2;
      }
    }
    .content-box {
      text-align: left;
    }
    .content {
      display: inline-block;
      max-width: 300px;
      width: auto;
      color: #fff;
      border-radius: 4px;
      background: linear-gradient(to right, #1976D2, #199ed8);
    }
  }

  &.self {
    text-align: right;
    .content-box {
      text-align: right
    }
    .avatar, .user, .character {
      float: right;
    }
  }
}


.speaking {
  box-sizing: border-box;
  height: 90px;
  border: 1px solid #dfdfdf;
  .control-bar {
    display: flex;
    box-sizing: border-box;
    width: 100%;
    height: 30px;
    line-height: 30px;
    justify-content: space-between;
    border-bottom: 1px solid #dfdfdf;
    .img-upload-input {
      display: none;
    }
    .emoji {
      vertical-align: sub;
      padding: 5px 12px;
    }
    .upload {
      font-size: 20px;
      padding: 5px 12px;
    }
  }

  .typing {
    display: inline-flex;
    width: 100%;
    .input {
      flex-grow: 1;
    }
  }

  .send-button {
    width: 60px;
    height: 60px - 1px;
    background-color: #4a90e2;
    .text {
      font-size: 12px;
      line-height: 60px;
      color: #ffffff;
    }
    &.not-allowed {
      cursor: not-allowed;
    }
  }
}
.emoji-container {
  overflow-y: auto;
  .emoji {
    padding: 2px 6px 0 4px;
    display: inline-block;
    position: relative;
    font-size: 18px;
    text-align: center;
    border: 2px solid transparent;
  }
  .emoji:hover {
    border-color: #ff5a00;
  }
}

.input {
  .textarea {
    width: 100%;
    height: 100%;
    max-width: 100%;
    min-width: 100%;
    min-height: 100%;
    max-height: 100%;
    box-sizing: border-box;
    outline: none;
    border: none;
    background-color: transparent;
  }
}
</style>


