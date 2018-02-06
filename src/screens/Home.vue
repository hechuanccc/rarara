<template>
  <el-container class="chat-box" :style="{backgroundImage: `url(${globalPreference.web_background})`}">
    <el-header class="header" height="50px">
      <el-row>
        <el-col :span="4" class="logo clearfix" :style="{backgroundImage: `url(${globalPreference.logo})`}">
        </el-col>
        <el-col :span="14">
          <div class="annouce-box clearfix" @click="announcementDialogVisible = true">
            <div class="title clearfix fl">
              <span>公告</span>
              <icon class="volume-up" name="volume-up" scale="1"></icon>
            </div>
            <div class="content">
              <p class="text"
                :style="{
                  'opacity': announcementStyle.opacity,
                  'transform': `translateY(${announcementStyle.translateY}px)`
                }">
                {{currentAnnouncement}}
              </p>
            </div>
          </div>
        </el-col>
        <el-col class="head-right" :span="6">
          <div class="mobile-promotion" @mouseover="showQR = true" @mouseleave="showQR = false">
            <icon class="icon m-r" name="mobile-phone" scale="2"></icon>
            <span class="text">手机版聊天室</span>
          </div>
          <div class="qrcode" v-show="showQR">
            <qr-code :text="globalPreference.mobile_url"></qr-code>
          </div>
          <div class="user-info">
            <img @click="showProfileDiag = true" :src="user.avatar ? user.avatar : require('../assets/avatar.png')" width="25">
            <span @click="showProfileDiag = true" class="username">{{user.nickname || user.username}}</span>
            <a @click="logout">退出</a>
          </div>
        </el-col>
      </el-row>
    </el-header>

      <el-container>
        <el-aside width="250px" class="aside">
          <el-tabs
            v-model="activeTab"
            type="border-card">
            <el-tab-pane
              label="在线会员"
              name="members">
              <div class="search-form">
                <el-form>
                  <el-form-item >
                    <el-input v-model="nickname_q" placeholder="请输入会员名称" class="ipt-search"></el-input>
                    <icon class="search-icon fl" name="search" scale="1" @click.native="search"></icon>
                  </el-form-item>
                </el-form>
                <div class="search-tip" v-if="nickname_q && searchEnabled">
                  搜索 「{{nickname_q}}」
                  <span class="exit-search" @click="exitSearch">退出搜索</span>
                </div>
              </div>

              <ul class="members" v-if="onlineMembers.length">
                <li v-for="(member, index) in onlineMembers" @click="popoverMember = member" :key="index" slot="reference">
                  <el-popover
                    :ref="'popover' + member.id"
                    placement="right"
                    :title="member.nickname || '会员'"
                    width="150"
                    trigger="click">
                    <ul class="member-actions">
                      <li @click="privateChat(member)" v-if="member.id !== user.id">私聊</li>
                      <li @click="ban(member, 15)" v-if="member.id !== user.id && !member.is_banned.is_banned && myRoles.includes('manager')">禁言15分钟</li>
                      <li @click="ban(member, 30)" v-if="member.id !== user.id  && !member.is_banned.is_banned && myRoles.includes('manager')">禁言30分钟</li>
                      <li @click="block(member)" v-if="member.id !== user.id && !member.is_blocked && myRoles.includes('manager')">加入黑名单</li>
                      <li @click="unblock(member)" v-if="member.id !== user.id && member.is_blocked && myRoles.includes('manager')">解除拉黑</li>
                      <li @click="unban(member)" v-if="member.id !== user.id && member.is_banned.is_banned  && myRoles.includes('manager')  ">解除禁言</li>
                    </ul>
                    <div slot="reference">
                      <img :src="member.avatar" class="avatar" v-if="member.avatar"/>
                      <img :src="require('../assets/avatar.png')" v-else class="avatar" />
                      {{ member.nickname || '会员' }}
                    </div>
                  </el-popover>
                </li>
                <li v-if="!onlineMembersEnded" class="load-more" @click="fillOnlineMembers">{{ onlineMemberLoading ? '正在加载...' : '查看更多' }}</li>
              </ul>
              <div v-else-if="!onlineMemberLoading" class="empty">无结果</div>
            </el-tab-pane>
            <el-tab-pane
              label="聊天列表"
              name="rooms">
              <div class="chat-list">
                <room-list
                  :user="user"
                  ref="roomList"
                  :activeRoom="activeRoom"></room-list>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-aside>

        <el-main class="chat-area">
          <chat-room :routeLeave="leave"></chat-room>
        </el-main>

        <el-aside width="395px" class="aside">
          <el-tabs type="border-card" @tab-click="loadResult">
            <el-tab-pane :label="'在线投注'">
              <iframe :src="globalPreference.mobile_lottery_url" width="100%" style="height: calc(100vh - 110px)" frameborder="0"></iframe>
            </el-tab-pane>
            <el-tab-pane :label="'文字开奖'">
              <div class="results-container" v-if="lasyLoadResult">
                <result></result>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-aside>

        <el-dialog
          title="最新消息"
          :visible.sync="announcementDialogVisible"
          :width="'600px'"
          center>
          <el-carousel :height="'200px'"
            v-if="announcementDialogVisible"
            class="announcement-popup"
            :initial-index="currentAnnouncementIndex">
            <el-carousel-item v-for="item in announcements"
              :key="item.rank">
              <p class="text-center" key="announcement">
                {{ item.content }}
              </p>
            </el-carousel-item>
          </el-carousel>
        </el-dialog>
        <el-dialog
          title="用户中心"
          :visible.sync="showProfileDiag"
          :width="'600px'"
          @open="changeProfileRes = ''"
          center>
          <div class="edit-profile">
            <div>
              <div
                class="avatar"
                v-on:mouseover="swichAvatar = true"
                v-on:mouseout="swichAvatar = false"
                style="overflow-y: hidden;">
                <div>
                  <img v-if="user.avatar && !swichAvatar" :src="currentChooseAvatar || user.avatar" width="72" height="72">
                  <img v-else-if="!swichAvatar" :src="currentChooseAvatar || require('../assets/avatar.png')" width="72" height="72">
                </div>

                <label
                  for="preViewAvatar"
                  class="upload-avatar">
                  <input @change="preViewAvatar" type="file" ref="preViewAvatar" class="img-upload-input" id="preViewAvatar" accept=".jpg, .png, .gif, .jpeg, image/jpeg, image/png, image/gif" />
                  <span v-if="swichAvatar" class="el-icon-upload"></span>
                </label>
              </div>
              <p class="text-center m-b">上传新头像</p>
              <el-form :model="editUser" status-icon :rules="rules" ref="editUser" :style="{marginLeft: '-20px'}">
                <el-form-item prop="nickname" label="昵称"  label-width="85px">
                  <el-input v-model="editUser.nickname"
                            class="inp">
                  </el-input>
                </el-form-item>

                <el-form-item label="邮箱" prop="email" label-width="85px">
                  <el-input class="input-width" v-model="editUser.email"></el-input>
                </el-form-item>

                <el-form-item prop="mobile" label="手机" label-width="85px">
                  <el-input v-model="editUser.mobile"
                            type="number"
                            class="inp">
                  </el-input>
                </el-form-item>

                <el-form-item prop="QQ" label="QQ"  label-width="85px">
                  <el-input v-model="editUser.QQ"
                            type="number"
                            class="inp">
                  </el-input>
                </el-form-item>

                <el-form-item label="登录IP"  label-width="85px">
                  <p class="member-info">{{user.last_login_ip}}</p>
                </el-form-item>

                <el-form-item label="注册时间"  label-width="85px">
                  <p class="member-info">{{user.date_joined | moment('YYYY-MM-HH')}}</p>
                </el-form-item>

                <el-form-item label="推广链接"  label-width="85px">
                  <p class="member-info">{{promoteUrl}}</p>
                </el-form-item>
                <el-form-item label-width="85px">
                  <el-button class="profile-submit" type="primary" @click="submit">确认修改</el-button>
                </el-form-item>
                <el-form-item label-width="85px">
                  <p :class="[changeProfileSuccess ? 'text-success' : 'text-danger']">{{changeProfileRes}}</p>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-dialog>
      </el-container>

  </el-container>
</template>

<script>
import Vue from 'vue'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/volume-up'
import 'vue-awesome/icons/mobile-phone'
import 'vue-awesome/icons/comments'
import 'vue-awesome/icons/search'
import ChatRoom from '../components/ChatRoom'
import { fetchAnnouce, fetchOnlineMembers, createRoom, updateUser, banChatUser, unbanChatUser, blockChatUser, unblockChatUser, getChatUser } from '../api'
import { msgFormatter } from '../utils'
import { validatePhone, validateQQ } from '../validate'
import urls from '../api/urls'
import Result from '../components/Result'
import { mapState } from 'vuex'
import RoomList from '../components/RoomList'
const RECEIVER = 1

Vue.filter('truncate', function (text, stop) {
  return text.slice(0, stop) + (stop < text.length ? '...' : '')
})
export default {
  name: 'home',
  components: {
    Icon,
    ChatRoom,
    Result,
    RoomList
  },
  data () {
    const qqValidator = (rule, value, callback) => {
      if (value && !validateQQ(value)) {
        callback(new Error('qq号码格式无效'))
      } else {
        callback()
      }
    }
    const phoneValidator = (rule, value, callback) => {
      if (value && !validatePhone(value)) {
        callback(new Error('手机号码格式无效'))
      } else {
        callback()
      }
    }
    return {
      activeRoom: {},
      popoverMember: {},
      searchEnabled: false,
      activeTab: 'members',
      swichAvatar: false,
      uploadUrl: urls.user,
      nickname_q: '',
      showProfileDiag: false,
      searchStr: '',
      leave: false,
      announcementStyle: {
        opacity: 1,
        translateY: 0
      },
      announcements: [],
      currentAnnouncementIndex: 0,
      announcementDialogVisible: false,
      memberLimit: 20,
      memberPage: 0,
      onlineMemberLoading: false,
      onlineMembersEnded: false,
      roomLoading: false,
      roomEnded: false,
      onlineMembers: [],
      roomList: [],
      editUser: {
        mobile: '',
        email: '',
        nickname: '',
        QQ: ''
      },
      oldUser: {},
      rules: {
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur,change' }
        ],
        mobile: [
          { validator: phoneValidator, trigger: 'blur,change' }
        ],
        QQ: [
          { validator: qqValidator, trigger: 'blur,change' }
        ]
      },
      currentChooseAvatar: '',
      changeProfileSuccess: true,
      changeProfileRes: '',
      createRoomLoading: false,
      lasyLoadResult: false,
      showQR: false
    }
  },
  computed: {
    ...mapState([
      'globalPreference'
    ]),
    isHome () {
      return ''
    },
    currentAnnouncement () {
      if (this.announcements[this.currentAnnouncementIndex]) {
        return this.announcements[this.currentAnnouncementIndex].content
      } else {
        return ''
      }
    },
    user () {
      return this.$store.state.user
    },
    promoteUrl () {
      return this.user.promote_code ? window.location.origin + '?r' + this.user.promote_code : ''
    },
    myRoles () {
      return this.user.roles.map(role => role.name)
    }
  },
  watch: {
    'activeTab': function (val, oldVal) {
      if (val === 'rooms') {
        this.initRoomList()
      }
    }
  },
  created () {
    this.leave = false
    this.getAnnouce()
    this.fillOnlineMembers()
  },
  beforeRouteLeave (to, from, next) {
    this.leave = true
    this.$nextTick(() => {
      next()
    })
  },
  methods: {
    getUser (member) {
      getChatUser(1).then(response => {
        if (!response.banned_users.length || !response.block_users.length) {
          this.popoverMember.is_banned.is_banned = false
          this.popoverMember.is_blocked = false
        }

        let newBannedUsers = response.banned_users.map((member) => member.username)
        let newBlockUsers = response.block_users.map((member) => member.username)

        this.popoverMember.is_banned.is_banned = newBannedUsers.includes(member.username)
        this.popoverMember.is_blocked = newBlockUsers.includes(member.username)
      })
    },
    ban (member, mins) {
      banChatUser(RECEIVER, {
        user: member.username,
        banned_time: mins
      }).then((data) => {
        this.getUser(member)
        this.$message({
          showClose: true,
          message: data.status,
          type: 'success'
        })
      }, errorMsg => {
        this.$message({
          showClose: true,
          message: errorMsg.response.data.error,
          type: 'error'
        })
      })
    },
    unban (member, user) {
      unbanChatUser(RECEIVER, {
        user: member.username
      }).then((data) => {
        this.getUser(member)
        this.$message({
          showClose: true,
          message: data.status,
          type: 'success'
        })
      }, errorMsg => {
        let data = errorMsg.response.data
        this.$message({
          showClose: true,
          message: data.error,
          type: 'error'
        })
      })
    },
    block (member) {
      blockChatUser(RECEIVER, {
        user: member.username
      }).then((data) => {
        this.getUser(member)
        this.$message({
          showClose: true,
          message: data.status,
          type: 'success'
        })
      }, errorMsg => {
        this.$message({
          showClose: true,
          message: errorMsg.response.data.error,
          type: 'error'
        })
      })
    },

    unblock (member, user) {
      unblockChatUser(RECEIVER, {
        user: member.username
      }).then((data) => {
        this.getUser(member)
        this.$message({
          showClose: true,
          message: data.status,
          type: 'success'
        })
      }, errorMsg => {
        let data = errorMsg.response.data
        this.$message({
          showClose: true,
          message: data.error,
          type: 'error'
        })
      })
    },
    search () {
      this.searchEnabled = true
      this.memberPage = 0
      this.onlineMembersEnded = false
      this.fillOnlineMembers()
    },
    exitSearch () {
      this.searchEnabled = false
      this.nickname_q = ''
      this.memberPage = 0
      this.onlineMembersEnded = false
      this.fillOnlineMembers()
    },
    privateChat (member) {
      if (member.id === this.user.id) {
        return
      }
      this.createRoomLoading = true
      createRoom([member.id, this.user.id])
        .then((res) => {
          this.$set(this.$refs['popover' + member.id][0], 'showPopper', false)
          this.activeTab = 'rooms'
          this.activeRoom = res.room
          this.createRoomLoading = false
        })
    },
    fillOnlineMembers () {
      if (this.onlineMembersEnded || this.onlineMemberLoading) {
        return
      }
      this.onlineMemberLoading = true
      return fetchOnlineMembers(this.memberLimit, this.memberPage, this.nickname_q)
        .then(res => {
          this.onlineMembers = this.memberPage === 0 ? res.results : this.onlineMembers.concat(res.results)
          this.onlineMembersEnded = this.memberLimit * (this.memberPage + 1) > this.onlineMembers.length
          this.memberPage += 1
          this.onlineMemberLoading = false
        })
    },
    animate () {
      setTimeout(() => {
        if (this.announcementStyle.opacity <= 0) {
          this.currentAnnouncementIndex = (this.currentAnnouncementIndex + 1) % this.announcements.length
          this.announcementStyle.opacity = 1
          this.announcementStyle.translateY = 0
          setTimeout(() => {
            this.animate()
          }, 5000)
        } else {
          this.announcementStyle.opacity -= 0.05
          this.announcementStyle.translateY -= 1
          this.animate()
        }
      }, 100)
    },
    getAnnouce () {
      this.editUser = {
        mobile: this.user.mobile,
        email: this.user.email,
        nickname: this.user.nickname,
        QQ: this.user.QQ
      }
      this.oldUser = Object.assign({}, this.editUser)
      fetchAnnouce().then(result => {
        result.forEach((item) => {
          if (item.platform !== 0) {
            this.announcements.push(item)
          }
        })

        if (this.announcements.length > 0) {
          this.announcements.sort((a, b) => {
            return a.rank - b.rank
          })
          setTimeout(() => {
            this.animate()
          }, 5000)
        }
      }).catch(err => {
        console.log(err)
      })
    },
    receiveMember (user) {
      this.user = user
      // 登录聊天室后才去出发 RoomList 的获取
      this.activeRoom = {
        id: 1
      }
    },
    logout () {
      this.$store.dispatch('logout')
        .then(() => {
          this.$router.push('/login')
        })
    },
    submit () {
      let hasChanged = false
      let formData = new FormData()
      for (let key in this.editUser) {
        if (this.editUser[key] !== this.oldUser[key]) {
          formData.append(key, this.editUser[key])
          hasChanged = true
        }
      }
      let fileInp = this.$refs.preViewAvatar
      let file = fileInp.files[0]
      if (!file && !hasChanged) { return false }
      this.$refs['editUser'].validate((valid) => {
        if (valid) {
          if (file) {
            formData.append('avatar', file)
          }
          updateUser(this.user.id, formData).then(result => {
            if (!result.error) {
              this.changeProfileRes = '修改资料成功'
              this.$store.commit('SET_USER', {
                user: result
              })
            } else {
              this.changeProfileRes = '修改资料失败'
            }
          }, errorMsg => {
            this.$message({
              showClose: true,
              message: msgFormatter(errorMsg),
              type: 'error'
            })
            this.changeProfileRes = '修改资料失败'
          })
        } else {
          return false
        }
      })
    },
    preViewAvatar (e) {
      let fileInp = this.$refs.preViewAvatar
      let file = fileInp.files[0]
      if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(fileInp.value)) {
        this.$message({
          showClose: true,
          message: '文件格式不正确或您目前尚不符合发言条件',
          type: 'error'
        })
        return false
      }
      if (file.size > 1024 * 1024) {
        this.$message({
          showClose: true,
          message: '图片尺寸太大，请选择较小尺寸的图片。',
          type: 'error'
        })
        return
      }
      this.currentChooseAvatar = URL.createObjectURL(file)
    },
    initRoomList () {
      // this.$refs.roomList.roomEnded = false
      // this.$refs.roomList.roomPage = 0
      this.$refs.roomList.fillMemberRooms()
    },
    loadResult (tab) {
      if (tab.index === '1') {
        this.lasyLoadResult = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/vars.scss';
.chat-box {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  background-size: cover;
  background-repeat: no-repeat;
}
.header {
  height: 50px;
  background: rgba(0,0,0,.3);
  margin-bottom: 10px;
  color: #fff;
  .head-cnt {
    height: 100%;
    .head-col {
      height: 100%;
    }
  }
  .logo {
    background-position: center center;
    background-size: contain;
    background-repeat: no-repeat;
    height: 50px;
    h1 {
      text-indent: -999px;
    }
    a {
      padding-top: 6px;
      font-weight: bold;
    }
  }
}

.annouce-box {
  height: 50px;
  display: flex;
  align-items: center;
  .text {
    cursor: pointer;
  }
  .title {
    width: 60px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    align-self: flex-start;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.6);
    span {
      margin-right: 5px;
    }
  }
  .content {
    margin-left: 10px;
    max-width: 500px;
  }
}

.mobile-link {
  float: left;
}
.head-right {
  line-height: 50px;
  vertical-align: middle;
  .username {
    padding: 0 10px;
  }
  img {
    vertical-align: middle;
    display: inline-block;
  }
  .mobile-promotion {
    display: inline-block;
    .icon, .text {
      vertical-align: middle;
    }
  }
  .user-info {
    float: right;
    cursor: pointer;
  }
}
.aside {
  padding: 0 10px 10px;
  overflow-y: hidden;
  /deep/ .el-tabs {
    height: 100%;
    background: rgba(255, 255, 255, .2);
  }
  /deep/ .el-tabs__content {
    padding: 0;
  }
  /deep/ .el-form-item--small.el-form-item {
    margin-bottom: 0;
  }
}
.chat-area {
  padding: 0 0px 10px 0;
}
.members{
  height: calc(100vh - 163px);
  overflow-y: scroll;
  li {
    color: #ccc;
    cursor: pointer;
    padding: 5px 10px;
    .avatar {
      width: 28px;
      height: 28px;
      margin-right: 10px;
      vertical-align: middle;
    }
    &:hover {
      background: rgba(255, 255, 255, .2);
    }
  }
}
.member-actions {
  li {
    cursor: pointer;
    border-top: 1px solid #f0f0f0;
    padding: 10px 0;
  }
}
.empty {
  color: #ccc;
  text-align: center;
}
.ipt-search /deep/ .el-input__inner{
  background: #999;
  border: none;
  color: #fff;
  &::placeholder {
    color: #ccc;
  }
}
.search-tip {
  color: #fff;
  padding: 5px 0;
  .exit-search {
    float: right;
    cursor: pointer;
  }
}
.search-icon {
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 7px;
  color: #fff;
}
.search-form, .results-container {
  padding: 10px;
}
.chat-list {
  color: #ccc;
}

.el-carousel.announcement-popup .el-carousel__button {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: black;
}

.edit-profile {
  width: 50%;
  border-radius: 5px;
  background: rgba(255,255,255,.93);
  margin: 0 auto ;
  position: relative;
  min-height: 200px;
  text-align: center;
  z-index: 9999;
  color: #4f77ab;
  .avatar-upload-tip {
    font-size: 12px;
    color: rgb(255, 127, 77);
  }
  .avatar {
    display: inline-block;
    border-radius: 50%;
    width: 70px;
    height: 70px;
    border: 1px solid #c8d4e4;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    img {
      display: block;
      width: 100%;
    }
    label {
      display: block;
      position: absolute;
      top: 13px;
      left: 0;
      width: 100%;
      text-align: center;
      color: #fff;
      font-size: 50px;
      color: #909090;
      cursor: pointer;
    }
  }
  p {
    cursor: pointer;
  }
  .member-info {
    color: #999;
    text-align: left;
    padding-left: 15px;
  }
  .profile-submit {
    width: 100%;
  }
  .img-upload-input {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    position: absolute;
    top: 0;
  }
}
.results-container {
  height: calc(100vh - 140px);
  overflow-y: auto;
}
.qrcode {
  position: absolute;
  z-index: 3;
  img {
    width: 280px;
    height: 280px;
  }
}

</style>
