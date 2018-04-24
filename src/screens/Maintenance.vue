<template>
  <div class="maintenance">
    <div class="box">
      <p class="title">503</p>
      <p class="contact text-center">维修中, 请稍后再访问页面</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Maintenance'
}
</script>

<style lang="scss" scoped>
.maintenance {
  display: flex;
  font-family: Futura, Helvetica, sans-serif, Arial;
  height: 100%;
  justify-content: center;
  align-items: center;

  .title {
    display: block;
    width: 100%;
    height: 144px;
    letter-spacing: 2px;
    font-size: 144px;
    color: #1976D2;
  }

  .contact {
    font-size: 24px;
    color: #4a4a4a;
  }
}
</style>
