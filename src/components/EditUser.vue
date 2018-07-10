<template>
  <div class="edit-container">
    <el-form :model="member"
      v-if="member.username"
      status-icon
      class="info-area"
      ref="editUser">
      <div class="text-center m-b">
        <img class="avatar-img" :src="member.avatar || defaultAvatar" :alt="member.username">
      </div>
      <el-form-item label="用户名" label-width="85px">
        <span class="member-info">{{member.username}}</span>
      </el-form-item>
      <el-form-item label="昵称" label-width="85px">
        <p class="member-info">{{member.nickname ? member.nickname : ''}}</p>
      </el-form-item>
      <el-form-item label="是否在线" label-width="85px">
        <p class="member-info">{{member.logined | whether}}</p>
      </el-form-item>
      <el-form-item label="是否禁言" label-width="85px">
        <p class="member-info">
          {{isBanned | whether}}
          <el-button type="danger" class="restraint-button" v-if="isBanned" @click.native="unban(member.username, roomId)">解除禁言</el-button>
          <el-button type="danger" class="restraint-button" v-if="!isBanned" @click.native="ban(15, roomId)">禁言15分钟</el-button>
          <el-button type="danger" class="restraint-button" v-if="!isBanned" @click.native="ban(30, roomId)">禁言30分钟</el-button>
        </p>
      </el-form-item>
      <el-form-item label="是否拉黑" label-width="85px">
        <p class="member-info">
          {{isBlocked | whether}}
          <el-button type="danger" class="restraint-button" v-if="!isBlocked" @click.native="block(roomId)">加入黑名单</el-button>
          <el-button type="danger" class="restraint-button" v-if="isBlocked" @click.native="unblock(member.username, roomId)">解除拉黑</el-button>
        </p>
      </el-form-item>
      <el-form-item label="备注" label-width="85px">
        <el-input
          type="textarea"
          :rows="2"
          @input="check"
          placeholder="请输入内容"
          v-model="member.remarks">
        </el-input>
      </el-form-item>
      <el-form-item label-width="85px">
        <div v-if="changed.message" class="green">{{changed.message}}</div>
        <el-button class="profile-submit"
          type="primary"
          @click.native="updateMember"
          :autosize="true"
          :disabled="!changed.result && !loading">
          修改备注
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { banChatUser, blockChatUser, unbanChatUser, unblockChatUser, fetchMember, updateMember, getChatUser } from '../api'
import { msgFormatter } from '../utils'

export default {
  props: {
    userId: {
      type: Number
    }
  },
  data () {
    return {
      member: {
        remarks: '',
        banned: false,
        is_blocked: false,
        logined: false
      },
      changed: {
        message: '',
        oldContent: '',
        result: false
      },
      defaultAvatar: require('../assets/avatar.png'),
      loading: false,
      isBanned: false,
      isBlocked: false
    }
  },
  filters: {
    whether: function (val) {
      return val ? '是' : '否'
    }
  },
  methods: {
    getUser (roomId) {
      getChatUser(roomId || this.roomId).then(response => {
        if (!response.banned_users.length || !response.block_users.length) {
          this.isBanned = false
          this.isBlocked = false
        }
        let newBannedUsers = response.banned_users.map((member) => member.username)
        let newBlockUsers = response.block_users.map((member) => member.username)
        this.isBanned = newBannedUsers.includes(this.member.username)
        this.isBlocked = newBlockUsers.includes(this.member.username)
      })
    },
    ban (mins, roomId) {
      banChatUser(roomId, {
        user: this.member.username,
        banned_time: mins
      }).then((data) => {
        this.getUser()
        this.$message({
          showClose: true,
          message: data.status,
          type: 'success'
        })
      }, errorMsg => {
        this.$message({
          showClose: true,
          message: errorMsg,
          type: 'error'
        })
      })
    },
    unban (user, roomId) {
      unbanChatUser(roomId, {
        user: user
      }).then((data) => {
        this.getUser()

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
    block (roomId) {
      blockChatUser(roomId, {
        user: this.member.username
      }).then((data) => {
        this.getUser()
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
    unblock (user, roomId) {
      unblockChatUser(roomId, {
        user: user
      }).then((data) => {
        this.getUser()
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
    fetchMember () {
      this.loading = true

      fetchMember(this.userId).then(res => {
        this.changed.oldContent = res.remarks
        this.member = res
        this.loading = false
        this.getUser()
      }, err => {
        this.$message({
          message: msgFormatter(err),
          type: 'error'
        })
        this.$emit('memberDialogClose')
      })
    },
    updateMember () {
      this.loading = true
      updateMember(this.userId, this.member.remarks).then(res => {
        this.loading = false
        this.changed.oldContent = res.remarks
        this.changed.result = false
        this.changed.message = '修改成功'
      }, err => {
        this.changed.message = err.message
      })
    },
    check () {
      this.changed.result = (this.member.remarks !== this.oldContent)
    },
    init () {
      this.member = {
        remarks: ''
      }
      this.changed = {
        message: '',
        oldContent: '',
        result: false
      }
      this.loading = false
    }
  },
  computed: {
    roomId () {
      return this.$store.state.user.default_room_id
    }
  },
  watch: {
    'changed.message': function () {
      if (this.changed.message) {
        setTimeout(() => {
          this.changed.message = ''
        }, 3000)
      }
    }
  },
  created () {
    this.fetchMember()
  },
  beforeDestroy () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.edit-container {
  min-height: 400px;
  padding: 20px;
}
.info-area {
  width: 300px;
  margin: 0 auto;
}
.avatar-img {
  width: 70px;
  height: 70px;
  border: 1px solid #c8d4e4;
  border-radius: 50%;
}

.member-info {
  color: #999;
}

.restraint-button {
  padding: 5px;
  margin-left: 10px;
}
</style>
