<template>
  <div class="full-height">
    <div class="box full-height">
      <el-container class="full-height login-container">
        <el-header class="login-head text-center m-t-xlg">
          <div class="title">会员登录</div>
        </el-header>
        <el-main class="full-height">
          <div class="login">
            <el-form :model="user" status-icon ref="user" :rules="rules">
              <el-form-item prop="username" label="用户名"  label-width="65px">
                <el-input v-model="user.username"
                          :autofocus="true"
                          class="inp"
                          ref="username">
                </el-input>
              </el-form-item>
              <el-form-item prop="password" label="密码" label-width="65px">
                <el-input v-model="user.password"
                          type="password"
                          ref="password"
                          @keyup.enter.native="submit"
                          class="inp">
                </el-input>
              </el-form-item>
              <transition name="el-fade-in">
                <span class="error" v-if="errorMsg">{{errorMsg}}</span>
              </transition>
              <div class="login-actions">
                <el-form-item>
                  <el-button type="primary" @click="submit">登录</el-button>
                </el-form-item>
                <el-form-item class="m-t guest-actions">
                  <el-button @click.native="$router.push({name: 'Register'})" type="primary" plain>立即注册</el-button>
                </el-form-item>
              </div>
            </el-form>
          </div>
        </el-main>
      </el-container>
    </div>
    <div class="footer">
      <p class="p1">投资有风险，入市须谨慎</p>
      <p>©2018 版权所有</p>
    </div>
  </div>

</template>
<script>
import { register } from '../api'
import { msgFormatter } from '../utils'

export default {
  name: 'login',
  data () {
    return {
      user: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '该栏位必须输入', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '该栏位必须输入', trigger: 'blur' }
        ]
      },
      errorMsg: '',
      clientH: document.documentElement.clientHeight || document.body.clientHeight,
      loading: false
    }
  },
  methods: {
    submit () {
      if (this.loading) {
        return
      }
      if (!this.user.username || !this.user.password) {
        this.$refs.username && this.$refs.username.focus()
        return
      }
      this.loading = true
      this.$store.dispatch('login', {
        user: {
          username: this.user.username,
          password: this.user.password
        }
      }).then(result => {
        const next = this.$route.query.next
        this.$store.dispatch('fetchUser').then(() => {
          this.loading = false
          this.$router.push(next || '/')
        })
      }, errorMsg => {
        this.errorMsg = errorMsg.response.data.message
        this.loading = false
      })
    },
    trial () {
      if (this.loading) {
        return
      }
      this.$refs['user'].clearValidate()
      this.loading = true
      register({visitor: 'True'}).then(visitor => {
        return this.$store.dispatch('login', {
          user: {
            username: visitor.username,
            password: visitor.password
          }
        })
      }).then(result => {
        this.$store.dispatch('fetchUser').then(() => {
          this.loading = false
          this.$router.push('/')
        })
      }, errorMsg => {
        this.$message({
          showClose: true,
          message: msgFormatter(errorMsg),
          type: 'error'
        })
        this.loading = false
      })
    }
  },
  watch: {
    'errorMsg': function () {
      setTimeout(() => {
        this.errorMsg = ''
      }, 3000)
    }
  }
}
</script>
<style lang="scss" scoped>
.box {
  background-image: url('../images/loginBG.jpg');
  background-size: cover;
  height: calc(100% - 60px);
}


.login-container {
  position: relative;
  top: 100px;
  width: 500px;
  height: 400px;
  margin: 0 auto;
  border-radius: 4px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
}

.login-head {
  position: relative;

  .title {
    display: inline-block;
    font-size: 20px;
  }
}


.login {
  padding-left: 60px;
  height: 250px;
  .el-button {
    width: 220px;
  }
}

.el-input {
  width: 220px;
  height: 40px;
}

.login-actions {
  padding-left: 65px;
  .guest-actions {
    display: flex;
    width: 220px;
    justify-content: space-between;
    margin-bottom: 25px;
  }
}

.error {
  display: block;
  font-size: 13px;
  padding-left: 65px;
  color: red;
}

.footer {
  height: 60px;
  background: #4a4a4a;
  p {
    text-align: center;
    color: #fff;
  }
  .p1 {
    padding: 10px 0;
  }
}
</style>
