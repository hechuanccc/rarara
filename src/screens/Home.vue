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
        <el-tabs type="border-card">
          <el-tab-pane :label="'在线会员(' + onlineMembers.length + ')'">
            <div class="search-form">
              <el-form>
                <el-form-item >
                  <el-input v-model="nickname_q" placeholder="请输入会员名称" class="ipt-search"></el-input>
                  <icon class="search-icon fl" name="search" scale="1"></icon>
                </el-form-item>
              </el-form>
            </div>
            <ul class="members" v-if="onlineMembers.length">
              <li v-for="(member, index) in onlineMembers">
                <img :src="member.avatar_url" class="avatar" v-if="member.avatar_url"/>
                <img :src="require('../assets/avatar.png')" v-else class="avatar" />
                {{ member.nickname || '会员' }}
              </li>
              <li v-if="!onlineMembersEnded" class="load-more" @click="fillOnlineMembers">{{ onlineMemberLoading ? '正在加载...' : '查看更多' }}</li>
            </ul>
            <div v-else class="empty">暂无在线会员</div>
          </el-tab-pane>
          <el-tab-pane label="聊天列表">
            <div class="chat-list">
              <div class="default-room">
                <icon class="volume-up" name="comments" scale="1.8"></icon>
                聊天室大厅
              </div>
              <div v-for="(item, index) in chatList">
                <ul class="clearfix">
                  <li :class="['fl', 'member-level', 'member-level-' + item.type]">{{item.type === 1 ? '客' : '会'}}</li>
                  <li class="fl list-center">
                    <div class="username">{{item.username}}</div>
                    <p>{{item.lastMessage}}</p>
                  </li>
                  <li :class="['fl', 'round', 'round-' + item.status]"></li>
                </ul>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-aside>
      <el-main class="chat-area">
        <chat-room @receiveMember="receiveMember"></chat-room>
      </el-main>
      <el-aside width="375px" class="aside-right">
        <component :is="'Result'"></component>
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
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/volume-up'
import 'vue-awesome/icons/mobile-phone'
import 'vue-awesome/icons/comments'
import 'vue-awesome/icons/search'
import MarqueeTips from 'vue-marquee-tips'
import ChatRoom from '../components/ChatRoom'
import Result from '../components/Result'
import { fetchAnnouce, fetchOnlineMembers } from '../api'

export default {
  name: 'home',
  components: {
    Icon,
    MarqueeTips,
    ChatRoom,
    Result
  },
  data () {
    return {
      user: {},
      nickname_q: '',
      announcementStyle: {
        opacity: 1,
        translateY: 0
      },
      announcements: [],
      currentAnnouncementIndex: 0,
      announcementDialogVisible: false,
      limit: 20,
      page: 0,
      onlineMemberLoading: false,
      onlineMembers: [],
      onlineMembersEnded: false,
      chatList: [{
        username: 'h2545454',
        type: 1,
        lastMessage: '您好请问有什么问题吗?',
        status: 1
      }, {
        username: 'h2545454',
        type: 1,
        lastMessage: '您好请问有什么问题吗?',
        status: 1
      }, {
        username: 'h2545454',
        type: 1,
        lastMessage: '您好请问有什么问题吗?',
        status: 0
      }, {
        username: 'h2545454',
        type: 1,
        lastMessage: '您好请问有什么问题吗?',
        status: 1
      }, {
        username: 'h2545454',
        type: 2,
        lastMessage: '您好请问有什么问题吗?',
        status: 1
      }, {
        username: 'h2545454',
        type: 2,
        lastMessage: '您好请问有什么问题吗?',
        status: 0
      }, {
        username: 'h2545454',
        type: 2,
        lastMessage: '今晚吃什么好吃的呀? 我快啦微微刘恺威一小很清澈哒哒哒的哈哈哈哈啊哈哈哈yes',
        status: 1
      }, {
        username: 'h2545454',
        type: 2,
        lastMessage: '今晚吃什么好吃的呀? 我快啦微微刘恺威一小很清澈哒哒哒的哈哈哈哈啊哈哈哈yes',
        status: 1
      }, {
        username: 'h2545454',
        type: 2,
        lastMessage: '今晚吃什么好吃的呀? 我快啦微微刘恺威一小很清澈哒哒哒的哈哈哈哈啊哈哈哈yes',
        status: 1
      }, {
        username: 'h2545454',
        type: 2,
        lastMessage: '今晚吃什么好吃的呀? 我快啦微微刘恺威一小很清澈哒哒哒的哈哈哈哈啊哈哈哈yes',
        status: 1
      }]
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
    fillOnlineMembers () {
      if (this.onlineMembersEnded || this.onlineMemberLoading) {
        return
      }
      this.onlineMemberLoading = true
      fetchOnlineMembers(this.limit, this.page)
        .then(res => {
          this.onlineMembersCount = res.count
          this.onlineMembers = this.page === 0 ? res.results : this.onlineMembers.concat(res.results)
          this.onlineMembersEnded = this.limit * (this.page + 1) > this.onlineMembers.length
          this.page += 1
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
    padding: 10px;
  }
  /deep/ .el-form-item--small.el-form-item {
    margin-bottom: 10px;
  }
}
.chat-area {
  padding: 0 10px 10px 0;
}
.members{
  max-height: 500px;
  overflow-y: scroll;
  border-top: 1px solid #999;
  li {
    color: #ccc;
    cursor: pointer;
    padding: 5px 0;
    border-bottom: 1px solid #999;
    .avatar {
      width: 28px;
      height: 28px;
      margin-right: 10px;
      vertical-align: middle;
    }
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
  width: 100%;
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
</style>
