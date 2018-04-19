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
              >{{ s.display_name }}
              </el-button>
            </li>
          </ul>
        </div>
        <div class="m-a prediction">
          <p v-for="p in prediction" :key="p.id">
            {{ `${p.issue_numbers} ${p.scheme}  ( ${p.numbers_predicted} ) ${(p.result && p.result.draw_result.length) ? p.result.draw_result.join(', ') : ''}` }}
          </p>
          <p v-if="!(loading || prediction.length )">暂无资料</p>
          <p :ref="`prediction${i}`"></p>
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
        this.prediction = res
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

<style lang="scss" scoped>
.plan {
  color: white;
  height: calc(100% - 40px);

  /deep/.el-tabs__nav {
    border: none;
    text-align: center;
    width: auto;
    min-width: 100%;
    height: 45px;
    .el-tabs__item {
      height: 25px;
      font-size: 14px;
      color: white;
      line-height: 20px;
      padding: 3px 6px 5px 6px;
      margin: 10px 5px;
      border: 0;
      border-radius: 4px;
      transition: all .3s ease-in-out;

      &.is-active {
        background: #4a96f3;
      }

      &:hover:not(.is-active){
        background: #9b9b9b
      }
    }
  }

  /deep/.el-tabs__header {
    background: rgba(0, 0, 0, 0.2);
    margin: 0;

    .el-tabs__nav-next, .el-tabs__nav-prev {
      width: 20px;
      line-height: 50px;
      i {
        font-size: 16px;
        color: white;
      }
    }
  }

  /deep/.el-tabs__content {
    height: calc(100% - 40px);
  }

  /deep/.el-tab-pane {
    height: 100%;
  }

  .scheme {
    padding: 0 50px;
    height: 80px;
    text-align: center;
    background: #383838;
    color: #9b9b9b;
    li {
      float: left;
      position: relative;
      width: 55px;
      height: 40px;
      line-height: 40px;
      button {
        color: #9b9b9b;
        font-size: 14px;
      }
      button:hover {
        color: #c5c4c4;
      }
      button.is-active {
        color: white;
      }
    }
  }

  .prediction {
    height: calc(100% - 110px);
    overflow-y: auto;
    p {
      line-height: 1.8;
      font-weight: 300;
      font-size: 14px;
    }
  }
}
</style>

