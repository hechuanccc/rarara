<template>
  <div class="full-height" v-loading="$store.state.loading">
    <router-view />
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
    window.addEventListener('resize', this.resizeHeight)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resizeHeight)
  }
}
</script>
