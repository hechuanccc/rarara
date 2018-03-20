<template>
  <div class="restraint-dialog">
    <div v-if="restraint.dialogVisible && restraint.showManageDialog">
        <el-menu :default-active="'0'" class="m-b-xlg" mode="horizontal">
          <el-menu-item v-for="(tab, index) in restraint.tabs"
            :key="index"
            :index="index + ''"
            @click.native="switchBlockTab(index)">{{tab.display}}</el-menu-item>
        </el-menu>
        <el-table
          :data="restraint.nowTab === '1' ? bannedUsers : blockedUsers"
          style="width: 100%">
          <el-table-column
            prop="username"
            label="帐号"
            :width="restraint.nowTab === '0' ? 322 : 215">
          </el-table-column>
          <el-table-column
            v-if="restraint.nowTab === '1'"
            prop="banned_time"
            label="时间(min)"
            width="215">
          </el-table-column>
          <el-table-column
            label="操作"
            :width="restraint.nowTab === '0' ? 322 : 215">
            <template slot-scope="scope">
              <el-button v-if="restraint.nowTab === '1'" size="mini" type="danger" @click.native="unban(scope.row.username)">解除</el-button>
              <el-button v-else size="mini" type="danger" @click.native="unblock(scope.row.username)">解除</el-button>
            </template>
          </el-table-column>
        </el-table>
    </div>
    <div  v-if="restraint.dialogVisible && restraint.showRestraintDialog">
      <div class="information text-center" v-if="restraint.user">
        <div class="avatar">
          <img class="img" v-if="restraint.user.avatar" :src="restraint.user.avatar" alt="avatar">
          <img class="img" v-else :src="require('../assets/avatar.png')" alt="default">
        </div>
        <div class="m-t">
          {{restraint.user.nickname || restraint.user.username}}
          <div>
            <span v-for="(role, index) in restraint.user.roles" :key="index">
              ({{role.display_name}})
            </span>
          </div>
        </div>
      </div>
      <div slot="footer" class="m-t-lg actions text-center">
        <el-button type="danger" v-if="!isBanned" @click.native="ban(15)">禁言15分钟</el-button>
        <el-button type="danger" v-if="!isBanned" @click.native="ban(30)">禁言30分钟</el-button>
        <el-button type="danger" v-if="!isBlocked" @click.native="block()">加入黑名单</el-button>
        <el-button type="danger" v-if="isBlocked" @click.native="unblock(restraint.user.username)">解除拉黑</el-button>
        <el-button type="danger" v-if="isBanned" @click.native="unban(restraint.user.username)">解除禁言</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { banChatUser, blockChatUser, unbanChatUser, unblockChatUser, getChatUser } from '../api'

export default {
  props: {
    restraint: {
      type: Object
    },
    blockedUsers: {
      type: Array
    },
    bannedUsers: {
      type: Array
    },
    RECEIVER: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      isBanned: false,
      isBlocked: false
    }
  },
  methods: {
    switchBlockTab (index) {
      this.restraint.nowTab = index + ''
    },
    ban (mins) {
      banChatUser(this.RECEIVER, {
        user: this.restraint.user.username,
        banned_time: mins
      }).then((data) => {
        this.getUser()
        this.restraint.dialogVisible = false
        this.$message({
          showClose: true,
          message: data.status,
          type: 'success'
        })
      }, errorMsg => {
        this.restraint.dialogVisible = false
        this.$message({
          showClose: true,
          message: errorMsg,
          type: 'error'
        })
      })
    },
    unban (user) {
      unbanChatUser(this.RECEIVER, {
        user: user
      }).then((data) => {
        this.getUser()
        this.restraint.dialogVisible = false
        this.$message({
          showClose: true,
          message: data.status,
          type: 'success'
        })
      }, errorMsg => {
        this.restraint.dialogVisible = false
        let data = errorMsg.response.data
        this.$message({
          showClose: true,
          message: data.error,
          type: 'error'
        })
      })
    },
    block () {
      blockChatUser(this.RECEIVER, {
        user: this.restraint.user.username
      }).then((data) => {
        this.getUser()
        this.restraint.dialogVisible = false
        this.$message({
          showClose: true,
          message: data.status,
          type: 'success'
        })
      }, errorMsg => {
        this.restraint.dialogVisible = false
        this.$message({
          showClose: true,
          message: errorMsg.response.data.error,
          type: 'error'
        })
      })
    },
    unblock (user) {
      unblockChatUser(this.RECEIVER, {
        user: user
      }).then((data) => {
        this.getUser()
        this.restraint.dialogVisible = false
        this.$message({
          showClose: true,
          message: data.status,
          type: 'success'
        })
      }, errorMsg => {
        this.restraint.dialogVisible = false
        let data = errorMsg.response.data
        this.$message({
          showClose: true,
          message: data.error,
          type: 'error'
        })
      })
    },
    getUser () {
      getChatUser(1).then(response => {
        this.$emit('updateUsers', {banned_users: response.banned_users, block_users: response.block_users})

        if (!response.banned_users.length || !response.block_users.length) {
          this.isBanned = false
          this.isBlocked = false
        }

        let newBannedUsers = response.banned_users.map((member) => member.username)
        let newBlockUsers = response.block_users.map((member) => member.username)

        this.isBanned = newBannedUsers.includes(this.restraint.user.username)
        this.isBlocked = newBlockUsers.includes(this.restraint.user.username)
      })
    }
  },
  watch: {
    'restraint.user.username': function () {
      this.getUser()
    }
  }
}
</script>

<style lang="scss" scoped>
.restraint-dialog {
  min-height: 200px;
  .avatar {
    margin: 0 auto;
    width: 120px;
    height: 120px;
    .img {
      width: 100%;
      height: 100%;
      border-radius: 5px;
    }
  }
}
</style>


