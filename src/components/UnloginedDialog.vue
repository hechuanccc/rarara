<template>
  <div>
    <el-tabs v-model="unloginedDialog.status" type="card">
      <el-tab-pane label="登入" name="Login">
        <div class="login">
          <Login></Login>
        </div>
      </el-tab-pane>
      <el-tab-pane label="注册" name="Register">
        <Register></Register>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Login from './Login'
import Register from './Register'

export default {
  components: {
    Login,
    Register
  },
  computed: {
    ...mapState([
      'unloginedDialog'
    ])
  }
}
</script>
