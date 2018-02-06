<template>
  <div v-loading.fullscreen="$store.state.loading" element-loading-text="加载中...">
    <div :style="{height: bodyHeight + 'px'}">
      <router-view />
    </div>
  </div>
</template>

<script>
import './style/reset.css'
import './style/base.scss'

export default {
  name: 'app',
  data () {
    return {
      bodyHeight: document.documentElement.clientHeight || document.body.clientHeight
    }
  },
  methods: {
    resizeHeight () {
      this.bodyHeight = document.documentElement.clientHeight || document.body.clientHeight
    }
  },
  created () {
    const version = this.$route.query.desktop
    if (version === '1' && this.$cookie.desktop !== '1') {
      this.$cookie.set('desktop', version)
      window.location.reload()
    }
    window.addEventListener('resize', this.resizeHeight)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resizeHeight)
  }
}
</script>
