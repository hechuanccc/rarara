<template>
  <div class="full-height">
    <div class="box full-height">
         <el-container class="full-height login-box login-container">
           <el-header class="login-head">
             <div class="title">会员登录</div>
             <!-- <a :href="$store.state.globalPreference.customer_service_url" target="_blank" class="service">客服中心</a> -->
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
                   <div class="m-t">
                     <el-button @click.native="trial" type="primary" plain>游客试玩</el-button>
                   </div>
                 </div>
               </el-form>
               <div class="register">
                <div class="tip">还没有账号？</div>
                <router-link to="/register"><el-button type="primary" plain>立即注册</el-button></router-link>
               </div>
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
      clientH: document.documentElement.clientHeight || document.body.clientHeight
    }
  },
  methods: {
    submit () {
      if (!this.user.username || !this.user.password) {
        this.$refs.username && this.$refs.username.focus()
        return
      }
      this.$store.dispatch('login', {
        user: {
          username: this.user.username,
          password: this.user.password
        }
      }).then(result => {
        this.$store.dispatch('fetchUser')
        const next = this.$route.query.next
        this.$router.push(next || '/')
      }, errorMsg => {
        this.errorMsg = errorMsg.response.data.message
      })
    },
    trial () {
      register({visitor: 'True'}).then(visitor => {
        return this.$store.dispatch('login', {
          user: {
            username: visitor.username,
            password: visitor.password
          }
        })
      }).then(result => {
        this.$store.dispatch('fetchUser').then(() => {
          this.$router.push('/')
        })
      }, errorMsg => {
        this.$message({
          showClose: true,
          message: msgFormatter(errorMsg),
          type: 'error'
        })
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
  margin-top: 20px;
  text-align: center;
  .title {
    display: inline-block;
    line-height: 40px;
    font-size: 20px;
    span {
      color: #9b9b9b;
    }
  }
  .service {
    display: inline-block;
    right: 15px;
    top: 20px;
    width: 100px;
    height: 40px;
    line-height: 40px;
    border-radius: 2px;
    font-size: 14px;
    font-weight: 500;
    background-color: #f57723;
    color: #ffffff;
  }
}


.login {
  padding-left: 60px;
  height: 250px;
  .el-button {
    width: 220px;
  }
}
.register {
  .tip {
    color: #999;
    width: 220px;
    text-align: center;
    margin: 20px 0 10px;
  }
  margin-bottom: 30px;
  padding-left: 65px;
}
.el-input {
  width: 223px;
  height: 40px;
}

.forgot-password {
  display: inline-block;
  width: 223px;
  text-align: left;
  position: relative;
  bottom: 20px;
  margin-top: 20px;
  a {
    font-size: 14px;
    color: #4a90e2;
    font-weight: 500;
    text-decoration: none;
  }
}

.login-actions {
  padding-left: 65px;
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
