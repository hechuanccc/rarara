<template>
  <el-container class="chat-box">
    <el-header class="header" height="50px">
      <el-row>
        <el-col :span="4" class="logo clearfix">
        </el-col>
        <el-col :span="16">
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
        <el-col class="head-right" :span="4">
          <div class="user-info">
            <img :src="user.avatar_url ? user.avatar_url : require('../assets/avatar.png')" width="25">
            <span class="username">{{user.username}}</span>
            <a @click="logout">退出</a>
          </div>
        </el-col>
      </el-row>
    </el-header>


    <el-container>
      <el-aside width="250px" class="aside">
        <el-tabs
          v-model="activeTab"
          type="border-card"
          @tab-click="switchTab">
          <el-tab-pane
            :label="'在线会员(' + onlineMembers.length + ')'"
            name="members">
            <div class="search-form">
              <el-form>
                <el-form-item >
                  <el-input v-model="nickname_q" placeholder="请输入会员名称" class="ipt-search"></el-input>
                  <icon class="search-icon fl" name="search" scale="1"></icon>
                </el-form-item>
              </el-form>
            </div>

            <ul class="members" v-if="onlineMembers.length">
              <li v-for="(member, index) in onlineMembers" @click="popoverMember=member" slot="reference">
                <el-popover
                  :ref="'popover' + member.id"
                  placement="right"
                  :title="member.nickname || '会员'"
                  width="150"
                  trigger="click"
                  content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。">
                  <ul class="member-actions">
                    <li @click="privateChat(member)">私聊</li>
                  </ul>
                  <div slot="reference">
                    <img :src="member.avatar_url" class="avatar" v-if="member.avatar_url"/>
                    <img :src="require('../assets/avatar.png')" v-else class="avatar" />
                    {{ member.nickname || '会员' }}
                  </div>
                </el-popover>
              </li>
              <li v-if="!onlineMembersEnded" class="load-more" @click="fillOnlineMembers">{{ onlineMemberLoading ? '正在加载...' : '查看更多' }}</li>
            </ul>
            <div v-else class="empty">暂无在线会员</div>
          </el-tab-pane>
          <el-tab-pane
            label="聊天列表"
            name="rooms">
            <div class="chat-list">
              <ul class="rooms">
                <li v-for="(room, index) in roomList" :class="{
                  active: activeRoomIndex === index,
                  public: room.type === 1
                }">
                  <div class="meta">
                    <icon class="volume-up" name="comments" scale="1.5" v-if="room.type === 1"></icon>
                    <span class="title">{{ room.title}}</span>
                  </div>
                  <div v-if="room.last_message">{{room.last_message.content | truncate(25)}}</div>
                </li>
              </ul>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-aside>


      <el-main class="chat-area">
        <chat-room @receiveMember="receiveMember"></chat-room>
      </el-main>

      <el-aside width="395px" class="aside">
        <el-tabs type="border-card">
          <el-tab-pane :label="'在线投注'">
            <!-- todo: apply api -->
            <iframe src="http://rico-st8ging.azureedge.net/#/" width="100%" style="height: calc(100vh - 130px)" frameborder="0"></iframe>
          </el-tab-pane>
          <el-tab-pane :label="'文字开奖'">
            <div class="results-container">
              <!-- <component :is="'Result'"></component> -->
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


    </el-container>
  </el-container>
</template>

<script>
import Vue from 'vue'
import _ from 'lodash'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/volume-up'
import 'vue-awesome/icons/mobile-phone'
import 'vue-awesome/icons/comments'
import 'vue-awesome/icons/search'
import MarqueeTips from 'vue-marquee-tips'
import ChatRoom from '../components/ChatRoom'
// import Result from '../components/Result'
import { fetchAnnouce, fetchOnlineMembers, createRoom, fetchMemberRoom } from '../api'

Vue.filter('truncate', function (text, stop) {
  return text.slice(0, stop) + (stop < text.length ? '...' : '')
})

export default {
  name: 'home',
  components: {
    Icon,
    MarqueeTips,
    ChatRoom
    // Result
  },
  data () {
    return {
      user: {},
      activeRoomIndex: 0,
      popoverMember: {},
      activeTab: 'members',
      nickname_q: '',
      announcementStyle: {
        opacity: 1,
        translateY: 0
      },
      announcements: [],
      currentAnnouncementIndex: 0,
      announcementDialogVisible: false,
      memberLimit: 20,
      memberPage: 0,
      roomLimit: 40,
      roomPage: 0,
      onlineMemberLoading: false,
      onlineMembersEnded: false,
      roomLoading: false,
      roomEnded: false,
      onlineMembers: [],
      roomList: []
    }
  },
  computed: {
    isHome () {
      return ''
    },
    currentAnnouncement () {
      if (this.announcements[this.currentAnnouncementIndex]) {
        return this.announcements[this.currentAnnouncementIndex].content
      } else {
        return ''
      }
    }
  },
  created () {
    this.getAnnouce()
    this.fillOnlineMembers()
  },
  methods: {
    privateChat (member) {
      createRoom([member.id, this.user.id])
        .then((res) => {
          this.$set(this.$refs['popover' + member.id][0], 'showPopper', false)
          this.activeTab = 'rooms'
          this.roomPage = 0
          this.roomEnded = false
          this.fillMemberRooms()
            .then(() => {
              this.activeRoomIndex = _.findIndex(this.roomList, room => room.id === res.room.id)
            })
        })
    },
    fillOnlineMembers () {
      if (this.onlineMembersEnded || this.onlineMemberLoading) {
        return
      }
      this.onlineMemberLoading = true
      return fetchOnlineMembers(this.memberLimit, this.memberPage)
        .then(res => {
          this.onlineMembersCount = res.count
          this.onlineMembers = this.memberPage === 0 ? res.results : this.onlineMembers.concat(res.results)
          this.onlineMembersEnded = this.memberLimit * (this.memberPage + 1) > this.onlineMembers.length
          this.memberPage += 1
          this.onlineMemberLoading = false
        })
    },
    switchTab (tab) {
      switch (tab.index) {
        case '0':
          return this.fillOnlineMembers()
        case '1':
          return this.fillMemberRooms()
        default:;
      }
    },
    fillMemberRooms () {
      if (this.roomEnded || this.roomLoading) {
        return
      }
      this.roomLoading = true
      return fetchMemberRoom(this.roomLimit, this.roomPage)
        .then(res => {
          this.roomList = this.roomPage === 0 ? res.results : this.roomList.concat(res.results)
          this.roomEnded = this.roomLimit * (this.roomPage + 1) > this.roomList.length
          this.roomPage += 1
          this.roomLoading = false
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
    },
    logout () {
      this.$store.dispatch('logout')
        .then(() => {
          this.$router.push('/login')
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-box {
  width: 100%;
  height: 100%;
  background: url('../assets/chat_bg.jpg') 0px 0px / 100% 100% no-repeat scroll rgb(64, 128, 128);
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
    background: url('../assets/logo_chat.png') no-repeat 0 center;
    height: 50px;
    h1 {
      text-indent: -999px;
    }
    .mobile-phone {
      padding-left: 230px;
      padding-right: 10px;
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
.rooms {
  margin-top: 10px;
  height: calc(100vh - 163px);
  overflow-y: scroll;
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
  .public .title {
    font-size: 14px;
  }
  li {
    color: #ccc;
    cursor: pointer;
    padding: 5px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, .2);
  }
  .active {
    background: #FFB74D;
    color: #fff;
  }
}
.load-more {
  text-align: center;
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
.search-icon {
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 7px;
  color: #fff;
}
.search-form {
  padding: 10px;
}
.chat-list {
  color: #ccc;
}
.default-room {
  .fa-icon {
    vertical-align: middle;
  }
}
.el-carousel.announcement-popup .el-carousel__button {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: black;
}

.results-container {
  height: calc(100vh - 130px);
  overflow-y: auto;
}

</style>
