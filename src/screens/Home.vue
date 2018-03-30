<template>
  <el-container class="chat-box" :style="{backgroundImage: `url(${globalPreference.web_background})`}">
    <el-header class="header" height="50px">
      <el-row>
        <el-col :span="4" class="logo clearfix" :style="{backgroundImage: `url(${globalPreference.logo})`}">
        </el-col>
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
        <el-col class="head-right fr" :span="6">
          <div class="mobile-promotion" @mouseover="showQR = true" @mouseleave="showQR = false">
            <icon class="icon m-r" name="mobile-phone" scale="2"></icon>
            <span class="text">手机版聊天室</span>
            <div class="qrcode" v-show="showQR">
              <qr-code :text="globalPreference.mobile_url"></qr-code>
            </div>
          </div>
          <div class="user-info fr pointer" v-if="myRoles && !myRoles.includes('visitor')">
            <img @click="showProfileDiag = true" :src="user.avatar ? user.avatar : require('../assets/avatar.png')" height="25" width="25">
            <span @click="showProfileDiag = true" class="username">{{user.nickname || user.username}}</span>
            <a class="logout" @click="logout">退出</a>
          </div>
          <div class="visitor-actions fr" v-else>
            <span class="greeting m-r">游客, 您好</span>
            <span class="login pointer" @click="$router.push({name: 'Login'})">
              登入
            </span>
            <span>|</span>
            <span class="register pointer" @click="$router.push({name: 'Register'})">
              注册
            </span>
          </div>
        </el-col>
      </el-row>
    </el-header>

    <el-container class="home-container full-height">
      <el-aside v-if="asideShown" width="250px" class="aside">
        <el-tabs
          v-model="activeTab"
          type="border-card">
          <el-tab-pane
            :disabled="loading"
            label="会员列表"
            class="full-height"
            name="chats">
            <div class="chat-list full-height">
              <ChatList v-if="activeTab === 'chats'"
                @getChosenChat="handleChatChoose"
                @switchToRooms="handlePrivateChat"
                ref="chatList">
              </ChatList>
            </div>
          </el-tab-pane>
          <el-tab-pane
            :disabled="loading"
            label="聊天列表"
            class="full-height"
            name="rooms">
            <div class="chat-list full-height">
              <ChatList v-if="activeTab === 'rooms'" :rooms="rooms" :roomAmount="Object.values(rooms).length" :unread="true" ref="chatList">
              </ChatList>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-aside>

      <el-main class="chat-area full-height">
        <chat-room :class="{'p-l': !asideShown}" @handleAvatarClick="handleAvatarClick"></chat-room>
      </el-main>

      <el-aside width="395px" class="aside">
        <el-tabs type="border-card" class="alone">
          <el-tab-pane :label="'文字开奖'" class="full-height">
            <div class="results-container">
              <result></result>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-aside>

      <el-dialog
        class="edit-dialog"
        v-if="memberDialog.chat.id"
        :show-close="true"
        :modal="true"
        :visible.sync="memberDialog.visible"
        :width="'400px'"
        @close="memberDialog.chat = {}"
        top="10vh">
        <EditUser v-if="memberDialog.chat.id" :userId="memberDialog.chat.id" @memberDialogClose="memberDialogClose"></EditUser>
      </el-dialog>

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
          class="profile-dialog"
          :visible.sync="showProfileDiag"
          :width="'600px'"
          @open="changeProfileRes = ''"
          @close="handleProfileDialogClose"
          top="10vh"
          center>
          <div class="edit-profile">
            <el-tabs v-model="activePanel" type="card" @tab-click="changeProfileRes = ''">
              <el-tab-pane class="edit-user-panel" label="帐号信息" name="account">
                <div
                  v-if="activePanel === 'account'"
                  class="avatar"
                  v-on:mouseover="swichAvatar = true"
                  v-on:mouseout="swichAvatar = false"
                  style="overflow-y: hidden;">
                  <div>
                    <img v-if="user.avatar && !swichAvatar" :src="currentChooseAvatar || user.avatar" width="72" height="72">
                    <img v-else-if="!swichAvatar" :src="currentChooseAvatar || require('../assets/avatar.png')" width="72" height="72">
                  </div>
                  <label for="preViewAvatar" class="pointer">
                    <input @change="preViewAvatar"
                      type="file"
                      ref="preViewAvatar"
                      class="img-upload-input"
                      id="preViewAvatar"
                      accept=".jpg, .png, .gif, .jpeg, image/jpeg, image/png, image/gif" />
                    <span v-if="swichAvatar" class="el-icon-upload"></span>
                  </label>
                </div>
                <p class="text-center m-b-lg m-t">
                  <label for="preViewAvatar"
                    class="pointer new-avatarbtn m-r-lg m-l"
                    @mouseover="swichAvatar = true"
                    @mouseout="swichAvatar = false">上传新头像</label>
                  <label class="pointer"
                    v-if="user.avatar !== null"
                    @click="restoreAvatar"
                    @mouseover="currentChooseAvatar = require('../assets/avatar.png')"
                    @mouseout="currentChooseAvatar = tempAvatar ? tempAvatar : user.avatar">恢复预设头像</label>
                </p>

                <el-form :model="editUser"
                  status-icon
                  :rules="rules"
                  ref="editUser">
                  <el-form-item prop="nickname" label="昵称"  label-width="85px">
                    <el-input v-model="editUser.nickname"
                              class="inp">
                    </el-input>
                  </el-form-item>
                  <el-form-item prop="mobile" label="手机" label-width="85px">
                    <el-input v-model="editUser.mobile"
                              @keypress.native="filtAmount"
                              type="number"
                              class="inp">
                    </el-input>
                  </el-form-item>
                  <el-form-item prop="QQ" label="QQ"  label-width="85px">
                    <el-input v-model="editUser.QQ"
                              @keypress.native="filtAmount"
                              type="number"
                              class="inp">
                    </el-input>
                  </el-form-item>

                  <el-form-item label="用户余额"  label-width="85px">
                    <p class="member-info">{{user.balance}}</p>
                  </el-form-item>
                  <el-form-item label="注册时间"  label-width="85px">
                    <p class="member-info">{{user.date_joined | moment('YYYY-MM-HH')}}</p>
                  </el-form-item>
                  <el-form-item v-if="promoteUrl" label="推广链接"  label-width="85px">
                    <p class="member-info">{{promoteUrl}}</p>
                  </el-form-item>
                  <el-form-item v-if="agent" label="代理商"  label-width="85px">
                    <p class="member-info">{{agent}}</p>
                  </el-form-item>

                  <el-form-item label-width="85px">
                    <el-button class="profile-submit" type="primary" @click="submit" :disabled="disabledEditProfile">确认修改</el-button>
                  </el-form-item>
                  <el-form-item label-width="85px">
                    <p :class="[changeProfileSuccess ? 'text-success' : 'text-danger']">{{changeProfileRes}}</p>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <el-tab-pane label="红包纪录" name="record">
                <div  v-if="activePanel === 'record'" v-loading="tableLoading">
                  <el-table
                    :data="envelopeRecord"
                    class="envelope-table"
                    style="width: 100%">
                    <el-table-column
                      prop="status"
                      label="收发"
                      width="100px">
                    </el-table-column>
                    <el-table-column
                      prop="amount"
                      label="红包总额"
                      width="100px">
                    </el-table-column>
                    <el-table-column
                      prop="packs"
                      width="100px"
                      label="个数">
                    </el-table-column>
                    <el-table-column
                      prop="created_at"
                      width="190px"
                      label="时间">
                    </el-table-column>
                  </el-table>
                  <el-pagination
                    :page-size="envelopePagination.limit"
                    :current-page="1"
                    v-if="envelopePagination.total"
                    @current-change="handleEnvelopePagination"
                    layout="prev, pager, next"
                    :total="envelopePagination.total">
                  </el-pagination>
                </div>
              </el-tab-pane>

              <el-tab-pane class="edit-password-panel"
                label="修改密码"
                name="password"
                >
                <el-form class="edit-password-form"
                  v-if="activePanel === 'password'"
                  :model="editPassword" status-icon
                  :rules="passwordRules"
                  ref="editPassword"
                  label-width="100px">
                  <el-form-item prop="prev_password" label="旧密码">
                    <el-input v-model="editPassword.prev_password"
                              type="password"
                              :maxlength="15"
                              class="inp">
                    </el-input>
                  </el-form-item>
                  <el-form-item prop="new_password" label="新密码">
                    <el-input v-model="editPassword.new_password"
                              type="password"
                              :maxlength="15"
                              class="inp">
                    </el-input>
                  </el-form-item>
                  <el-form-item prop="repeat_password" label="确认新密码">
                    <el-input v-model="editPassword.repeat_password"
                              type="password"
                              :maxlength="15"
                              class="inp">
                    </el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button class="inp profile-submit" type="primary" @click="updatePassword" :disabled="disabledEditProfile">确认修改</el-button>
                  </el-form-item>
                  <el-form-item>
                    <p :class="[changeProfileSuccess ? 'text-success' : 'text-danger']">{{changeProfileRes}}</p>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>
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
import { fetchAnnouce, updateUser, getEnvelopeRecord } from '../api'
import { msgFormatter, filtAmount } from '../utils'
import { validatePhone, validateQQ, validatePassword } from '../validate'
import urls from '../api/urls'
import Result from '../components/Result'
import { mapState, mapGetters } from 'vuex'
import ChatList from '../components/ChatList'
import EditUser from '../components/EditUser'

Vue.filter('truncate', function (text, stop) {
  return text.slice(0, stop) + (stop < text.length ? '...' : '')
})
export default {
  name: 'home',
  components: {
    Icon,
    ChatRoom,
    Result,
    ChatList,
    EditUser
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
    const passwordValidator = (form) => {
      return (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入新密码'))
        } else {
          if (this[form].repeat_password !== '') {
            this.$refs[form].validateField('repeat_password')
          }
          callback()
        }
      }
    }
    const passwordFormatValidator = (rule, value, callback) => {
      if (!validatePassword(value)) {
        callback(new Error('请输入8~15字元，其中至少包含一大写字母及一数字'))
      } else {
        callback()
      }
    }
    const repeatPasswordValidator = (form) => {
      return (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== this[form].new_password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }
    }

    return {
      activeRoom: {},
      popoverMember: {},
      searchEnabled: false,
      activeTab: 'chats',
      swichAvatar: false,
      uploadUrl: urls.user,
      nickname_q: '',
      showProfileDiag: false,
      searchStr: '',
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
      onlineMembers: [],
      editUser: {
        mobile: '',
        email: '',
        nickname: '',
        QQ: ''
      },
      oldUser: {},
      editPassword: {
        prev_password: '',
        repeat_password: '',
        new_password: ''
      },
      disabledEditProfile: false,
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
      passwordRules: {
        prev_password: [
          { required: true, message: '请输入旧密码', trigger: 'blur' }
        ],
        new_password: [
          { required: true, validator: passwordValidator('editPassword'), trigger: 'blur' },
          { validator: passwordFormatValidator, trigger: 'blur,change' }
        ],
        repeat_password: [
          { required: true, validator: repeatPasswordValidator('editPassword'), trigger: 'blur' }
        ]
      },
      currentChooseAvatar: '',
      changeProfileSuccess: true,
      changeProfileRes: '',
      createRoomLoading: false,
      lasyLoadResult: false,
      showQR: false,
      activePanel: 'account',
      hallLastMsg: '',
      tempAvatar: '',
      memberDialog: {
        visible: true,
        chat: {}
      },
      envelopeRecord: [],
      envelopePagination: {
        total: 0,
        currentPage: 1,
        limit: 40
      },
      tableLoading: false
    }
  },
  computed: {
    ...mapState([
      'globalPreference',
      'loading',
      'user',
      'rooms'
    ]),
    ...mapGetters([
      'myRoles'
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
      return this.user.promote_code ? window.location.origin + '/#/?r=' + this.user.promote_code : ''
    },
    agent () {
      return this.user.agent ? this.user.agent.username : ''
    },
    asideShown () {
      return this.myRoles.includes('customer service')
    }
  },
  watch: {
    'nickname_q': function (val) {
      if (val === '') {
        this.exitSearch()
      }
    },
    'showProfileDiag': function () {
      this.$nextTick(() => {
        this.$refs['editUser'].clearValidate()
      })
    },
    'user': function () {
      this.initUser()
    },
    'activePanel': function (panel) {
      if (panel === 'record') {
        this.getEnvelopeRecord(0, this.envelopePagination.limit)
      }
    }
  },
  created () {
    this.getAnnouce()
  },
  methods: {
    handleEnvelopePagination (currentPage) {
      this.envelopePagination.currentPage = currentPage
      this.getEnvelopeRecord((currentPage - 1) * this.envelopePagination.limit, this.envelopePagination.limit)
    },
    handleProfileDialogClose () {
      this.currentChooseAvatar = null
      this.activePanel = 'account'
    },
    getEnvelopeRecord (offset, limit) {
      this.tableLoading = true

      getEnvelopeRecord(offset, limit).then(res => {
        this.envelopePagination.total = res.count

        res.results.forEach((item) => {
          let amount = '' + item.amount
          item.amount = amount.indexOf('-') !== -1 ? `- ¥${amount.replace('-', '')}` : `+ ¥${amount}`
          item.created_at = this.$moment(item.created_at).format('YYYY-MM-DD HH:mm:ss')
        })

        this.envelopeRecord = res.results

        this.tableLoading = false
      })
    },
    handlePrivateChat () {
      this.activeTab = 'rooms'
    },
    handleAvatarClick (sender) {
      this.memberDialog.chat = sender
      this.memberDialog.visible = true
    },
    handleChatChoose (chat) {
      this.memberDialog.chat = chat
      this.memberDialog.visible = true
    },
    memberDialogClose () {
      this.memberDialog.visible = true
      this.memberDialog.chat = {}
    },
    restoreAvatar () {
      this.disabledEditProfile = true
      updateUser(this.user.id, {avatar: ''}).then(result => {
        if (!result.error) {
          this.changeProfileRes = '已恢复预设头像'
          this.currentChooseAvatar = result.avatar

          this.$store.commit('SET_USER', {
            user: result
          })
        } else {
          this.changeProfileRes = '修改资料失败'
        }
        this.disabledEditProfile = false
      }, errorMsg => {
        this.$message({
          showClose: true,
          message: msgFormatter(errorMsg),
          type: 'error'
        })
        this.changeProfileRes = '修改资料失败'

        this.disabledEditProfile = false
      })
    },
    filtAmount,
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
    initUser () {
      this.editUser = {
        mobile: this.user.mobile,
        email: this.user.email,
        nickname: this.user.nickname,
        QQ: this.user.QQ
      }

      this.oldUser = Object.assign({}, this.editUser)
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
      if (!file && !hasChanged) {
        this.changeProfileRes = '请作出修改再送出'
        return false
      }
      this.$refs['editUser'].validate((valid) => {
        if (valid) {
          if (file) {
            formData.append('avatar', file)
          }
          this.disabledEditProfile = true
          updateUser(this.user.id, formData).then(result => {
            if (!result.error) {
              this.changeProfileRes = '修改资料成功'
              this.$store.dispatch('fetchUser')

              this.showProfileDiag = false
            } else {
              this.changeProfileRes = '修改资料失败'
            }
            setTimeout(() => {
              this.disabledEditProfile = false
            }, 1000)
          }, errorMsg => {
            this.$message({
              showClose: true,
              message: msgFormatter(errorMsg),
              type: 'error'
            })
            this.changeProfileRes = '修改资料失败'
            this.disabledEditProfile = false
          })
        } else {
          return false
        }
      })
    },
    updatePassword () {
      this.$refs['editPassword'].validate((valid) => {
        if (valid) {
          this.disabledEditProfile = true
          updateUser(this.user.id, {password: this.editPassword}).then(result => {
            if (!result.error) {
              this.changeProfileRes = '修改资料成功'
            } else {
              this.changeProfileRes = '修改资料失败'
            }
            setTimeout(() => {
              this.disabledEditProfile = false
              this.$refs['editPassword'].resetFields()
            }, 1000)
          }, errorMsg => {
            this.$message({
              showClose: true,
              message: msgFormatter(errorMsg),
              type: 'error'
            })
            this.changeProfileSuccess = false
            this.changeProfileRes = '修改资料失败'
            this.disabledEditProfile = false
          })
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
      this.tempAvatar = URL.createObjectURL(file)
      this.currentChooseAvatar = URL.createObjectURL(file)
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

  .logo {
    background-position: center center;
    background-size: contain;
    background-repeat: no-repeat;
    width: 230px;
    height: 50px;
    margin-left: -10px;
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
  display: inline-block;
  width: 50%;
  height: 50px;
  line-height: 50px;
  margin-left: 5px;
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
    padding: 0 10px 0 0;
    &:hover {
      text-decoration: underline;
    }
    &:active {
      color: #ccc;
    }
  }

  img {
    vertical-align: middle;
    display: inline-block;
  }

  .mobile-promotion {
    text-align: center;
    display: inline-block;
    .icon, .text {
      vertical-align: middle;
    }
  }

  .logout {
    &:hover {
      text-decoration: underline;
    }
    &:active {
      color: #ccc;
    }
  }

  .visitor-actions {
    .login, .register {
      display: inline-block;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
.aside {
  height: 100%;
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
  border-radius: 5px;
  background: rgba(255, 255, 255, .8);
  margin: 0 auto ;
  position: relative;
  min-height: 200px;
  text-align: center;
  z-index: 9999;
  color: #4f77ab;
  /deep/ .el-form-item--small.el-form-item {
    margin-bottom: 24px;
  }
  /deep/ .text.el-form-item--small.el-form-item {
    margin-bottom: 0;
  }
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
  .edit-user-panel {
    width: 300px;
    margin: 0 auto;
  }
  .edit-password-form {
    width: 455px;
    margin-left: 95px;
    text-align: left;
    .inp {
      width: 235px;
    }
  }
}
.results-container {
  height: 100%;
  overflow-y: hidden;
}
.qrcode {
  position: absolute;
  z-index: 3;
  padding: 10px;
  background: #fff;
  img {
    width: 280px;
    height: 280px;
  }
}

.text-success {
  color: $green;
}
.text-danger {
  color: $red;
}

.new-avatarbtn {
  display: inline-block;
}

.privatechat-dialog /deep/ .el-dialog--center .el-dialog__header {
  padding-top: 0;
}

.home-container {
  height: calc(100% - 50px);
}

.edit-dialog /deep/ .el-dialog__header,.edit-dialog /deep/ .el-dialog__body {
  padding: 0;
}

.envelope-table {
  height: 490px;
  overflow: auto;
  & /deep/ .cell {
    text-align: center;
  }
}
</style>
