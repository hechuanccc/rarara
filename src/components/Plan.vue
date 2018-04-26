<template>
  <div class="plan">
    <el-tabs
      v-model="activeGame"
      v-loading="!gameList.length"
      @tab-click="changeGame"
      type="card"
      >
      <el-tab-pane
        :label="g.display_name"
        :name="`${i}`"
        :key="g.id"
        v-loading="loading"
        element-loading-background="rgba(0, 0, 0, 0)"
        v-for="(g, i) in gameList"
        >
      <div class="full-height">
        <div class="scheme">
          <ul>
            <li
              :key="s.id"
              v-for="(s, i) in schemeList"
            >
              <el-button
                type="text"
                :class="{'is-active': i === activeScheme}"
                @click="changeScheme(i)"
              >
                {{ s.display_name }}
              </el-button>
            </li>
          </ul>
        </div>
        <div
          class="prediction"
          :style="{
            height: `calc(100% - ${(schemeList.length-1) * 8 + 10}px)`
          }"
        >
          <div class="prediction-container">
            <p class="text" v-for="p in prediction" :key="p.id">
              {{ `${p.issue_numbers} ${p.scheme}  ( ${p.numbers_predicted} ) ${(p.result && p.result.draw_result.length) ? `${p.result.draw_result || ''}` : ''}` }}
            </p>
            <p class="text" v-if="!(loading || prediction.length )">暂无资料</p>
            <p class="scroll-trigger" :ref="`prediction${i}`"></p>
          </div>
        </div>
      </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { fetchGame, fetchPlan } from '../api'

export default {
  data () {
    return {
      loading: false,
      gameList: [],
      schemeList: [],
      activeGame: '0',
      activeScheme: 0,
      prediction: [],
      plan: 0,
      planTimer: undefined
    }
  },
  watch: {
    activeGame (newObj, old) {
      if (newObj !== old && this.gameList.length) {
        this.activeScheme = 0
        this.schemeList = this.getScheme(this.gameList[newObj])
        this.setPlanTimer(this.gameList[this.activeGame].plans[this.plan])
      }
    }
  },
  created () {
    fetchGame().then(res => {
      this.gameList = res.filter(g => g.plans.length)
      if (this.gameList.length) {
        let firstGamePlan = this.gameList[0].plans[this.plan]
        this.schemeList = this.getScheme(this.gameList[0])
        this.setPlanTimer(firstGamePlan)
      }
    })
  },
  methods: {
    fetchPlan (gamePlan, toEnd = false) {
      this.loading = true
      let plan = gamePlan.code || ''
      let scheme = gamePlan.schemes[this.activeScheme].code || ''
      fetchPlan({ plan, scheme }).then(res => {
        this.prediction = res.results

        toEnd && this.toEnd()
        this.loading = false
      }, () => {
        this.loading = false
      })
    },
    changeGame () {
      this.prediction = []
    },
    changeScheme (scheme) {
      this.prediction = []
      this.activeScheme = scheme
      this.setPlanTimer(this.gameList[this.activeGame].plans[this.plan])
    },
    getScheme (game) {
      return game.plans[this.plan].schemes
    },
    toEnd () {
      this.$nextTick(() => {
        if (this.$refs[`prediction${this.activeGame}`].length) {
          this.$refs[`prediction${this.activeGame}`][0].scrollIntoView({
            block: 'end'
          })
        }
      })
    },
    setPlanTimer (plan) {
      this.fetchPlan(plan, true)
      if (this.planTimer) {
        clearInterval(this.planTimer)
      }
      this.planTimer = setInterval(() => {
        this.fetchPlan(plan)
      }, 20 * 1000)
    }
  },
  beforeDestroy () {
    if (this.planTimer) {
      clearInterval(this.planTimer)
    }
  }
}
</script>


<style lang="scss">
.plan {
  .el-tabs__nav-scroll > .el-tabs__nav {
    width: auto;
    min-width: 100%;
    height: 50px;
    border: none;
    text-align: center;

    .el-tabs__item {
      height: 25px;
      line-height: 20px;
      color: white;
      font-size: 14px;
      padding: 3px 6px 5px 6px;
      margin: 10px 5px;
      border: 0;
      border-radius: 4px;
      transition: all .3s ease-in-out;

      &.is-active {
        background: #4a96f3;
      }

      &:hover:not(.is-active){
        background: #9b9b9b;
      }
    }
  }
  .el-tabs__header {
    background: rgba(0, 0, 0, 0.2);
    margin: 0;

    .el-tabs__nav-next, .el-tabs__nav-prev {
      width: 20px;
      line-height: 50px;
      i {
        font-size: 16px;
        color: white;
      }
      &:hover {
        i {
          color: #999;
        }
      }
    }
  }

  .el-tabs__content {
    height: calc(100% - 90px);
  }

  .el-tab-pane {
    height: 100%;
  }

  .el-tabs--card>.el-tabs__header .el-tabs__nav {
    border: none;
  }

}

</style>

<style lang="scss" scoped>
.plan {
  color: white;
  height: 100%;

  .scheme {
    padding: 0 50px;
    background: #383838;
    color: #9b9b9b;
    li {
      display: inline-block;
      width: 20%;
      height: 40px;
      line-height: 40px;
      text-align: center;
      button {
        color: #9b9b9b;
        font-size: 14px;
        border: none;
      }
      button:hover {
        color: #c5c4c4;
      }
      button.is-active {
        border: none;
        color: white;
      }
    }
  }

  .prediction {
    overflow-y: hidden;

    .prediction-container {
      height: 100%;
      padding-left: 10px;
      padding-right: 10px;
      overflow: auto;
    }

    .text {
      line-height: 1.8;
      font-weight: 300;
      font-size: 14px;
    }

    .scroll-trigger {
      font-size: 0;
    }
  }
}

</style>
