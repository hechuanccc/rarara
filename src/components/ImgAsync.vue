<template>
  <img :src="src" alt="" />
</template>

<script>
export default {
  props: {
    src: {
      type: String
    }
  },
  mounted () {
    const img = this.$el
    if (!img.complete) {
      this.$emit('imgStart')
      img.onload = () => {
        this.$emit('imgLoad')
      }
      img.onerror = () => {
        this.$emit('imgLoad')
      }
    }
  }
}
</script>

