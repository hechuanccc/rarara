<template>
  <div class="box" style="height: 100%">
    <div class="bg-container" :style="{height: clientH - 68 + 'px'}">
      <div class="login-container">
         <el-container>
           <el-header class="login-head">
             <div class="title">会员登录</div>
             <el-button type="warning" class="kf">客服中心</el-button>
           </el-header>
           <el-main>
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
                             class="inp">
                   </el-input>
                 </el-form-item>
                 <div class="login-actions">
                   <el-form-item>
                     <el-button type="primary" @click="submit">登录</el-button>
                   </el-form-item>
                   <div class="forgot-password">
                     <a  target="_blank" >忘记密码?</a>
                   </div>
                 </div>
               </el-form>
               <div class="register">
                <div class="tip">还没有账号？</div>
                <router-link to="/register"><el-button type="primary" plain>立即注册</el-button></router-link>
               </div>

               <transition name="el-fade-in">
                 <span class="error" v-if="errorMsg">{{errorMsg}}</span>
               </transition>
             </div>
           </el-main>
         </el-container>
      </div>
    </div>
    <div class="footer">
      <p class="p1">投资有风险，入市须谨慎</p>
      <p>©2017 至尊开奖直播版权所有</p>
    </div>
  </div>

</template>
<script>
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
        this.errorMsg = errorMsg.response.data.error
      })
    }
  },
  components: {
  }
}
</script>
<style lang="scss" scoped>
.box {
  background: #4a4a4a;
}
.bg-container {
    background-image: url('../images/loginBG.jpg');
    background-size: cover;
    position: relative;
}
.login-container {
   width: 500px;
   border-radius: 4px;
   background-color: #ffffff;
   box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
   position:absolute;
   top:50%;
   left:50%;
   transform:translate(-50%,-50%);
}

.login-head {
  margin-top: 20px;
  text-align: center;
  .title {
    margin-left: 25%;
    line-height: 40px;
    display: inline-block;
    font-size: 20px;
    span {
      color: #9b9b9b;
    }
  }
  .kf {
    float: right;
    width: 100px;
    height: 40px;
    border-radius: 2px;
    background-color: #f57723;
  }
}


.login {
  padding-left: 60px;
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
  text-align: center;
  color: red;
}
.footer {
  p {
    text-align: center;
    color: #fff;
  }
  .p1 {
    padding-top: 14px;
  }
}
</style>
