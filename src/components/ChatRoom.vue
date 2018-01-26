<template>
  <div class="container">
    <el-container 
      class="chat-box" 
      v-loading="loading" 
      element-loading-text="正在登陆聊天室"
      v-if="isLogin && showChatRoom">
      <el-header class="title clearfix" height="40px">
        <div class="l fl clearfix">
          <icon class="font-home fl" name="home" scale="2"></icon>
          <h3 class="fl" style="margin-left: 14px">聊天室</h3>
        </div>
        <div class="r fr">
          <icon title="修改昵称" name="user-plus" scale="1.6" style="padding-top: 4px; cursor: pointer;" @click.native="showEditProfile = true"></icon>
          <i class="el-icon-close close" title="关闭聊天室" @click="showChatRoom = false"></i>
        </div>
        <transition
          enter-class="profileFadeInEnter"
          leave-active-class="animated fadeOutUp"
          enter-active-class="animated fadeInDown">
          <div class="edit-profile" v-if="showEditProfile">
            <div class="avatar" v-on:mouseover="swichAvatar = true" v-on:mouseout="swichAvatar = false">
              <img src="../assets/avatar.png" v-if="!swichAvatar">
              <label for="avatarUploadInput" class="upload-avatar" v-else>
                <span class="el-icon-upload"></span>
                <input type="file" id="avatarUploadInput" accept=".jpg, .png, .gif, .jpeg, image/jpeg, image/png, image/gif" style="width: 0.1px; height: 0.1px; opacity: 0; position: absolute; top: -20px;">
              </label>
            </div>
            <p style="{font-size: 12px; color: rgb(255, 127, 77);}">(您还未设置头像, 请点击头像上传)</p>
            <p>
              <span class="txt-nick">yayaya002</span>
              <a href="#" style="{font-size: 20px}">
                <span class="el-icon-edit-outline"></span>
              </a>
            </p>
            <div>
              <p>
                <a href="javascript:void(0)" class="u-btn1" @click="showEditProfile = false">关闭</a>
              </p>
            </div>
          </div>
        </transition>
      </el-header>
      <el-main class="content">
        <div class="chat-announce">
          <div class="ttl clearfix">
            <icon class="fl volume-up" name="volume-up"></icon>
            <span class="fl">公告:</span>
          </div>
          <div class="scroll">
            <MarqueeTips content="我是一个短短的提示" :speed="Number(10)"></MarqueeTips>
          </div>
        </div>
        <div class="controls">
          <a class="listCtrl clearfix" href="javascript:void(0)">
            <icon class="fl"  name="unsorted"></icon>
            <span class="fl">滚屏</span>
          </a>
          <a class="listCtrl clearfix" href="javascript:void(0)">
            <icon class="fl"  name="trash"></icon>
            <span class="fl">清屏</span>
          </a>
        </div>
        <ul class="lay-scroll">
          <li v-for="(item, index) in messages" class="clearfix item item-left">
            <div class="lay-block">
              <div class="avatar fl">
                <img src="../assets/avatar.png">
              </div>
              <div class="lay-content fl">
                <div class="msg-header">
                  <h4 v-html="item.name"></h4>
                  <span>
                    <img src="../assets/icon_member01.gif" alt="普通会员">
                  </span>
                  <span class="msg-time">16:32:22</span>
                </div>
                <div class="bubble">
                  <p>
                    <span v-html="item.cnt"></span>
                  </p>
                </div>
              </div>
            </div>
          </li>
        </ul>
        <span ref="msgEnd"></span>
      </el-main>
      <el-footer class="footer">
        <div class="control-bar">
          <a href="javascript:void(0)" title="发送表情" class="btn-control">
            <icon  name="smile-o"></icon>
          </a>
          <label for="imgUploadInput">
            <span title="上传图片" class="btn-control">
              <i class="el-icon-picture"></i>
              <input type="file" id="imgUploadInput" accept=".jpg, .png, .gif, .jpeg, image/jpeg, image/png, image/gif" style="width: 0.1px; height: 0.1px; opacity: 0; position: absolute; top: -20px;">
            </span>
          </label>
        </div>
        <div class="typing">
          <div class="txtinput el-textarea is-disabled">
            <textarea placeholder="发言条件：前两天充值不少于0元；打码量不少于10元" disabled="disabled" type="textarea" rows="2" autocomplete="off" validateevent="true" class="el-textarea_inner" style="height: 54px"></textarea>
          </div>
          <div class="sendbtn fr">
            <a href="javascript:void(0)" class="u-btn1">发送</a>
          </div>
        </div>
      </el-footer>
    </el-container>
    <div class="chat-guide" @click="joinChatRoom"></div>
  </div>
 
</template>

<script>

import MarqueeTips from 'vue-marquee-tips'
// import { chatRoomLogin } from '../api'

export default {
  data () {
    return {
      showChatRoom: false,
      messages: [{
        name: '不是输就是赢了',
        userImage: '',
        cnt: '@残狼 去吧~~狼是晚上活动的动物'
      }, {
        name: '不是输就是赢了',
        userImage: '',
        cnt: '@残狼 去吧~~狼是晚上活动的动物'
      }, {
        name: '不是输就是赢了',
        userImage: '',
        cnt: '@残狼 去吧~~狼是晚上活动的动物'
      }, {
        name: '不是输就是赢了',
        userImage: '',
        cnt: '@残狼 去吧~~狼是晚上活动的动物'
      }, {
        name: '不是输就是赢了',
        userImage: '',
        cnt: '@残狼 去吧~~狼是晚上活动的动物'
      }, {
        name: '不是输就是赢了',
        userImage: '',
        cnt: '@残狼 去吧~~狼是晚上活动的动物'
      }, {
        name: '不是输就是赢了',
        userImage: '',
        cnt: '@残狼 去吧~~狼是晚上活动的动物'
      }, {
        name: '不是输就是赢了',
        userImage: '',
        cnt: '@残狼 去吧~~狼是晚上活动的动物'
      }, {
        name: '不是输就是赢了',
        userImage: '',
        cnt: '@残狼 去吧~~狼是晚上活动的动物'
      }, {
        name: '不是输就是赢了',
        userImage: '',
        cnt: '@残狼 去吧~~狼是晚上活动的动物'
      }, {
        name: '不是输就是赢了',
        userImage: '',
        cnt: '@残狼 去吧~~狼是晚上活动的动物'
      }, {
        name: '不是输就是赢了',
        userImage: '',
        cnt: '@残狼 去吧~~狼是晚上活动的动物'
      }],
      loading: false,
      showEditProfile: false,
      swichAvatar: false
    }
  },
  components: {
    MarqueeTips
  },
  computed: {
    isLogin () {
      return this.$store.state.user.logined
    },
    user () {
      return this.$store.state.user
    }
  },
  created () {
  },
  sockets: {
    connect: function () {
      console.log('socket connected')
    },
    customEmit: function (val) {
      console.log('this method was fired by the socket server. eg: io.emit("customEmit", data)')
    }
  },
  methods: {
    async joinChatRoom () {
      this.showChatRoom = true
      // chatRoomLogin(this.user.username).then(result => {
      //   console.log('result')
      //   console.log(result)
      // })
    }
  }
}
</script>

<style lang="scss" scoped>
  .chat-box {
    position: fixed;
    right: 0;
    top: 0;
    width: 380px;
    overflow-x: hidden;
    height: 100%;
    background: url('../assets/chatbg.jpg') no-repeat right bottom;
    background-attachment: fixed;
    border-left: 3px solid #006bb3;
    border-bottom: 1px solid #006bb3;
    z-index: 1;
    .title {
      line-height: 40px;
      position: relative;
      background-color: #006bb3;
      color: #fff;
      padding: 0 10px;
      .font-home {
        padding-top: 4px;
      }
      h3 {
        font-size: 16px;
        color: #fff;
      }
      .close {
        color: #fff;
        font-size: 20px;
        cursor: pointer;
      }
      .r {
        padding-top: 4px;
        font-size: 14px;
      }
    }
    .content {
      padding: 4px;


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
          padding: 6px 8px 5px 15px;
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
        .listCtrl {
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
        .item {
          margin-top: 15px;
          padding: 5px 10px;
          .lay-block {
            .avatar {
              width: 48px;
              height: 48px;
              cursor: pointer;
              img {
                display: block;
                width: 100%;
                height: 100%;
                border-radius: 7px;
              }
            }
            .lay-content {
              margin-left: 18px;
              .msg-header {
                overflow: hidden;
                h4 {
                  display: inline-block;
                  font-size: 12px;
                  color: #4f77ab;
                  display: inline-block;
                  font-weight: 400;
                  cursor: pointer;
                }
                span {
                  display: inline-block;
                  margin: 0 2px;
                  img {
                    vertical-align: middle;
                  }
                  &.msg-time {
                    background: rgba(70,70,70,.12);
                    color: #a0a0a0;
                    padding: 0 6px;
                    border-radius: 10px;
                    font-weight: 400;
                    font-size: 10px;
                  }
                }
              }
              .bubble {
                background: linear-gradient(to right, rgb(25, 158, 216), rgb(25, 158, 216)); 
                border-left-color: rgb(25, 158, 216); 
                border-right-color: rgb(25, 158, 216); 
                color: rgb(255, 255, 255);
                margin-top: 3px;
                position: relative;
                border-radius: 5px;
                padding: 6px 9px;
                font-size: 13px;
                line-height: 1.2;
                display: inline-block;
                text-shadow: 0 0 1px #35406d;
                p {
                  span {
                    white-space: pre-wrap; 
                    word-break: break-all;
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
                left: 0;
                margin-left: -9px;
                border-left: 0;
                border-right-color: rgb(25, 158, 216);
              }
            }
          }
        }
      }
    }
    .footer {
      padding: 0;
      .control-bar {
        height: 32px;
        background: #f0f0f0;
        border: 1px solid #adadad;
        border-left: 0;
        border-right: 0;
        position: relative;
        z-index: 100;
        overflow: hidden;
      }
      .typing {
        position: relative;
        padding: 5px;
        .txtinput {
          display: block;
          width: auto;
          margin-right: 58px;
        }
        .el-textarea {
          vertical-align: bottom;
        }
        .is-disabled {
          .el-textarea_inner {
            background-color: #eef1f6;
            border-color: #d1dbe5;
            color: #bbb;
            cursor: not-allowed;
          }
        }
        .el-textarea_inner {
          display: block;
          resize: vertical;
          padding: 5px 7px;
          line-height: 1.5;
          width: 100%;
          font-size: 14px;
          color: #1f2d3d;
          background-color: #fff;
          border: 1px solid #bfcbd9;
          border-radius: 4px;
          transition: border-color .2s cubic-bezier(.645,.045,.355,1);
          box-sizing: border-box;
          background-image: none;
        }
      }

      .btn-control {
        display: inline-block;
        padding: 0 12px;
        line-height: 32px;
        background: #e5e5e5;
        color: #717171;
        margin-right: 1px;
        cursor: pointer;
        padding-top: 4px;
        .el-icon-picture {
          font-size: 18px;
        }
      }
      .sendbtn {
        position: absolute;
        right: 5px;
        bottom: 5px;
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
      z-index: 999;
      color: #4f77ab;
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
          height: 100%;
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
      .u-btn1 {
        width: 56px;
        height: 20px;
        font-size: 12px;
        line-height: 20px;
      }
      .el-icon-edit-outline {
        font-size: 20px;
      }
    }

    .u-btn1 {
      display: inline-block;
      text-align: center;
      vertical-align: bottom;
      border-radius: 3px;
      margin-left: 3px;
      width: 51px;
      height: 51px;
      font-size: 14px;
      line-height: 51px;
      background: #5b8ac7;
      background: -moz-linear-gradient(top,#5b8ac7 0,#2765b5 100%);
      background: -webkit-linear-gradient(top,#5b8ac7 0,#2765b5 100%);
      background: linear-gradient(to bottom,#5b8ac7 0,#2765b5 100%);
      border: 1px solid #1e57a0;
      color: #fff;
      cursor: pointer;
    }
  }
  .chat-guide {
    position: fixed;
    right: 10px;
    top: 50%;
    width: 40px;
    height: 152px;
    margin-top: -76px;
    background: url('../assets/chat_float_blue.png') no-repeat;
    background-size: 100%;
    cursor: pointer;
    z-index: 0;
  }
</style>
