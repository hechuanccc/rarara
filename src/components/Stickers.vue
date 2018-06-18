<template>
  <div>
    <el-carousel ref="stickerCarousel"
      v-loading="loading"
      indicator-position="none"
      arrow="never"
      height="250px"
      :autoplay="false"
      class="stickers-packs">
      <el-carousel-item v-for="(sticker, index) in stickerGroups"
        :name="sticker.name"
        :key="index">
        <ul class="sticker-container">
          <li class="sticker-pack m-l m-r m-t"
            v-for="(item, index) in stickers[sticker.name]"
            :key="index">
            <img class="sticker-img pointer"
              @click="sendSticker(item.id, chat.current.roomId)"
              :src="item.url"
              :alt="index"/>
          </li>
        </ul>
      </el-carousel-item>
     </el-carousel>
     <div class="indicators">
        <div :class="['indicator','pointer', {active: nowSticker === sticker.name}]"
          @click="switchStickers(sticker.name)"
          v-for="(sticker, index) in stickerGroups"
          :key="index">
          <img class="img" v-if="sticker.logo" :src="sticker.logo" alt="sticker.logo"/>
          <span class="text" v-else>{{sticker.display_name | truncate(3)}}</span>
        </div>
     </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import { fetchStickers } from '../api'

Vue.filter('truncate', function (text, stop) {
  return text.slice(0, stop) + (stop < text.length ? '...' : '')
})

export default {
  data () {
    return {
      loading: false,
      stickers: {},
      nowSticker: ''
    }
  },
  computed: {
    ...mapState([
      'stickerGroups',
      'chat',
      'ws'
    ])
  },
  methods: {
    getStickers (stickerName) {
      this.loading = true
      fetchStickers(stickerName).then((res) => {
        this.$set(this.stickers, stickerName, res[stickerName])

        localStorage.setItem('stickers', JSON.stringify(this.stickers))
        this.loading = false
      })
    },
    switchStickers (name) {
      if (this.loading) {
        return
      }

      this.$refs.stickerCarousel.setActiveItem(name)
      this.nowSticker = name

      let gotSticker = localStorage.getItem('stickers')
      let formattedGotSticker = JSON.parse(gotSticker)

      if (gotSticker && formattedGotSticker[name]) {
        this.$set(this.stickers, name, formattedGotSticker[name])
      } else {
        this.getStickers(name)
      }
    },
    sendSticker (stickerId, receiver) {
      if (!this.ws) {
        this.joinChatRoom()
      }
      this.ws.send(JSON.stringify({
        command: 'send',
        receivers: [receiver],
        type: 7,
        sticker: stickerId
      }))
      this.$emit('sendSticker')
    }
  },
  mounted () {
    let firstStickerName = this.stickerGroups[0].name
    let gotSticker = localStorage.getItem('stickers')
    let formattedGotSticker = JSON.parse(gotSticker)
    this.nowSticker = firstStickerName

    if (gotSticker && formattedGotSticker[firstStickerName]) {
      this.stickers[firstStickerName] = formattedGotSticker[firstStickerName]
    } else {
      this.getStickers(firstStickerName)
    }
  }
}
</script>

<style lang="scss" scoped>
.indicators {
  height: 50px;
  background: #ddd;
  .indicator {
    box-sizing: border-box;
    display: inline-block;
    width: 50px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    &.active {
      background: white;
    }
    &:hover {
      background: rgba(0, 0, 0, .1);
    }
    .text {
      font-size: 12px;
    }
  }
  .img {
    width: 35px;
    height: 35px;
    padding-top: 10px;
  }
}
.sticker-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  height: 250px;
  overflow: auto;
}
.sticker-pack {
  width: 70px;
  height: 70px;
  .sticker-img {
    width: 100%;
    height: 100%;
  }
}
</style>
