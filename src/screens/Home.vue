<template>
  <el-container class="chat-box">
    <el-header class="header">
      <el-row class="head-cnt">
        <el-col :span="4" class="head-col head-left logo clearfix">
          <h1 class="fl">至尊计划聊天室</h1>
          <icon class="mobile-phone fl" name="mobile-phone" scale="1.8"></icon>
          <a class="fl" href="javascript:;">手机聊天室</a>
        </el-col>
        <el-col class="head-col head-center" :span="16">
          <div class="annouce-box clearfix">
            <div class="annouce-l clearfix fl">
              <span class="fl">公告</span>
              <icon class="volume-up fl" name="volume-up" scale="1"></icon>
            </div>
            <div class="scroll fl">
              <MarqueeTips :content="chatAnnounce" :speed="20"></MarqueeTips>
            </div>
          </div>
        </el-col>
        <el-col class="head-col head-right clearfix" :span="4"><div>
          <img class="fl" src="../assets/avatar.png" width="25">
          <span class="fl username">山东桃酥</span>
          <span class="fl">退出</span>
        </div></el-col>
      </el-row>
    </el-header>
    <el-container>
      <el-aside width="300px" class="aside">
        <el-tabs type="border-card">
          <el-tab-pane label="在线会员">
            <dl class="online-member">
              <dt>
                <el-form class="search-form">
                  <el-form-item style="position: relative;">
                    <el-input v-model="searchStr" placeholder="请输入活动名称" class="inp-search"></el-input>
                    <icon class="search fl" name="search" scale="1"></icon>
                  </el-form-item>
                </el-form>
              </dt>
              <dd v-for="(item, index) in onLineMember">
                <ul class="clearfix">
                  <li :class="['fl', 'member-level', 'member-level-' + item.type]">{{item.type === 1 ? '客' : '会'}}</li>
                  <li class="fl list-center">
                    <div class="username">{{item.username}}</div>
                  </li>
                  <li :class="['fl', 'round', 'round-' + item.status]"></li>
                </ul>
              </dd>
            </dl>
          </el-tab-pane>
          <el-tab-pane label="聊天列表">
            <dl class="chat-list">
              <dt class="clearfix">
                <icon class="volume-up fl" name="comments" scale="1.8"></icon>
                <h4 class="fl">计划聊天室大厅</h4>
              </dt>
              <dd v-for="(item, index) in chatList">
                <ul class="clearfix">
                  <li :class="['fl', 'member-level', 'member-level-' + item.type]">{{item.type === 1 ? '客' : '会'}}</li>
                  <li class="fl list-center">
                    <div class="username">{{item.username}}</div>
                    <p>{{item.lastMessage}}</p>
                  </li>
                  <li :class="['fl', 'round', 'round-' + item.status]"></li>
                </ul>
              </dd>
            </dl>
          </el-tab-pane>
        </el-tabs>
      </el-aside>
      <el-main class="chat-area">
        <chat-room></chat-room>
      </el-main>
      <el-aside width="300px" height="100%" class="aside-right">
        right area1
      </el-aside>
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
export default {
  name: 'home',
  components: {
    Icon,
    MarqueeTips,
    ChatRoom
  },
  data () {
    return {
      searchStr: '',
      chatAnnounce: '欢迎来到至尊计划聊天室。',
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
      }],
      onLineMember: [{
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
    }
  },
  methods: {
  },
  created () {
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
    height: 60px;
    background: url('../assets/head_bg.png');
    margin-bottom: 5px;
    color: #fff;
    .head-cnt {
      height: 100%;
      .head-col {
        height: 100%;
      }
      .head-center {
        width: calc(100% - 350px - 400px);
        .scroll {
          padding-top: 20px;
          width: calc(100% - 60px);
        }
        .annouce-box {
          height: 60px;
        }
        .annouce-l {
          width: 60px;
          height: 40px;
          background: rgba(0, 0, 0, 0.6);
          padding-top: 20px;
          span {
            padding-right: 3px;
            padding-left: 9px;
          }
        }
      }
      .head-right {
        width: 400px;
        padding-top: 17px;
        padding-left: 60px;
        span {
          padding: 4px 0;
        }
        .username {
          padding: 4px 10px;
        }
      }
    }
    .logo {
      background: url('../assets/logo_chat.png') no-repeat;
      width: 350px;
      padding-top: 13px;
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
  .aside {
    padding: 0 5px;
  }
  .chat-area {
    padding: 0 10px;
  }
  .chat-list, .online-member {
    color: #fff;
    .volume-up {
      color: #009ee3;
      display: inline-block;
      padding-top: 8px;
    }
    dt {
      height: 42px;
    }
    dd {
      height: 42px;
      padding: 8px 10px;
      border-bottom: 1px solid #fff;
      .member-level {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        text-align: center;
        line-height: 20px;
        font-size: 12px;
        &.member-level-1 {
          background: #ecd842;
        }
        &.member-level-2 {
          background: #0b52a3;
        }
      }
      .list-center {
        padding-left: 14px;
        width: 200px;
        p {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .round {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        margin-top: 10px;
        &.round-1 {
          background: #50e3c2;
        }
        &.round-0 {
          background: #c9c5c9;
        }
      }
    }
    dt {
      text-align: center;
      background-color: rgba(255, 255, 255, 0.2);
      padding-left: 40px;
      margin-bottom: 6px;
      h4 {
        font-size: 18px;
        display: inline-block;
        line-height: 12px;
        padding-left: 18px;
        padding-top: 17px;
      }
    }
  }
  .online-member {
    dt {
      padding-left: 0;
      background-color: transparent;
    }
    dd {
      height: 22px;
      
      .list-center {
        padding-top: 3px;
      }
    }
  }
  .search {
    position: absolute;
    right: 10px;
    top: 7px;
    color: #fff;
  }
  .search-form {
    width: 100%;
  }
</style>
